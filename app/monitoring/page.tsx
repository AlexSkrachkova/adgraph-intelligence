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

function MetricCard({ value, label, tone }: any) {
  const color =
    tone === "pink"
      ? "text-fuchsia-200"
      : tone === "indigo"
      ? "text-indigo-200"
      : tone === "green"
      ? "text-green-200"
      : "text-cyan-200";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20">
      <div className={`text-4xl font-black ${color}`}>{value}</div>
      <div className="mt-2 text-sm text-gray-400">{label}</div>
    </div>
  );
}

function normalizeMonitoringSpot(item: any) {
  const title = getTitle(item);
  const spotCode = getSpotCode(item);

  return {
    id: `spot-${item.id || spotCode || title}`,
    type: item.type || "AD SIGNAL",
    title,
    advertiser: item.advertiser || item.brand || "Monitoring Intelligence",
    brand: item.brand || item.advertiser || "Detected Brand",
    product: item.product || item.product_name || "Advertising Signal",
    network: item.network || item.channel || "Broadcast Intelligence",
    program: item.program || item.show_name || "Monitoring Feed",
    duration: item.duration || item.duration_seconds || 30,
    spotCode,
    description:
      item.description ||
      item.objective ||
      "Monitoring signal detected and prepared for Brand Galaxy intelligence analysis.",
    transcript:
      item.transcript ||
      "Signal classified through monitoring intelligence and linked to graph-ready advertising context.",
    source: "Live monitoring table",
  };
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
      ...campaigns.slice(0, 6).map((item) => ({
        id: `campaign-${item.id}`,
        type: "CAMPAIGN SIGNAL",
        title: item.name || "Campaign Signal",
        advertiser: item.brand || item.advertiser || "Campaign Intelligence",
        brand: item.brand || item.name || "Campaign Brand",
        product: item.product || "Strategic Campaign",
        network: "Cross-Platform",
        program: "Campaign Monitoring",
        duration: 30,
        description:
          item.objective ||
          item.description ||
          "Campaign activity detected and connected to Brand Galaxy strategic intelligence.",
        transcript:
          "Campaign signal classified and linked to strategic advertising intelligence.",
        source: "Campaign table",
      })),

      ...brands.slice(0, 6).map((item) => ({
        id: `brand-${item.id}`,
        type: "BRAND SIGNAL",
        title: item.name || "Brand Signal",
        advertiser: item.name || "Brand Intelligence",
        brand: item.name || "Detected Brand",
        product: "Brand Ecosystem",
        network: "Brand Galaxy",
        program: item.industry || "Brand Monitoring",
        duration: 15,
        description:
          item.description ||
          "Brand entity detected across ecosystem intelligence relationships.",
        transcript:
          "Brand connected to campaigns, products, competitors and audience targeting layers.",
        source: "Brand table",
      })),

      ...products.slice(0, 6).map((item) => ({
        id: `product-${item.id}`,
        type: "PRODUCT SIGNAL",
        title: item.name || "Product Signal",
        advertiser: item.brand || "Product Intelligence",
        brand: item.brand || "Product Intelligence",
        product: item.name || "Detected Product",
        network: "Commerce Intelligence",
        program: item.category || item.product_type || "Product Monitoring",
        duration: 20,
        description:
          item.description ||
          item.category ||
          "Product signal detected in strategic ecosystem analysis.",
        transcript:
          "Product mapped into campaign, audience and relationship intelligence graph.",
        source: "Product table",
      })),

      ...audiences.slice(0, 6).map((item) => ({
        id: `audience-${item.id}`,
        type: "AUDIENCE SIGNAL",
        title: item.name || "Audience Signal",
        advertiser: "Audience Intelligence",
        brand: item.name || "Audience Segment",
        product: "Targeting Segment",
        network: "AI Audience Layer",
        program: "Audience Monitoring",
        duration: 10,
        description:
          item.description ||
          "Audience targeting segment detected in monitoring ecosystem.",
        transcript:
          "Audience signal classified for strategic targeting and ecosystem analysis.",
        source: "Audience table",
      })),
    ];
  }, [campaigns, brands, products, audiences]);

  const monitoringFeed = useMemo(() => {
    const enrichedSpots = spots.map(normalizeMonitoringSpot);
    const fallbackOnlyNew = fallbackSignals.filter(
      (fallback) => !enrichedSpots.some((spot) => spot.title === fallback.title)
    );

    return [...enrichedSpots, ...fallbackOnlyNew].slice(0, 16);
  }, [spots, fallbackSignals]);

  const featuredSignal = monitoringFeed[0];

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white sm:px-6 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10">
          <div className="mb-10">
            <div className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
              Signal Observatory
            </div>

            <h1 className="mb-4 text-5xl font-black tracking-tight sm:text-7xl">
              Monitoring Center
            </h1>

            <p className="max-w-3xl text-lg leading-8 text-gray-300">
              Advertising signals transformed into brand, product, campaign and
              audience intelligence for the Brand Galaxy graph.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard value={spots.length} label="TV Airings" tone="cyan" />
            <MetricCard value={brands.length} label="Detected Brands" tone="pink" />
            <MetricCard
              value={products.length}
              label="Detected Products"
              tone="indigo"
            />
            <MetricCard
              value={campaigns.length}
              label="Campaign Signals"
              tone="green"
            />
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-gray-300 backdrop-blur-xl">
              Loading monitoring center...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
              <aside className="rounded-[2rem] border border-cyan-300/20 bg-cyan-500/10 p-6 backdrop-blur-xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
                <div className="mb-3 text-xs uppercase tracking-[0.3em] text-cyan-200">
                  Intelligence Snapshot
                </div>

                <h2 className="mb-6 text-3xl font-black">
                  Signal Command View
                </h2>

                {featuredSignal ? (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                    <div className="mb-3 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
                      {featuredSignal.type}
                    </div>

                    <h3 className="mb-4 text-2xl font-black">
                      {featuredSignal.title}
                    </h3>

                    <div className="space-y-3 text-sm text-gray-300">
                      <div>
                        Brand:
                        <span className="ml-2 font-semibold text-white">
                          {featuredSignal.brand}
                        </span>
                      </div>

                      <div>
                        Product:
                        <span className="ml-2 font-semibold text-white">
                          {featuredSignal.product}
                        </span>
                      </div>

                      <div>
                        Network:
                        <span className="ml-2 font-semibold text-white">
                          {featuredSignal.network}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5 text-sm text-gray-400">
                    No monitoring signals found yet.
                  </div>
                )}

                <div className="mt-5 rounded-3xl border border-white/10 bg-black/24 p-5">
                  <div className="mb-3 text-sm font-semibold text-cyan-200">
                    Pipeline Status
                  </div>

                  <div className="space-y-3 text-sm text-gray-300">
                    <div>✦ Entity extraction ready</div>
                    <div>✦ Graph linking active</div>
                    <div>✦ IAB classification layer prepared</div>
                    <div>✦ Brand Galaxy insight generation enabled</div>
                  </div>
                </div>
              </aside>

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
                <div className="mb-3 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                  Signal Feed
                </div>

                <h2 className="mb-6 text-3xl font-black">
                  Monitoring Intelligence Feed
                </h2>

                {monitoringFeed.length === 0 ? (
                  <div className="rounded-[2rem] border border-white/10 bg-black/30 p-8 text-gray-300">
                    No monitoring signals available yet. Import campaigns,
                    brands, products or audiences to populate this feed.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {monitoringFeed.map((item: any) => {
                      return (
                        <div
                          key={item.id}
                          className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-[0_0_35px_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-black/40"
                        >
                          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="mb-3 inline-flex rounded-full border border-green-300/30 bg-green-500/10 px-3 py-1 text-xs text-green-200">
                                {item.type}
                              </div>

                              <h3 className="mb-4 text-2xl font-black text-white">
                                {item.title}
                              </h3>

                              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                  <div className="text-sm text-gray-400">
                                    Advertiser
                                  </div>
                                  <div className="font-bold">
                                    {item.advertiser}
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                  <div className="text-sm text-gray-400">
                                    Brand
                                  </div>
                                  <div className="font-bold">{item.brand}</div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                  <div className="text-sm text-gray-400">
                                    Product
                                  </div>
                                  <div className="font-bold">{item.product}</div>
                                </div>
                              </div>

                              <div className="space-y-2 text-sm text-gray-300">
                                {item.network && (
                                  <div>Network: {item.network}</div>
                                )}

                                {item.program && (
                                  <div>Program: {item.program}</div>
                                )}

                                {item.spotCode && (
                                  <div>Spot Code: {item.spotCode}</div>
                                )}

                                {item.description && (
                                  <div className="leading-6">
                                    {item.description}
                                  </div>
                                )}

                                {item.transcript && (
                                  <div className="leading-6 text-gray-400">
                                    {item.transcript}
                                  </div>
                                )}

                                {item.source && (
                                  <div className="pt-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                                    Source: {item.source}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {item.duration && (
                                <div className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-3 text-cyan-100">
                                  {item.duration} sec
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
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
