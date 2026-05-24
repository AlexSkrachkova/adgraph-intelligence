"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";

type Metric = {
  label: string;
  value: number;
  helper: string;
};

export default function StrategyHubPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [recentBrands, setRecentBrands] = useState<any[]>([]);

  useEffect(() => {
    async function loadHub() {
      setLoading(true);

      const [
        companiesResult,
        brandsResult,
        productsResult,
        campaignsResult,
        audiencesResult,
        relationshipsResult,
        taxonomyResult,
        spotsResult,
      ] = await Promise.all([
        supabase.from("companies").select("*"),
        supabase.from("brands").select("*"),
        supabase.from("products").select("*"),
        supabase.from("campaigns").select("*"),
        supabase.from("audiences").select("*"),
        supabase.from("entity_relationships").select("*"),
        supabase.from("iab_taxonomy").select("*"),
        supabase.from("ad_spots").select("*"),
      ]);

      const companies = companiesResult.data || [];
      const brands = brandsResult.data || [];
      const products = productsResult.data || [];
      const campaignsData = campaignsResult.data || [];
      const audiences = audiencesResult.data || [];
      const relationships = relationshipsResult.data || [];
      const taxonomy = taxonomyResult.data || [];
      const spots = spotsResult.data || [];

      setMetrics([
        {
          label: "Brand Stars",
          value: brands.length,
          helper: "Brands mapped inside the galaxy.",
        },
        {
          label: "Products",
          value: products.length,
          helper: "Advertised products and services.",
        },
        {
          label: "Campaigns",
          value: campaignsData.length,
          helper: "Active campaign intelligence.",
        },
        {
          label: "Audiences",
          value: audiences.length,
          helper: "Target audience clusters.",
        },
        {
          label: "Companies",
          value: companies.length,
          helper: "Ownership signals.",
        },
        {
          label: "Graph Signals",
          value: relationships.length,
          helper: "Relationship edges.",
        },
        {
          label: "IAB Categories",
          value: taxonomy.length,
          helper: "Taxonomy enrichment rows.",
        },
        {
          label: "TV Airings",
          value: spots.length,
          helper: "Monitoring signals.",
        },
      ]);

      setCampaigns(campaignsData.slice(0, 8));
      setRecentBrands(brands.slice(0, 12));
      setLoading(false);
    }

    loadHub();
  }, []);

  const galaxyScore = useMemo(() => {
    const total = metrics.reduce((sum, metric) => sum + metric.value, 0);
    return Math.min(100, Math.round(total / 2));
  }, [metrics]);

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10">
          <div className="mb-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                Brand Galaxy Command Center
              </div>

              <h1 className="text-7xl font-black mb-4 tracking-tight">
                Strategy Hub
              </h1>

              <p className="text-gray-300 text-lg max-w-3xl">
                Executive overview of your advertising galaxy: brands,
                campaigns, audiences, IAB taxonomy, competitors and monitoring
                signals.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/relationships"
                className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-5 py-4 font-semibold text-fuchsia-100 hover:bg-fuchsia-500/20 transition"
              >
                Open Galaxy Map
              </Link>

              <Link
                href="/monitoring"
                className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-5 py-4 font-semibold text-cyan-100 hover:bg-cyan-500/20 transition"
              >
                Monitoring Center
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-gray-300 backdrop-blur-xl">
              Loading Brand Galaxy intelligence...
            </div>
          ) : (
            <>
              <div className="mb-8 rounded-[2rem] border border-fuchsia-300/30 bg-fuchsia-500/10 p-6 backdrop-blur-xl shadow-[0_0_60px_rgba(217,70,239,0.15)]">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                  <div>
                    <div className="text-sm text-fuchsia-200 font-semibold mb-2">
                      Galaxy Intelligence Score
                    </div>

                    <div className="text-7xl font-black text-white">
                      {galaxyScore}
                    </div>
                  </div>

                  <div className="max-w-2xl text-gray-300 leading-7">
                    Brand Galaxy transforms monitoring, campaign and taxonomy
                    signals into a connected advertising intelligence system for
                    faster strategy, competitor analysis and audience discovery.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(217,70,239,0.08)]"
                  >
                    <div className="text-5xl font-black text-fuchsia-200 mb-3">
                      {metric.value}
                    </div>

                    <div className="text-lg font-bold text-white mb-1">
                      {metric.label}
                    </div>

                    <div className="text-sm text-gray-400">
                      {metric.helper}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(34,211,238,0.08)]">
                  <div className="text-xs uppercase tracking-[0.3em] text-cyan-200 mb-3">
                    Campaign Constellation
                  </div>

                  <h2 className="text-3xl font-black mb-5">
                    Campaign Radar
                  </h2>

                  <div className="space-y-3">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="rounded-2xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="font-bold text-white">
                          {campaign.name}
                        </div>

                        <div className="text-sm text-gray-400 mt-1">
                          {campaign.objective || "No objective available"}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(217,70,239,0.08)]">
                  <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200 mb-3">
                    Brand Galaxy
                  </div>

                  <h2 className="text-3xl font-black mb-5">Brand Stars</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recentBrands.map((brand) => (
                      <div
                        key={brand.id}
                        className="rounded-2xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="font-bold text-white">
                          {brand.name}
                        </div>

                        <div className="text-xs text-indigo-200 mt-2">
                          {[
                            brand.iab_tier_1,
                            brand.iab_tier_2,
                            brand.iab_tier_3,
                          ]
                            .filter(Boolean)
                            .join(" → ") || "Unclassified"}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}