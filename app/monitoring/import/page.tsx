"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { supabase } from "../../../lib/supabase";
import NavBar from "../../../components/NavBar";

function clean(value: any) {
  return value?.toString().trim() || "";
}

function parseDate(value: any) {
  const raw = clean(value);
  if (!raw) return null;

  const date = new Date(raw);
  if (isNaN(date.getTime())) return null;

  return date.toISOString().split("T")[0];
}

function parseTimestamp(value: any) {
  const raw = clean(value);
  if (!raw) return null;

  const date = new Date(raw);
  if (isNaN(date.getTime())) return null;

  return date.toISOString();
}

function extractBrandAndProduct(clipName: string) {
  const cleaned = clean(clipName);

  if (!cleaned) {
    return {
      advertiser: "",
      brandName: "",
      productName: "",
    };
  }

  const parts = cleaned.split(" - ");

  if (parts.length >= 2) {
    return {
      advertiser: parts[0].trim(),
      brandName: parts[0].trim(),
      productName: parts.slice(1).join(" - ").trim(),
    };
  }

  return {
    advertiser: cleaned,
    brandName: cleaned,
    productName: "",
  };
}

export default function MonitoringImporter() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function getOrCreateBrand(brandName: string) {
    if (!brandName) return null;

    const { data: existingBrand } = await supabase
      .from("brands")
      .select("*")
      .eq("name", brandName)
      .maybeSingle();

    if (existingBrand) return existingBrand.id;

    const { data: newBrand } = await supabase
      .from("brands")
      .insert([
        {
          name: brandName,
          industry: "Unknown",
          country: "Unknown",
        },
      ])
      .select()
      .single();

    return newBrand?.id || null;
  }

  async function getOrCreateProduct(
    productName: string,
    brandId: string | null
  ) {
    if (!productName) return null;

    const { data: existingProduct } = await supabase
      .from("products")
      .select("*")
      .eq("name", productName)
      .maybeSingle();

    if (existingProduct) return existingProduct.id;

    const { data: newProduct } = await supabase
      .from("products")
      .insert([
        {
          name: productName,
          product_type: "Advertised Product",
          category: "Unknown",
          description: "Auto-created from TV monitoring clip metadata.",
          brand_id: brandId,
        },
      ])
      .select()
      .single();

    return newProduct?.id || null;
  }

  async function ensureRelationship(
    sourceType: string,
    sourceId: string | null,
    targetType: string,
    targetId: string | null,
    relationshipType: string,
    description: string
  ) {
    if (!sourceId || !targetId) return;

    const { data: existingRelationship } = await supabase
      .from("entity_relationships")
      .select("id")
      .eq("source_type", sourceType)
      .eq("source_id", sourceId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .eq("relationship_type", relationshipType)
      .maybeSingle();

    if (existingRelationship) return;

    await supabase.from("entity_relationships").insert([
      {
        source_type: sourceType,
        source_id: sourceId,
        target_type: targetType,
        target_id: targetId,
        relationship_type: relationshipType,
        description,
      },
    ]);
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
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

          let imported = 0;
          let skipped = 0;
          let linked = 0;

          for (const row of rows) {
            const networkExternalId = clean(row["NETWORK ID"]);
            const networkName = clean(row["NETWORK NAME"]);
            const programName = clean(row["PROGRAM NAME"]);
            const programStartTime = clean(row["PROGRAM START TIME"]);
            const programDuration = clean(row["PROGRAM DURATION"]);
            const spotCode = clean(row["AD POD / SPOT CODE"]);
            const spotDate = clean(row["SPOT DATE"]);
            const spotTime = clean(row["SPOT TIME"]);
            const timezone = clean(row["TMZ"]);
            const spotLength = clean(row["SPOT LENGHT"]);
            const clipExternalId = clean(row["CLIP ID"]);
            const clipName = clean(row["CLIP NAME"]);
            const spotType = clean(row["SPOT TYPE"]);
            const details = clean(row["DETAILS"]);

            const extracted = extractBrandAndProduct(clipName);

            if (!networkName || !clipName || !clipExternalId) {
              skipped++;
              continue;
            }

            const brandId = await getOrCreateBrand(extracted.brandName);
            const productId = await getOrCreateProduct(
              extracted.productName,
              brandId
            );

            if (brandId && productId) {
              await ensureRelationship(
                "brand",
                brandId,
                "product",
                productId,
                "has_product",
                `${extracted.brandName} has product ${extracted.productName}`
              );

              linked++;
            }

            const { data: existingNetwork } = await supabase
              .from("networks")
              .select("*")
              .eq("network_id", networkExternalId)
              .maybeSingle();

            let networkId = existingNetwork?.id;

            if (!networkId) {
              const { data: newNetwork } = await supabase
                .from("networks")
                .insert([
                  {
                    network_id: networkExternalId,
                    network_name: networkName,
                  },
                ])
                .select()
                .single();

              networkId = newNetwork?.id;
            }

            let programId = null;

            if (programName) {
              const { data: existingProgram } = await supabase
                .from("programs")
                .select("*")
                .eq("network_id", networkId)
                .eq("program_name", programName)
                .maybeSingle();

              if (existingProgram) {
                programId = existingProgram.id;
              } else {
                const { data: newProgram } = await supabase
                  .from("programs")
                  .insert([
                    {
                      network_id: networkId,
                      program_name: programName,
                      start_time: parseTimestamp(programStartTime),
                      duration: programDuration || null,
                    },
                  ])
                  .select()
                  .single();

                programId = newProgram?.id;
              }
            }

            const { data: existingClip } = await supabase
              .from("clips")
              .select("*")
              .eq("clip_id", clipExternalId)
              .maybeSingle();

            let clipId = existingClip?.id;

            if (!clipId) {
              const { data: newClip } = await supabase
                .from("clips")
                .insert([
                  {
                    clip_id: clipExternalId,
                    clip_name: clipName,
                    clip_type: spotType,
                    advertiser: extracted.advertiser || null,
                    brand_name: extracted.brandName || null,
                    product_name: extracted.productName || null,
                    brand_id: brandId,
                    product_id: productId,
                    details_url: details || null,
                  },
                ])
                .select()
                .single();

              clipId = newClip?.id;
            } else {
              await supabase
                .from("clips")
                .update({
                  advertiser:
                    existingClip.advertiser || extracted.advertiser || null,
                  brand_name:
                    existingClip.brand_name || extracted.brandName || null,
                  product_name:
                    existingClip.product_name || extracted.productName || null,
                  brand_id: existingClip.brand_id || brandId,
                  product_id: existingClip.product_id || productId,
                })
                .eq("id", clipId);
            }

            const { data: existingSpot } = await supabase
              .from("ad_spots")
              .select("id")
              .eq("clip_id", clipId)
              .eq("network_id", networkId)
              .eq("spot_date", parseDate(spotDate))
              .eq("spot_time", spotTime)
              .maybeSingle();

            if (existingSpot) {
              skipped++;
              continue;
            }

            await supabase.from("ad_spots").insert([
              {
                network_id: networkId,
                program_id: programId,
                clip_id: clipId,
                spot_code: spotCode || null,
                spot_date: parseDate(spotDate),
                spot_time: spotTime || null,
                timezone: timezone || null,
                spot_length: spotLength || null,
                spot_type: spotType || null,
                raw_row: row,
              },
            ]);

            imported++;
          }

          setMessage(
            `Monitoring import complete. Imported spots: ${imported}, skipped: ${skipped}, linked graph entities: ${linked}.`
          );
        } catch (error) {
          console.error(error);
          setMessage("Monitoring import failed.");
        }

        setUploading(false);
      },
    });
  }

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-black text-white p-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-6xl font-bold mb-4">
              Monitoring Importer
            </h1>

            <p className="text-gray-400 text-lg">
              Upload TV ad monitoring data. The importer extracts advertiser,
              brand and product names, then links clips to graph entities.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-200 transition"
            >
              Upload Monitoring CSV
            </button>

            {uploading && (
              <div className="mt-6 text-yellow-400">
                Importing monitoring data and linking graph entities...
              </div>
            )}

            {message && (
              <div className="mt-6 rounded-xl bg-green-500/20 border border-green-500/30 p-4 text-green-300">
                {message}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}