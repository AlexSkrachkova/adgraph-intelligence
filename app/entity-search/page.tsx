"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/NavBar";
import { supabase } from "../../lib/supabase";

type EntityResult = {
  nodeId: string;
  entityType: string;
  entity: any;
};

function GalaxyShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10">{children}</div>
      </main>
    </>
  );
}

function entityMatches(entity: EntityResult, query: string) {
  if (!query.trim()) return true;

  const item = entity.entity;

  const text = [
    entity.entityType,
    item.name,
    item.description,
    item.industry,
    item.country,
    item.product_type,
    item.category,
    item.objective,
    item.status,
    item.iab_tier_1,
    item.iab_tier_2,
    item.iab_tier_3,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(query.toLowerCase());
}

export default function EntitySearchPage() {
  const [query, setQuery] = useState("");
  const [entities, setEntities] = useState<EntityResult[]>([]);
  const [loading, setLoading] = useState(true);

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
        ...(companies.data || []).map((entity) => ({
          nodeId: `company-${entity.id}`,
          entityType: "company",
          entity,
        })),
        ...(brands.data || []).map((entity) => ({
          nodeId: `brand-${entity.id}`,
          entityType: "brand",
          entity,
        })),
        ...(products.data || []).map((entity) => ({
          nodeId: `product-${entity.id}`,
          entityType: "product",
          entity,
        })),
        ...(campaigns.data || []).map((entity) => ({
          nodeId: `campaign-${entity.id}`,
          entityType: "campaign",
          entity,
        })),
        ...(audiences.data || []).map((entity) => ({
          nodeId: `audience-${entity.id}`,
          entityType: "audience",
          entity,
        })),
      ];

      setEntities(combined);
      setLoading(false);
    }

    loadEntities();
  }, []);

  const results = useMemo(() => {
    return entities.filter((entity) => entityMatches(entity, query));
  }, [entities, query]);

  return (
    <GalaxyShell>
      <div className="mb-10">
        <div className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
          Entity Search Intelligence
        </div>

        <h1 className="text-7xl font-black mb-4 tracking-tight">
          Galaxy Search
        </h1>

        <p className="text-gray-300 text-lg max-w-3xl">
          Search across companies, brands, products, campaigns, audiences and
          IAB taxonomy classifications inside Brand Galaxy.
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Xbox, gaming, Coca-Cola, electric vehicles, young gamers..."
          className="w-full rounded-2xl bg-black/40 border border-white/10 p-4 text-white placeholder:text-gray-500 outline-none focus:border-fuchsia-300/60"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="text-3xl font-black text-fuchsia-200">
            {entities.length}
          </div>
          <div className="text-sm text-gray-400">Total Entities</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="text-3xl font-black text-cyan-200">
            {results.length}
          </div>
          <div className="text-sm text-gray-400">Search Results</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="text-3xl font-black text-indigo-200">
            {entities.filter((item) => item.entityType === "brand").length}
          </div>
          <div className="text-sm text-gray-400">Brand Stars</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="text-3xl font-black text-green-200">
            {
              entities.filter(
                (item) =>
                  item.entity.iab_tier_1 ||
                  item.entity.iab_tier_2 ||
                  item.entity.iab_tier_3
              ).length
            }
          </div>
          <div className="text-sm text-gray-400">IAB Enriched</div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-gray-300">
          Loading Galaxy Search...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {results.map((result) => (
            <div
              key={result.nodeId}
              className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl shadow-[0_0_45px_rgba(217,70,239,0.08)]"
            >
              <div className="mb-3 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-1 text-xs uppercase text-fuchsia-200">
                {result.entityType}
              </div>

              <h2 className="text-2xl font-black text-white mb-3">
                {result.entity.name || "Unknown"}
              </h2>

              <div className="space-y-2 text-sm text-gray-300">
                {result.entity.industry && (
                  <div>Industry: {result.entity.industry}</div>
                )}

                {result.entity.category && (
                  <div>Category: {result.entity.category}</div>
                )}

                {result.entity.product_type && (
                  <div>Product Type: {result.entity.product_type}</div>
                )}

                {result.entity.objective && (
                  <div>Objective: {result.entity.objective}</div>
                )}

                {(result.entity.iab_tier_1 ||
                  result.entity.iab_tier_2 ||
                  result.entity.iab_tier_3) && (
                  <div className="mt-4 rounded-2xl border border-indigo-300/30 bg-indigo-500/10 p-3 text-indigo-100">
                    {[result.entity.iab_tier_1, result.entity.iab_tier_2, result.entity.iab_tier_3]
                      .filter(Boolean)
                      .join(" → ")}
                  </div>
                )}

                {result.entity.description && (
                  <div className="mt-4 text-gray-400 leading-6">
                    {result.entity.description}
                  </div>
                )}
              </div>
            </div>
          ))}

          {results.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-gray-300">
              No matching galaxy signals found.
            </div>
          )}
        </div>
      )}
    </GalaxyShell>
  );
}