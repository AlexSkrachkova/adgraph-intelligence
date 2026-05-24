"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { supabase } from "../../../lib/supabase";
import NavBar from "../../../components/NavBar";

function clean(value: string) {
  return value?.trim();
}

export default function RelationshipImporter() {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function relationshipExists(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string,
    relationshipType: string
  ) {
    const { data } = await supabase
      .from("entity_relationships")
      .select("id")
      .eq("source_type", sourceType)
      .eq("source_id", sourceId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .eq("relationship_type", relationshipType)
      .maybeSingle();

    return !!data;
  }

  async function insertRelationshipIfMissing(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string,
    relationshipType: string,
    description?: string
  ) {
    const exists = await relationshipExists(
      sourceType,
      sourceId,
      targetType,
      targetId,
      relationshipType
    );

    if (exists) return false;

    await supabase.from("entity_relationships").insert([
      {
        source_type: sourceType,
        source_id: sourceId,
        target_type: targetType,
        target_id: targetId,
        relationship_type: relationshipType,
        description: description || null,
      },
    ]);

    return true;
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

          let createdRelationships = 0;
          let skippedRelationships = 0;

          for (const row of rows) {
            const companyName = clean(row.company);
            const brandName = clean(row.brand);
            const productName = clean(row.product);
            const productType = clean(row.product_type);
            const category = clean(row.category);
            const audienceName = clean(row.audience);
            const campaignName = clean(row.campaign);
            const note = clean(row.relationship_note);

            if (!companyName || !brandName || !productName || !audienceName) {
              skippedRelationships++;
              continue;
            }

            let companyId: string;

            const { data: existingCompany } = await supabase
              .from("companies")
              .select("*")
              .eq("name", companyName)
              .maybeSingle();

            if (existingCompany) {
              companyId = existingCompany.id;
            } else {
              const { data: newCompany } = await supabase
                .from("companies")
                .insert([
                  {
                    name: companyName,
                    industry: category || "Unknown",
                  },
                ])
                .select()
                .single();

              companyId = newCompany.id;
            }

            let brandId: string;

            const { data: existingBrand } = await supabase
              .from("brands")
              .select("*")
              .eq("name", brandName)
              .maybeSingle();

            if (existingBrand) {
              brandId = existingBrand.id;
            } else {
              const { data: newBrand } = await supabase
                .from("brands")
                .insert([
                  {
                    name: brandName,
                    industry: category || "Unknown",
                    country: "Unknown",
                  },
                ])
                .select()
                .single();

              brandId = newBrand.id;
            }

            let productId: string;

            const { data: existingProduct } = await supabase
              .from("products")
              .select("*")
              .eq("name", productName)
              .maybeSingle();

            if (existingProduct) {
              productId = existingProduct.id;
            } else {
              const { data: newProduct } = await supabase
                .from("products")
                .insert([
                  {
                    name: productName,
                    product_type: productType || "Product",
                    category: category || null,
                    description: note || null,
                    brand_id: brandId,
                    company_id: companyId,
                  },
                ])
                .select()
                .single();

              productId = newProduct.id;
            }

            let audienceId: string;

            const { data: existingAudience } = await supabase
              .from("audiences")
              .select("*")
              .eq("name", audienceName)
              .maybeSingle();

            if (existingAudience) {
              audienceId = existingAudience.id;
            } else {
              const { data: newAudience } = await supabase
                .from("audiences")
                .insert([
                  {
                    name: audienceName,
                    description: note || null,
                  },
                ])
                .select()
                .single();

              audienceId = newAudience.id;
            }

            let campaignId: string | null = null;

            if (campaignName) {
              const { data: existingCampaign } = await supabase
                .from("campaigns")
                .select("*")
                .eq("name", campaignName)
                .eq("brand_id", brandId)
                .maybeSingle();

              if (existingCampaign) {
                campaignId = existingCampaign.id;

                await supabase
                  .from("campaigns")
                  .update({
                    product_id: productId,
                  })
                  .eq("id", campaignId);
              } else {
                const { data: newCampaign } = await supabase
                  .from("campaigns")
                  .insert([
                    {
                      brand_id: brandId,
                      product_id: productId,
                      name: campaignName,
                      objective: note || null,
                      status: "active",
                    },
                  ])
                  .select()
                  .single();

                campaignId = newCampaign.id;
              }
            }

            const relationshipResults = [];

            relationshipResults.push(
              await insertRelationshipIfMissing(
                "company",
                companyId,
                "brand",
                brandId,
                "owns",
                `${companyName} owns ${brandName}`
              )
            );

            relationshipResults.push(
              await insertRelationshipIfMissing(
                "brand",
                brandId,
                "product",
                productId,
                "has_product",
                `${brandName} has product ${productName}`
              )
            );

            relationshipResults.push(
              await insertRelationshipIfMissing(
                "product",
                productId,
                "audience",
                audienceId,
                "targets",
                note || `${productName} targets ${audienceName}`
              )
            );

            if (campaignId) {
              relationshipResults.push(
                await insertRelationshipIfMissing(
                  "product",
                  productId,
                  "campaign",
                  campaignId,
                  "promoted_by",
                  `${productName} is promoted by ${campaignName}`
                )
              );

              relationshipResults.push(
                await insertRelationshipIfMissing(
                  "campaign",
                  campaignId,
                  "audience",
                  audienceId,
                  "targets",
                  `${campaignName} targets ${audienceName}`
                )
              );
            }

            createdRelationships += relationshipResults.filter(Boolean).length;
            skippedRelationships += relationshipResults.filter(
              (created) => !created
            ).length;
          }

          setMessage(
            `Graph import complete. Created relationships: ${createdRelationships}, skipped duplicates/errors: ${skippedRelationships}.`
          );
        } catch (error) {
          console.error(error);
          setMessage("Import failed.");
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
              Relationship Graph Importer
            </h1>

            <p className="text-gray-400 text-lg">
              Upload company, brand, product, audience and campaign graph data.
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
              Upload Relationship CSV
            </button>

            {uploading && (
              <div className="mt-6 text-yellow-400">
                Building relationship graph...
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