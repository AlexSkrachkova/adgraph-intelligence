"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";
import BrandIntelligenceModal from "@/app/components/BrandIntelligenceModal";
import { buildBrandProfile, type BrandIntelligenceProfile } from "@/lib/brandProfiles";

type EntityResult = {
  nodeId: string;
  entityType: "company" | "brand" | "product" | "campaign" | "audience";
  entity: any;
};

type GroupMode = "name" | "category" | "type";

const ALPHABET = ["All", "0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

function normalizeText(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[®™©]/g, "")
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getEntityName(result: EntityResult) {
  return result.entity?.name || result.entity?.brand_name || result.entity?.company_name || "Unknown";
}

function getEntityCategory(result: EntityResult) {
  const item = result.entity || {};

  return (
    item.iab_tier_1 ||
    item.iab_full_path ||
    item.industry ||
    item.category ||
    item.product_category ||
    item.product_type ||
    item.objective ||
    "Unclassified"
  );
}

function getEntityWebsite(entity: any) {
  return entity?.website || entity?.website_url || entity?.url || entity?.details_url || "";
}

function getEntityLogo(entity: any) {
  return entity?.logo_url || entity?.logo || entity?.image_url || entity?.brand_logo_url || "";
}

function getIabLabel(entity: any) {
  return (
    entity?.iab_full_path ||
    [entity?.iab_tier_1, entity?.iab_tier_2, entity?.iab_tier_3]
      .filter(Boolean)
      .join(" → ") ||
    "Unclassified"
  );
}

function getInitials(name: string) {
  const parts = (name || "Unknown")
    .replace(/[®™©]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function entityMatches(entity: EntityResult, query: string) {
  if (!query.trim()) return true;

  const item = entity.entity;

  const text = [
    entity.entityType,
    item.name,
    item.brand_name,
    item.company_name,
    item.description,
    item.industry,
    item.country,
    item.product_type,
    item.product_category,
    item.category,
    item.objective,
    item.status,
    item.website,
    item.website_url,
    item.slogan,
    item.owner,
    item.company,
    item.iab_full_path,
    item.iab_tier_1,
    item.iab_tier_2,
    item.iab_tier_3,
    ...(item.aliases || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(query.toLowerCase());
}

function entityMatchesAlpha(entity: EntityResult, alpha: string) {
  if (alpha === "All") return true;

  const first = getEntityName(entity).trim().charAt(0).toUpperCase();

  if (alpha === "0-9") return /[0-9]/.test(first);
  return first === alpha;
}

function entityMatchesType(entity: EntityResult, type: string) {
  if (type === "all") return true;
  return entity.entityType === type;
}

function getGroupKey(result: EntityResult, groupMode: GroupMode) {
  if (groupMode === "category") return getEntityCategory(result);
  if (groupMode === "type") return result.entityType;
  const first = getEntityName(result).trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "0-9";
}

function buildBrandDirectoryProfile(
  brand: EntityResult,
  allEntities: EntityResult[]
): BrandIntelligenceProfile {
  const brandName = getEntityName(brand);
  const brandId = brand.entity?.id;

  const products = allEntities
    .filter((item) => item.entityType === "product")
    .filter(
      (item) =>
        item.entity?.brand_id === brandId ||
        item.entity?.brand_name === brandName ||
        normalizeText(item.entity?.brand_name || "").includes(normalizeText(brandName))
    )
    .map((item) => getEntityName(item));

  const campaigns = allEntities
    .filter((item) => item.entityType === "campaign")
    .filter(
      (item) =>
        item.entity?.brand_id === brandId ||
        item.entity?.brand_name === brandName ||
        normalizeText(item.entity?.brand_name || "").includes(normalizeText(brandName))
    )
    .map((item) => getEntityName(item));

  const audiences = allEntities
    .filter((item) => item.entityType === "audience")
    .filter(
      (item) =>
        item.entity?.brand_id === brandId ||
        item.entity?.brand_name === brandName ||
        normalizeText(item.entity?.brand_name || "").includes(normalizeText(brandName))
    )
    .map((item) => getEntityName(item));

  return buildBrandProfile(
    {
      ...brand.entity,
      name: brandName,
      website: getEntityWebsite(brand.entity),
      logoUrl: getEntityLogo(brand.entity),
      logo_url: getEntityLogo(brand.entity),
      iab_full_path: getIabLabel(brand.entity),
    } as any,
    {
      products,
      campaigns,
      audiences,
      subsidiaries: products,
      iabFootprint: [getIabLabel(brand.entity)],
      categories: [getEntityCategory(brand)],
      sources: ["Entity Search", "Supabase"],
    }
  );
}

function GalaxyShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] p-10 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40" />

        <div className="relative z-10">{children}</div>
      </main>
    </>
  );
}

function EntityLogo({ entity, name }: { entity: any; name: string }) {
  const logo = getEntityLogo(entity);

  if (logo) {
    return (
      <div className="flex h-16 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white p-2">
        <img
          src={logo}
          alt={`${name} logo`}
          className="max-h-12 max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-16 w-24 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-500/10 text-xl font-black text-cyan-100">
      {getInitials(name)}
    </div>
  );
}

export default function EntitySearchPage() {
  const [query, setQuery] = useState("");
  const [alphaFilter, setAlphaFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");
  const [groupMode, setGroupMode] = useState<GroupMode>("name");
  const [entities, setEntities] = useState<EntityResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrandProfile, setSelectedBrandProfile] =
    useState<BrandIntelligenceProfile | null>(null);

  useEffect(() => {
    async function loadEntities() {
      setLoading(true);

      const [companies, brands, products, campaigns, audiences] =
        await Promise.all([
          supabase.from("companies").select("*"),
          supabase.from("brands").select("*"),
          supabase.from("products").select("*"),
          supabase.from("campaigns").select("*"),
          supabase.from("audiences").select("*"),
        ]);

      const combined: EntityResult[] = [
        ...(brands.data || []).map((entity) => ({
          nodeId: `brand-${entity.id}`,
          entityType: "brand" as const,
          entity,
        })),
        ...(companies.data || []).map((entity) => ({
          nodeId: `company-${entity.id}`,
          entityType: "company" as const,
          entity,
        })),
        ...(products.data || []).map((entity) => ({
          nodeId: `product-${entity.id}`,
          entityType: "product" as const,
          entity,
        })),
        ...(campaigns.data || []).map((entity) => ({
          nodeId: `campaign-${entity.id}`,
          entityType: "campaign" as const,
          entity,
        })),
        ...(audiences.data || []).map((entity) => ({
          nodeId: `audience-${entity.id}`,
          entityType: "audience" as const,
          entity,
        })),
      ];

      setEntities(combined);
      setLoading(false);
    }

    loadEntities();
  }, []);

  const filteredResults = useMemo(() => {
    return entities
      .filter((entity) => entityMatches(entity, query))
      .filter((entity) => entityMatchesAlpha(entity, alphaFilter))
      .filter((entity) => entityMatchesType(entity, typeFilter))
      .sort((a, b) => getEntityName(a).localeCompare(getEntityName(b)));
  }, [entities, query, alphaFilter, typeFilter]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, EntityResult[]> = {};

    filteredResults.forEach((entity) => {
      const key = getGroupKey(entity, groupMode);
      if (!groups[key]) groups[key] = [];
      groups[key].push(entity);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredResults, groupMode]);

  const brandCount = entities.filter((item) => item.entityType === "brand").length;
  const logoCount = entities.filter((item) => item.entityType === "brand" && getEntityLogo(item.entity)).length;
  const websiteCount = entities.filter((item) => item.entityType === "brand" && getEntityWebsite(item.entity)).length;
  const iabCount = entities.filter((item) => getIabLabel(item.entity) !== "Unclassified").length;

  function openEntity(result: EntityResult) {
    if (result.entityType === "brand") {
      setSelectedBrandProfile(buildBrandDirectoryProfile(result, entities));
      return;
    }

    setSelectedBrandProfile(
      buildBrandProfile(
        {
          name: getEntityName(result),
          description: result.entity?.description,
          website: getEntityWebsite(result.entity),
          iab_full_path: getIabLabel(result.entity),
          company: result.entity?.company || result.entity?.owner,
          aliases: result.entity?.aliases || [],
        } as any,
        {
          iabFootprint: [getIabLabel(result.entity)],
          categories: [getEntityCategory(result), result.entityType],
          sources: ["Entity Search", "Supabase"],
        }
      )
    );
  }

  return (
    <GalaxyShell>
      <div className="mb-10">
        <div className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
          Entity Search Intelligence
        </div>

        <h1 className="mb-4 text-7xl font-black tracking-tight">
          Brand & Entity Directory
        </h1>

        <p className="max-w-4xl text-lg leading-8 text-gray-300">
          Search across brands, companies, products, campaigns and audiences.
          Brands imported from CSV/Nielsen or ARGUS automatically appear here
          when written to Supabase.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ["Brand Stars", brandCount, "text-fuchsia-200"],
          ["With Logos", logoCount, "text-cyan-200"],
          ["With Websites", websiteCount, "text-emerald-200"],
          ["IAB Enriched", iabCount, "text-indigo-200"],
        ].map(([label, value, color]) => (
          <div
            key={label as string}
            className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
          >
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_210px_210px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search brand, company, logo, website, IAB, category, ownership..."
            className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none placeholder:text-gray-500 focus:border-fuchsia-300/60"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-cyan-300/60"
          >
            <option value="all">All entity types</option>
            <option value="brand">Brands only</option>
            <option value="company">Companies</option>
            <option value="product">Products</option>
            <option value="campaign">Campaigns</option>
            <option value="audience">Audiences</option>
          </select>

          <select
            value={groupMode}
            onChange={(event) => setGroupMode(event.target.value as GroupMode)}
            className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-cyan-300/60"
          >
            <option value="name">Group A-Z</option>
            <option value="category">Group by category</option>
            <option value="type">Group by entity type</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setAlphaFilter(letter)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                alphaFilter === letter
                  ? "border-fuchsia-300/50 bg-fuchsia-500/20 text-fuchsia-100"
                  : "border-white/10 bg-black/25 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-gray-300">
          Loading Galaxy Search...
        </div>
      ) : (
        <div className="space-y-8">
          {groupedResults.map(([groupName, groupItems]) => (
            <section key={groupName}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-white">{groupName}</h2>
                <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-gray-300">
                  {groupItems.length} results
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] backdrop-blur-xl">
                <div className="grid grid-cols-[130px_1.2fr_1fr_1.5fr_110px] gap-4 border-b border-white/10 bg-black/30 px-5 py-3 text-xs uppercase tracking-[0.18em] text-gray-500">
                  <div>Logo</div>
                  <div>Name</div>
                  <div>Type</div>
                  <div>Category / IAB</div>
                  <div>Open</div>
                </div>

                {groupItems.map((result) => {
                  const name = getEntityName(result);
                  const website = getEntityWebsite(result.entity);

                  return (
                    <button
                      key={result.nodeId}
                      onClick={() => openEntity(result)}
                      className="grid w-full grid-cols-[130px_1.2fr_1fr_1.5fr_110px] items-center gap-4 border-b border-white/5 px-5 py-4 text-left transition last:border-b-0 hover:bg-cyan-500/10"
                    >
                      <EntityLogo entity={result.entity} name={name} />

                      <div>
                        <div className="text-base font-black text-white">{name}</div>
                        {website && (
                          <div className="mt-1 truncate text-xs text-cyan-200">
                            {website}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-fuchsia-100">
                          {result.entityType}
                        </span>
                      </div>

                      <div className="text-sm leading-6 text-gray-300">
                        {getIabLabel(result.entity)}
                      </div>

                      <div className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                        Details →
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {filteredResults.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-gray-300">
              No matching galaxy signals found.
            </div>
          )}
        </div>
      )}

      <BrandIntelligenceModal
        profile={selectedBrandProfile}
        onClose={() => setSelectedBrandProfile(null)}
      />
    </GalaxyShell>
  );
}
