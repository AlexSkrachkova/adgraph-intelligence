"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";

type CsvRow = {
  company?: string;
  brand?: string;
  product?: string;
  campaign?: string;
  audience?: string;
  category?: string;
  description?: string;
  product_type?: string;
  objective?: string;
  status?: string;
  country?: string;
  industry?: string;
  keywords?: string;
};

type EnrichedRow = {
  rowNumber: number;
  original: CsvRow;
  companyName?: string;
  brandName?: string;
  productNames: string[];
  campaignName?: string;
  audienceName?: string;
  category?: string;
  industry?: string;
  country?: string;
  description?: string;
  productType?: string;
  objective?: string;
  status?: string;
  iabTier1?: string | null;
  iabTier2?: string | null;
  iabTier3?: string | null;
  keywords: string[];
  notes: string[];
  warnings: string[];
  isValid: boolean;
};

type InferredRelationship = {
  id: string;
  sourceName: string;
  targetName: string;
  sourceType: string;
  targetType: string;
  relationshipType: string;
  reason: string;
  confidence: number;
};

type ImportReport = {
  rows: number;
  companies: number;
  brands: number;
  products: number;
  campaigns: number;
  audiences: number;
  relationships: number;
  inferredRelationships: number;
  skipped: number;
  errors: string[];
};

type ImportHistoryItem = {
  id: string;
  createdAt: string;
  fileName: string;
  rows: number;
  brands: number;
  products: number;
  campaigns: number;
  audiences: number;
  relationships: number;
  inferredRelationships: number;
  errors: number;
};

const requiredColumns = [
  "company",
  "brand",
  "product",
  "campaign",
  "audience",
  "category",
  "description",
];

const optionalColumns = [
  "product_type",
  "objective",
  "status",
  "country",
  "industry",
  "keywords",
];

const headerAliases: Record<string, string> = {
  advertiser: "company",
  advertiser_name: "company",
  owner: "company",
  parent_company: "company",
  company_name: "company",
  brand_name: "brand",
  product_name: "product",
  sku: "product",
  item: "product",
  campaign_name: "campaign",
  ad_campaign: "campaign",
  audience_segment: "audience",
  target_audience: "audience",
  segment: "audience",
  vertical: "category",
  sector: "category",
  desc: "description",
  summary: "description",
  type: "product_type",
  product_category: "product_type",
  goal: "objective",
  campaign_objective: "objective",
  market: "country",
  region: "country",
  tags: "keywords",
  search_keywords: "keywords",
};

const brandAsProductRules: Record<string, string> = {
  "Samsung Galaxy": "Samsung",
  "Nintendo Switch": "Nintendo",
  "PlayStation Plus": "PlayStation",
  "Xbox Game Pass": "Xbox",
  "YouTube Premium": "YouTube",
  "Spotify Premium": "Spotify",
  "Netflix Premium": "Netflix",
};

function cleanValue(value?: string) {
  return (value || "").trim().replace(/\s+/g, " ");
}

function normalizeHeader(header: string) {
  const normalized = header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  return headerAliases[normalized] || normalized;
}

function uniqueValues(values: string[]) {
  return Array.from(
    new Set(values.map((value) => cleanValue(value)).filter(Boolean))
  );
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseCsv(text: string): CsvRow[] {
  const cleanText = text.trim();
  if (!cleanText) return [];

  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim());
  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    return row;
  });
}

function normalizeRow(row: CsvRow): CsvRow {
  return {
    company: cleanValue(row.company),
    brand: cleanValue(row.brand),
    product: cleanValue(row.product),
    campaign: cleanValue(row.campaign),
    audience: cleanValue(row.audience),
    category: cleanValue(row.category),
    description: cleanValue(row.description),
    product_type: cleanValue(row.product_type),
    objective: cleanValue(row.objective),
    status: cleanValue(row.status),
    country: cleanValue(row.country),
    industry: cleanValue(row.industry),
    keywords: cleanValue(row.keywords),
  };
}

function inferIab(category?: string) {
  const value = (category || "").toLowerCase();

  if (value.includes("gaming")) {
    return {
      iabTier1: "Arts & Entertainment",
      iabTier2: "Games",
      iabTier3: "Video Gaming",
    };
  }

  if (
    value.includes("streaming") ||
    value.includes("entertainment") ||
    value.includes("media")
  ) {
    return {
      iabTier1: "Arts & Entertainment",
      iabTier2: "Music & Audio / TV & Video",
      iabTier3: "Streaming Media",
    };
  }

  if (value.includes("beverage") || value.includes("drink")) {
    return {
      iabTier1: "Food & Drink",
      iabTier2: "Beverages",
      iabTier3: "Soft Drinks",
    };
  }

  if (
    value.includes("mobile") ||
    value.includes("technology") ||
    value.includes("smartphone")
  ) {
    return {
      iabTier1: "Technology & Computing",
      iabTier2: "Consumer Electronics",
      iabTier3: "Mobile Phones",
    };
  }

  if (
    value.includes("auto") ||
    value.includes("vehicle") ||
    value.includes("automotive")
  ) {
    return {
      iabTier1: "Automotive",
      iabTier2: "Auto Type",
      iabTier3: "Passenger Cars",
    };
  }

  if (value.includes("sportswear") || value.includes("sports")) {
    return {
      iabTier1: "Sports",
      iabTier2: "Sporting Goods",
      iabTier3: "Athletic Apparel",
    };
  }

  if (value.includes("food")) {
    return {
      iabTier1: "Food & Drink",
      iabTier2: "Food",
      iabTier3: "Fast Food",
    };
  }

  return {
    iabTier1: category || null,
    iabTier2: null,
    iabTier3: null,
  };
}

function buildKeywords(row: CsvRow, enriched: Partial<EnrichedRow>) {
  const manualKeywords =
    row.keywords
      ?.split(/[;,|]/)
      .map((keyword) => keyword.trim())
      .filter(Boolean) || [];

  return uniqueValues([
    ...manualKeywords,
    row.company || "",
    row.brand || "",
    row.product || "",
    row.campaign || "",
    row.audience || "",
    row.category || "",
    row.product_type || "",
    enriched.brandName || "",
    ...(enriched.productNames || []),
  ]);
}

function validateEnrichedRow(row: Partial<EnrichedRow>) {
  const warnings: string[] = [];

  if (!row.brandName && !row.companyName) {
    warnings.push(
      "Missing brand and company. Row may not create a strong graph signal."
    );
  }

  if (!row.brandName && row.productNames?.length) {
    warnings.push(
      "Product exists without a brand. Product will be imported but may be disconnected."
    );
  }

  if (row.brandName && row.productNames?.includes(row.brandName)) {
    warnings.push("Brand and product have the same name.");
  }

  if (!row.category && !row.industry) {
    warnings.push("Missing category/industry. IAB enrichment will be weak.");
  }

  if (!row.description) {
    warnings.push("Missing description.");
  }

  const hasAnyEntity =
    Boolean(row.companyName) ||
    Boolean(row.brandName) ||
    Boolean(row.campaignName) ||
    Boolean(row.audienceName) ||
    Boolean(row.productNames?.length);

  return {
    warnings,
    isValid: hasAnyEntity,
  };
}

function enrichRows(rows: CsvRow[]): EnrichedRow[] {
  return rows.map((row, index) => {
    const normalized = normalizeRow(row);
    const notes: string[] = [];

    let brandName = normalized.brand || undefined;
    const productNames: string[] = [];

    if (brandName && brandAsProductRules[brandName]) {
      productNames.push(brandName);
      brandName = brandAsProductRules[brandName];
      notes.push(`${normalized.brand} was treated as product under ${brandName}.`);
    }

    if (normalized.product) {
      productNames.push(normalized.product);
    }

    const category = normalized.category || normalized.industry || undefined;
    const iab = inferIab(category);

    const enrichedBase: Partial<EnrichedRow> = {
      brandName,
      productNames: uniqueValues(productNames),
    };

    const enriched: Partial<EnrichedRow> = {
      rowNumber: index + 2,
      original: normalized,
      companyName: normalized.company || undefined,
      brandName,
      productNames: uniqueValues(productNames),
      campaignName: normalized.campaign || undefined,
      audienceName: normalized.audience || undefined,
      category,
      industry: normalized.industry || normalized.category || undefined,
      country: normalized.country || "Global",
      description: normalized.description || undefined,
      productType: normalized.product_type || normalized.category || undefined,
      objective:
        normalized.objective ||
        normalized.description ||
        (normalized.campaign ? "Imported campaign signal" : undefined),
      status: normalized.status || "active",
      iabTier1: iab.iabTier1,
      iabTier2: iab.iabTier2,
      iabTier3: iab.iabTier3,
      keywords: buildKeywords(normalized, enrichedBase),
      notes,
    };

    const validation = validateEnrichedRow(enriched);

    return {
      ...(enriched as EnrichedRow),
      warnings: validation.warnings,
      isValid: validation.isValid,
    };
  });
}

function buildInferredRelationships(
  rows: EnrichedRow[]
): InferredRelationship[] {
  return [];
}

async function upsertEntity({
  table,
  payload,
  fallbackPayload,
}: {
  table: string;
  payload: any;
  fallbackPayload: any;
}) {
  const first = await supabase
    .from(table)
    .upsert(payload, { onConflict: "name" })
    .select()
    .single();

  if (!first.error) return first.data;

  const second = await supabase
    .from(table)
    .upsert(fallbackPayload, { onConflict: "name" })
    .select()
    .single();

  if (second.error) throw second.error;

  return second.data;
}

async function createRelationshipIfMissing({
  sourceType,
  sourceId,
  targetType,
  targetId,
  relationshipType,
  description,
}: {
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationshipType: string;
  description: string;
}) {
  const { data: existing } = await supabase
    .from("entity_relationships")
    .select("id")
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("relationship_type", relationshipType)
    .maybeSingle();

  if (existing) return false;

  const { error } = await supabase.from("entity_relationships").insert({
    source_type: sourceType,
    source_id: sourceId,
    target_type: targetType,
    target_id: targetId,
    relationship_type: relationshipType,
    description,
  });

  if (error) throw error;

  return true;
}

export default function CsvImportPage() {
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [previewRows, setPreviewRows] = useState<EnrichedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("brand-galaxy-import-history");
    if (stored) {
      setImportHistory(JSON.parse(stored));
    }
  }, []);

  function saveImportHistory(nextHistory: ImportHistoryItem[]) {
    setImportHistory(nextHistory);
    window.localStorage.setItem(
      "brand-galaxy-import-history",
      JSON.stringify(nextHistory)
    );
  }

  const detectedColumns = useMemo(() => {
    if (!csvText.trim()) return [];

    const firstLine = csvText.trim().split(/\r?\n/)[0];

    return parseCsvLine(firstLine).map(normalizeHeader);
  }, [csvText]);

  const missingColumns = useMemo(() => {
    if (!detectedColumns.length) return requiredColumns;

    return requiredColumns.filter((column) => !detectedColumns.includes(column));
  }, [detectedColumns]);

  const inferredRelationships = useMemo(() => {
    return buildInferredRelationships(previewRows);
  }, [previewRows]);

  const previewSummary = useMemo(() => {
    const rows = previewRows;

    return {
      valid: rows.filter((row) => row.isValid).length,
      warnings: rows.reduce((sum, row) => sum + row.warnings.length, 0),
      companies: uniqueValues(rows.map((row) => row.companyName || "")).length,
      brands: uniqueValues(rows.map((row) => row.brandName || "")).length,
      products: uniqueValues(rows.flatMap((row) => row.productNames)).length,
      campaigns: uniqueValues(rows.map((row) => row.campaignName || "")).length,
      audiences: uniqueValues(rows.map((row) => row.audienceName || "")).length,
      inferredRelationships: inferredRelationships.length,
    };
  }, [previewRows, inferredRelationships]);

  async function handleFileUpload(file: File | null) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setStatus("Please upload a .csv file.");
      return;
    }

    const text = await file.text();
    const rows = enrichRows(parseCsv(text));

    setFileName(file.name);
    setCsvText(text);
    setPreviewRows(rows);
    setReport(null);
    setStatus(`${file.name} loaded. ${rows.length} rows enriched for preview.`);
  }

  function loadDemoCsv() {
    const demoCsv = `company,brand,product,campaign,audience,category,description,product_type,objective,status,country,keywords
Sony Interactive Entertainment,PlayStation,PlayStation 5,PlayStation Summer Campaign,Core Gamers,Gaming,Next generation gaming console campaign,Console,Drive console awareness,active,Global,console;gaming;playstation
Microsoft,Xbox,Xbox Game Pass,Xbox Game Pass Ultimate Campaign,Core Gamers,Gaming,Subscription gaming ecosystem campaign,Subscription,Promote subscription ecosystem,active,Global,subscription;gaming;xbox
Nintendo,Nintendo,Nintendo Switch,Nintendo Family Campaign,Family Gamers,Gaming,Portable gaming platform campaign,Console,Position family-friendly gaming,active,Global,nintendo;family gaming
Samsung,Samsung Galaxy,Galaxy S25,Samsung Galaxy Campaign,Android Power Users,Mobile Tech,Flagship Android ecosystem campaign,Smartphone,Promote flagship Android device,active,Global,samsung;android;galaxy
Apple,Apple,iPhone 16,Apple Intelligence Campaign,Premium Mobile Users,Mobile Tech,AI smartphone ecosystem launch,Smartphone,Launch AI mobile ecosystem,active,Global,apple;iphone;ai
Netflix,Netflix,Netflix Premium,Netflix Originals Campaign,Streaming Viewers,Streaming,Streaming platform campaign,Subscription,Promote original content,active,Global,netflix;streaming
Google,YouTube,YouTube Premium,YouTube Creator Campaign,Video Streamers,Streaming,Video platform subscription campaign,Subscription,Promote ad-free video,active,Global,youtube;video;creator
Spotify,Spotify,Spotify Premium,Spotify Wrapped Campaign,Music Streamers,Streaming,Music streaming subscription campaign,Subscription,Promote music streaming,active,Global,spotify;music
PepsiCo,Pepsi,Pepsi Zero Sugar,Pepsi Zero Campaign,Soft Drink Consumers,Beverage,Zero sugar beverage campaign,Soft Drink,Drive zero sugar trial,active,Global,pepsi;zero sugar
The Coca-Cola Company,Coca-Cola,Coca-Cola Zero,Coca-Cola Lifestyle Campaign,Soft Drink Consumers,Beverage,Global beverage campaign,Soft Drink,Promote lifestyle refreshment,active,Global,coca-cola;beverage`;

    setCsvText(demoCsv);
    setFileName("brand-galaxy-clean-demo.csv");
    setPreviewRows(enrichRows(parseCsv(demoCsv)));
    setReport(null);
    setStatus("Demo CSV loaded with safe validation and enrichment.");
  }

  function previewCsv() {
    const rows = enrichRows(parseCsv(csvText));
    setPreviewRows(rows);
    setReport(null);
    setStatus(`${rows.length} rows validated and enriched.`);
  }

  async function importCsv() {
    setLoading(true);
    setStatus("Importing validated CSV data...");

    const rows = enrichRows(parseCsv(csvText));

    const nextReport: ImportReport = {
      rows: rows.length,
      companies: 0,
      brands: 0,
      products: 0,
      campaigns: 0,
      audiences: 0,
      relationships: 0,
      inferredRelationships: 0,
      skipped: 0,
      errors: [],
    };

    for (const row of rows) {
      if (!row.isValid) {
        nextReport.skipped++;
        continue;
      }

      try {
        let companyId: string | null = null;
        let brandId: string | null = null;
        const productIds: string[] = [];
        let campaignId: string | null = null;
        let audienceId: string | null = null;

        if (row.companyName) {
          const data = await upsertEntity({
            table: "companies",
            payload: {
              name: row.companyName,
              industry: row.industry || row.category || null,
              country: row.country || "Global",
              search_keywords: row.keywords,
            },
            fallbackPayload: {
              name: row.companyName,
              industry: row.industry || row.category || null,
              country: row.country || "Global",
            },
          });

          companyId = data?.id || null;
          nextReport.companies++;
        }

        if (row.brandName) {
          const data = await upsertEntity({
            table: "brands",
            payload: {
              name: row.brandName,
              iab_tier_1: row.iabTier1,
              iab_tier_2: row.iabTier2,
              iab_tier_3: row.iabTier3,
              search_keywords: row.keywords,
            },
            fallbackPayload: {
              name: row.brandName,
              iab_tier_1: row.iabTier1,
              iab_tier_2: row.iabTier2,
              iab_tier_3: row.iabTier3,
            },
          });

          brandId = data?.id || null;
          nextReport.brands++;
        }

        for (const productName of row.productNames) {
          const data = await upsertEntity({
            table: "products",
            payload: {
              name: productName,
              product_type: row.productType || row.category || null,
              category: row.category || null,
              description: row.description || null,
              search_keywords: row.keywords,
            },
            fallbackPayload: {
              name: productName,
              product_type: row.productType || row.category || null,
              category: row.category || null,
              description: row.description || null,
            },
          });

          if (data?.id) {
            productIds.push(data.id);
            nextReport.products++;
          }
        }

        if (row.campaignName) {
          const data = await upsertEntity({
            table: "campaigns",
            payload: {
              name: row.campaignName,
              objective: row.objective || "Imported campaign signal",
              status: row.status || "active",
              search_keywords: row.keywords,
            },
            fallbackPayload: {
              name: row.campaignName,
              objective: row.objective || "Imported campaign signal",
              status: row.status || "active",
            },
          });

          campaignId = data?.id || null;
          nextReport.campaigns++;
        }

        if (row.audienceName) {
          const data = await upsertEntity({
            table: "audiences",
            payload: {
              name: row.audienceName,
              description: row.description || null,
              search_keywords: row.keywords,
            },
            fallbackPayload: {
              name: row.audienceName,
              description: row.description || null,
            },
          });

          audienceId = data?.id || null;
          nextReport.audiences++;
        }

        if (brandId && companyId) {
          const created = await createRelationshipIfMissing({
            sourceType: "brand",
            sourceId: brandId,
            targetType: "company",
            targetId: companyId,
            relationshipType: "owned_by",
            description: "CSV validated ownership signal",
          });

          if (created) nextReport.relationships++;
        }

        for (const productId of productIds) {
          if (brandId) {
            const created = await createRelationshipIfMissing({
              sourceType: "brand",
              sourceId: brandId,
              targetType: "product",
              targetId: productId,
              relationshipType: "has_product",
              description: "CSV validated product signal",
            });

            if (created) nextReport.relationships++;
          }

          if (campaignId) {
            const created = await createRelationshipIfMissing({
              sourceType: "campaign",
              sourceId: campaignId,
              targetType: "product",
              targetId: productId,
              relationshipType: "promotes",
              description: "CSV validated campaign-product signal",
            });

            if (created) nextReport.relationships++;
          }
        }

        if (brandId && campaignId) {
          const created = await createRelationshipIfMissing({
            sourceType: "brand",
            sourceId: brandId,
            targetType: "campaign",
            targetId: campaignId,
            relationshipType: "runs_campaign",
            description: "CSV validated brand-campaign signal",
          });

          if (created) nextReport.relationships++;
        }

        if (campaignId && audienceId) {
          const created = await createRelationshipIfMissing({
            sourceType: "campaign",
            sourceId: campaignId,
            targetType: "audience",
            targetId: audienceId,
            relationshipType: "targets",
            description: "CSV validated audience targeting signal",
          });

          if (created) nextReport.relationships++;
        }

        if (brandId && audienceId) {
          const created = await createRelationshipIfMissing({
            sourceType: "brand",
            sourceId: brandId,
            targetType: "audience",
            targetId: audienceId,
            relationshipType: "targets",
            description: "CSV validated brand-audience signal",
          });

          if (created) nextReport.relationships++;
        }
      } catch (error: any) {
        nextReport.errors.push(
          `Row ${row.rowNumber}: ${error?.message || "Unknown import error"}`
        );
      }
    }

    const nextHistory: ImportHistoryItem[] = [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toLocaleString(),
        fileName: fileName || "manual-paste.csv",
        rows: nextReport.rows,
        brands: nextReport.brands,
        products: nextReport.products,
        campaigns: nextReport.campaigns,
        audiences: nextReport.audiences,
        relationships: nextReport.relationships,
        inferredRelationships: nextReport.inferredRelationships,
        errors: nextReport.errors.length,
      },
      ...importHistory,
    ].slice(0, 8);

    saveImportHistory(nextHistory);
    setReport(nextReport);
    setLoading(false);

    if (nextReport.errors.length > 0) {
      setStatus(
        `Import finished with ${nextReport.errors.length} issue(s). Check the report below.`
      );
    } else {
      setStatus("CSV import complete. Refresh Galaxy Map to see new signals.");
    }
  }

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10">
          <div className="mb-10">
            <div className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
              Data Enrichment Center
            </div>

            <h1 className="text-7xl font-black mb-4 tracking-tight">
              CSV Import & Enrichment
            </h1>

            <p className="text-gray-300 text-lg max-w-3xl">
              Validate CSV data, preview enriched entities and save only safe
              direct graph relationships into Supabase.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_430px] gap-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="mb-6 rounded-3xl border border-cyan-300/30 bg-cyan-500/10 p-5">
                <div className="text-cyan-200 font-semibold mb-3">
                  Upload CSV File
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-300/40 bg-black/30 p-8 text-center hover:bg-cyan-500/10 transition">
                  <div className="text-5xl mb-4">📁</div>

                  <div className="text-lg font-bold text-white mb-2">
                    Choose CSV file
                  </div>

                  <div className="text-sm text-gray-400">
                    Nielsen export, monitoring export, campaign data file
                  </div>

                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(event) =>
                      handleFileUpload(event.target.files?.[0] || null)
                    }
                  />
                </label>

                {fileName && (
                  <div className="mt-4 rounded-2xl border border-green-300/30 bg-green-500/10 p-4 text-green-100">
                    Loaded file: {fileName}
                  </div>
                )}
              </div>

              <div className="mb-5 flex flex-wrap gap-3">
                <button
                  onClick={loadDemoCsv}
                  className="rounded-2xl border border-green-300/30 bg-green-500/10 px-5 py-3 font-semibold text-green-100 hover:bg-green-500/20"
                >
                  Load Demo CSV
                </button>

                <button
                  onClick={previewCsv}
                  disabled={!csvText.trim()}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-5 py-3 font-semibold text-cyan-100 hover:bg-cyan-500/20 disabled:opacity-40"
                >
                  Validate Preview
                </button>

                <button
                  onClick={importCsv}
                  disabled={loading || !csvText.trim() || previewRows.length === 0}
                  className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-5 py-3 font-semibold text-fuchsia-100 hover:bg-fuchsia-500/20 disabled:opacity-40"
                >
                  {loading ? "Importing..." : "Save to Supabase"}
                </button>
              </div>

              <div className="text-sm text-fuchsia-200 font-semibold mb-4">
                CSV Content
              </div>

              <textarea
                value={csvText}
                onChange={(event) => {
                  setCsvText(event.target.value);
                  setReport(null);
                }}
                placeholder={`company,brand,product,campaign,audience,category,description,product_type,objective,status,country,keywords
Samsung,Samsung Galaxy,Galaxy S25,Samsung Galaxy Campaign,Android Power Users,Mobile Tech,Flagship Android ecosystem campaign,Smartphone,Promote flagship Android device,active,Global,samsung;android;galaxy`}
                className="min-h-[380px] w-full rounded-3xl border border-white/10 bg-black/40 p-5 text-white placeholder:text-gray-500 outline-none focus:border-fuchsia-300/50"
              />

              {status && (
                <div className="mt-5 rounded-2xl border border-green-300/30 bg-green-500/10 p-4 text-green-100">
                  {status}
                </div>
              )}
            </section>

            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-sm text-fuchsia-200 font-semibold mb-4">
                Expected CSV Columns
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                {requiredColumns.map((field) => (
                  <div
                    key={field}
                    className={`rounded-2xl border p-3 ${
                      detectedColumns.includes(field)
                        ? "border-green-300/30 bg-green-500/10 text-green-100"
                        : "border-white/10 bg-black/30"
                    }`}
                  >
                    {field}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-sm text-gray-400 mb-2">
                  Optional enrichment columns
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                  {optionalColumns.map((field) => (
                    <span
                      key={field}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {csvText.trim() && missingColumns.length > 0 && (
                <div className="mt-5 rounded-3xl border border-yellow-400/30 bg-yellow-500/10 p-5 text-yellow-100">
                  Missing recommended columns: {missingColumns.join(", ")}
                </div>
              )}

              {previewRows.length > 0 && (
                <div className="mt-6 rounded-3xl border border-cyan-300/30 bg-cyan-500/10 p-5">
                  <div className="text-cyan-200 font-semibold mb-4">
                    Validation Summary
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>Valid rows: {previewSummary.valid}</div>
                    <div>Warnings: {previewSummary.warnings}</div>
                    <div>Companies: {previewSummary.companies}</div>
                    <div>Brands: {previewSummary.brands}</div>
                    <div>Products: {previewSummary.products}</div>
                    <div>Campaigns: {previewSummary.campaigns}</div>
                    <div>Audiences: {previewSummary.audiences}</div>
                    <div>Inferred: 0</div>
                  </div>
                </div>
              )}

              {importHistory.length > 0 && (
                <div className="mt-6 rounded-3xl border border-fuchsia-300/30 bg-fuchsia-500/10 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-fuchsia-200 font-semibold">
                      Import History
                    </div>

                    <button
                      onClick={() => saveImportHistory([])}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-3">
                    {importHistory.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-black/25 p-3"
                      >
                        <div className="text-xs text-gray-400">
                          {item.createdAt}
                        </div>
                        <div className="font-semibold text-white">
                          {item.fileName}
                        </div>
                        <div className="mt-1 text-xs text-gray-300">
                          {item.rows} rows · {item.relationships} relationships ·{" "}
                          {item.errors} errors
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {previewRows.length > 0 && (
            <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-fuchsia-200 font-semibold">
                  Validated Preview Before Save
                </div>

                <div className="text-sm text-gray-400">
                  {previewRows.length} rows
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {previewRows.slice(0, 12).map((row) => (
                  <div
                    key={row.rowNumber}
                    className={`rounded-3xl border p-5 ${
                      row.isValid
                        ? "border-white/10 bg-black/30"
                        : "border-red-400/30 bg-red-500/10"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        CSV Row {row.rowNumber}
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs ${
                          row.isValid
                            ? "bg-green-500/15 text-green-200"
                            : "bg-red-500/15 text-red-200"
                        }`}
                      >
                        {row.isValid ? "Valid" : "Skipped"}
                      </div>
                    </div>

                    <div className="text-xs uppercase text-fuchsia-300">
                      Brand
                    </div>
                    <div className="mb-3 font-bold text-white">
                      {row.brandName || "No brand"}
                    </div>

                    <div className="text-xs uppercase text-green-300">
                      Products
                    </div>
                    <div className="mb-3 text-sm text-green-100">
                      {row.productNames.length
                        ? row.productNames.join(", ")
                        : "No products"}
                    </div>

                    <div className="text-xs uppercase text-cyan-300">
                      Company
                    </div>
                    <div className="mb-3 text-sm text-cyan-100">
                      {row.companyName || "No company"}
                    </div>

                    <div className="text-xs uppercase text-orange-300">
                      Campaign
                    </div>
                    <div className="mb-3 text-sm text-orange-100">
                      {row.campaignName || "No campaign"}
                    </div>

                    <div className="text-xs uppercase text-blue-300">
                      Audience
                    </div>
                    <div className="mb-3 text-sm text-blue-100">
                      {row.audienceName || "No audience"}
                    </div>

                    <div className="text-xs text-gray-400">
                      IAB: {[row.iabTier1, row.iabTier2, row.iabTier3]
                        .filter(Boolean)
                        .join(" → ") || "Unclassified"}
                    </div>

                    {row.notes.length > 0 && (
                      <div className="mt-3 rounded-2xl border border-yellow-300/30 bg-yellow-500/10 p-3 text-xs text-yellow-100">
                        {row.notes.join(" ")}
                      </div>
                    )}

                    {row.warnings.length > 0 && (
                      <div className="mt-3 rounded-2xl border border-orange-300/30 bg-orange-500/10 p-3 text-xs text-orange-100">
                        {row.warnings.map((warning) => (
                          <div key={warning}>⚠ {warning}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {previewRows.length > 12 && (
                <div className="mt-5 text-sm text-gray-400">
                  Showing first 12 rows only.
                </div>
              )}
            </section>
          )}

          {report && (
            <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-sm text-fuchsia-200 font-semibold mb-4">
                Import Report
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-9 gap-4">
                {[
                  ["Rows", report.rows],
                  ["Companies", report.companies],
                  ["Brands", report.brands],
                  ["Products", report.products],
                  ["Campaigns", report.campaigns],
                  ["Audiences", report.audiences],
                  ["Relationships", report.relationships],
                  ["Inferred", report.inferredRelationships],
                  ["Skipped", report.skipped],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="text-3xl font-black text-fuchsia-200">
                      {value}
                    </div>
                    <div className="text-xs uppercase text-gray-400">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {report.errors.length > 0 && (
                <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
                  <div className="text-red-200 font-semibold mb-3">
                    Import Issues
                  </div>

                  <div className="space-y-2 text-sm text-red-100">
                    {report.errors.map((error) => (
                      <div key={error}>{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}