"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";

function getTitle(item: any) {
  const combined = [item.advertiser, item.brand, item.product]
    .filter(Boolean)
    .join(" - ");

  return item.title || item.name || combined || "Monitoring Signal";
}

function getSpotCode(item: any) {
  return item.spot_code || item.spotCode || item.code || null;
}

export default function MonitoringPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMonitoring() {
      setLoading(true);

      const [
        spotsResult,
        campaignsResult,
        brandsResult,
        productsResult,
        audiencesResult,
      ] = await Promise.all([
        supabase.from("ad_spots").select("*"),
        supabase.from("campaigns").select("*"),
        supabase.from("brands").select("*"),
        supabase.from("products").select("*"),
        supabase.from("audiences").select("*"),
      ]);

      setSpots(spotsResult.data || []);
      setCampaigns(campaignsResult.data || []);
      setBrands(brandsResult.data || []);
      setProducts(productsResult.data || []);
      setAudiences(audiencesResult.data || []);
      setLoading(false);
    }

    loadMonitoring();
  }, []);

  const fallbackSignals = useMemo(() => {
    return [
      ...campaigns.slice(0, 5).map((item) => ({
        id: `campaign-${item.id}`,
        type: "Campaign",
        title: item.name,
        description: item.objective || "Campaign signal detected.",
      })),
      ...brands.slice(0, 5).map((item) => ({
        id: `brand-${item.id}`,
        type: "Brand",
        title: item.name,
        description: "Brand entity available for monitoring intelligence.",
      })),
      ...products.slice(0, 5).map((item) => ({
        id: `product-${item.id}`,
        type: "Product",
        title: item.name,
        description:
          item.description || item.category || "Product signal detected.",
      })),
      ...audiences.slice(0, 5).map((item) => ({
        id: `audience-${item.id}`,
        type: "Audience",
        title: item.name,
        description: item.description || "Audience segment detected.",
      })),
    ];
  }, [campaigns, brands, products, audiences]);

  const feed = spots.length > 0 ? spots : fallbackSignals;

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10">
          <div className="mb-10">
            <div className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
              Signal Observatory
            </div>

            <h1 className="text-7xl font-black mb-4 tracking-tight">
              Monitoring Center
            </h1>

            <p className="text-gray-300 text-lg max-w-3xl">
              TV advertising signals transformed into brand, product, campaign
              and audience intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-4xl font-black text-cyan-200">
                {spots.length}
              </div>
              <div className="text-sm text-gray-400 mt-2">TV Airings</div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-4xl font-black text-fuchsia-200">
                {brands.length}
              </div>
              <div className="text-sm text-gray-400 mt-2">Detected Brands</div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-4xl font-black text-indigo-200">
                {products.length}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Detected Products
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-4xl font-black text-green-200">
                {campaigns.length}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Campaign Signals
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-gray-300 backdrop-blur-xl">
              Loading monitoring center...
            </div>
          ) : (
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
              <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200 mb-3">
                Signal Feed
              </div>

              <h2 className="text-3xl font-black mb-6">
                Monitoring Intelligence Feed
              </h2>

              <div className="space-y-5">
                {feed.map((item: any) => {
                  const title = getTitle(item);
                  const spotCode = getSpotCode(item);

                  return (
                    <div
                      key={item.id}
                      className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-[0_0_35px_rgba(255,255,255,0.04)]"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                        <div>
                          <div className="mb-3 inline-flex rounded-full border border-green-300/30 bg-green-500/10 px-3 py-1 text-xs text-green-200">
                            {item.type || "AD SIGNAL"}
                          </div>

                          <h3 className="text-2xl font-black text-white mb-4">
                            {title}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                            {item.advertiser && (
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <div className="text-sm text-gray-400">
                                  Advertiser
                                </div>
                                <div className="font-bold">
                                  {item.advertiser}
                                </div>
                              </div>
                            )}

                            {item.brand && (
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <div className="text-sm text-gray-400">
                                  Brand
                                </div>
                                <div className="font-bold">{item.brand}</div>
                              </div>
                            )}

                            {item.product && (
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <div className="text-sm text-gray-400">
                                  Product
                                </div>
                                <div className="font-bold">{item.product}</div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 text-sm text-gray-300">
                            {item.network && <div>Network: {item.network}</div>}
                            {item.program && <div>Program: {item.program}</div>}
                            {spotCode && <div>Spot Code: {spotCode}</div>}

                            {item.description && (
                              <div className="leading-6">
                                {item.description}
                              </div>
                            )}

                            {item.transcript && (
                              <div className="leading-6">
                                {item.transcript}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {(item.duration || item.duration_seconds) && (
                            <div className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-3 text-cyan-100">
                              {item.duration || item.duration_seconds} sec
                            </div>
                          )}

                          <div className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-3 text-fuchsia-100">
                            AI
                          </div>

                          <div className="rounded-2xl border border-green-300/30 bg-green-500/10 px-4 py-3 text-green-100">
                            Graph
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-4 text-sm text-fuchsia-100">
                        AI pipeline: monitoring signal → entity extraction →
                        graph linking → IAB classification → Brand Galaxy
                        insight
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}