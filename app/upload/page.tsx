"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { supabase } from "../../lib/supabase";
import NavBar from "../../components/NavBar";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: async (results: Papa.ParseResult<any>) => {
        try {
          const rows = results.data as any[];
          let validRows = 0;
          let skippedRows = 0;

          const { data: batch } = await supabase
            .from("import_batches")
            .insert([
              {
                filename: file.name,
                source: "manual_csv_upload",
                status: "processing",
                rows_total: rows.length,
              },
            ])
            .select()
            .single();

          for (const row of rows) {
            const brandName = row.brand?.trim();
            const campaignName = row.campaign_name?.trim();

            if (!brandName || !campaignName) {
              skippedRows++;
              continue;
            }

            const { data: brands } = await supabase
              .from("brands")
              .select("*");

            let existingBrand = brands?.find(
              (brand: any) =>
                normalizeText(brand.name) === normalizeText(brandName)
            );

            let brandId = existingBrand?.id;

            if (!brandId) {
              const { data: newBrand } = await supabase
                .from("brands")
                .insert([
                  {
                    name: brandName,
                    industry: row.industry?.trim() || null,
                    country: row.country?.trim() || null,
                  },
                ])
                .select()
                .single();

              brandId = newBrand?.id;
            }

            const { data: brandCampaigns } = await supabase
              .from("campaigns")
              .select("*")
              .eq("brand_id", brandId);

            const existingCampaign = brandCampaigns?.find(
              (campaign: any) =>
                normalizeText(campaign.name) === normalizeText(campaignName)
            );

            if (existingCampaign) {
              skippedRows++;
              continue;
            }

            const { data: campaign } = await supabase
              .from("campaigns")
              .insert([
                {
                  brand_id: brandId,
                  name: campaignName,
                  objective: row.objective?.trim() || null,
                },
              ])
              .select()
              .single();

            await supabase.from("timeline_events").insert([
              {
                brand_id: brandId,
                campaign_id: campaign?.id,
                event_type: "campaign_launched",
                title: `${brandName} launched ${campaignName}`,
                description: `Campaign objective: ${
                  row.objective?.trim() || "Unknown"
                }`,
                event_date: new Date().toISOString(),
              },
            ]);

            validRows++;
          }

          await supabase
            .from("import_batches")
            .update({
              status: "completed",
              rows_valid: validRows,
              rows_failed: skippedRows,
            })
            .eq("id", batch?.id);

          setMessage(
            `CSV uploaded successfully. Imported: ${validRows}, skipped: ${skippedRows}.`
          );
        } catch (error) {
          console.error(error);
          setMessage("Upload failed.");
        }

        setUploading(false);
      },
    });
  }

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-black text-white flex items-center justify-center p-10">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10">
          <h1 className="text-5xl font-bold mb-3">CSV Upload Center</h1>

          <p className="text-gray-400 mb-10">
            Upload advertising intelligence feeds into AdGraph.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-200 transition"
          >
            Upload CSV File
          </button>

          {uploading && (
            <div className="mt-6 text-yellow-400">
              Uploading and processing data...
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl bg-green-500/20 border border-green-500/30 p-4 text-green-300">
              {message}
            </div>
          )}
        </div>
      </main>
    </>
  );
}