"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";

type GroupMode = "campaign" | "product" | "brand";

function getTitle(item: any) {
  const combined = [item.advertiser, item.brand, item.product]
    .filter(Boolean)
    .join(" - ");

  return item.title || item.name || combined || "Monitoring Signal";
}

function getSpotCode(item: any) {
  return item.spot_code || item.spotCode || item.code || null;
}

function getIabClass(item: any) {
  return (
    item.iab_class ||
    item.iabClass ||
    item.iab_category ||
    item.iabCategory ||
    item.iab_tier_1 ||
    item.iabTier1 ||
    null
  );
}

function dedupe(values: any[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeText(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCanonicalProductName(value: string) {
  const normalized = normalizeText(value);

  if (!normalized) return "Unspecified Product";

  if (
    normalized.includes("zero sugar") ||
    normalized.includes("coke zero") ||
    normalized.includes("coca cola zero")
  ) {
    return "Coca-Cola Zero Sugar";
  }

  if (normalized.includes("coca cola") || normalized === "coke") {
    return "Coca-Cola";
  }

  if (normalized.includes("big mac")) {
    return "Big Mac";
  }

  if (normalized.includes("whopper")) {
    return "Whopper";
  }

  if (normalized.includes("kfc")) {
    return "KFC Bucket";
  }

  if (normalized.includes("air max")) {
    return "Nike Air Max";
  }

  if (normalized.includes("ultraboost")) {
    return "Adidas Ultraboost";
  }

  return value || "Unspecified Product";
}

function getCampaignObjectName(item: any) {
  if (item.source === "campaigns table") return item.title;
  if (item.campaign || item.campaign_name) return item.campaign || item.campaign_name;
  return item.title || "Unassigned Campaign";
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-[11px] font-black text-cyan-100">
        i
      </span>

      <span className="pointer-events-none absolute right-0 top-7 z-50 hidden w-72 rounded-2xl border border-cyan-300/20 bg-slate-950/95 p-4 text-left text-xs leading-5 text-gray-200 shadow-[0_0_35px_rgba(34,211,238,0.16)] backdrop-blur-xl group-hover:block">
        {text}
      </span>
    </span>
  );
}

function MetricCard({
  value,
  label,
  tone,
  tooltip,
  source,
}: {
  value: number;
  label: string;
  tone?: "cyan" | "pink" | "indigo" | "green";
  tooltip: string;
  source: string;
}) {
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
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className={`text-4xl font-black ${color}`}>{value}</div>
        <InfoTooltip text={tooltip} />
      </div>

      <div className="text-sm font-semibold text-gray-200">{label}</div>
      <div className="mt-2 text-xs leading-5 text-gray-500">{source}</div>
    </div>
  );
}

function ExplanationCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/24 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-cyan-100">{title}</h3>
        <InfoTooltip text="This explanatory panel is part of the clarity layer. It explains what the numbers and labels mean before any deeper AI inference is applied." />
      </div>

      <div className="space-y-2 text-sm leading-6 text-gray-300">{children}</div>
    </div>
  );
}

function normalizeMonitoringSpot(item: any) {
  const title = getTitle(item);
  const spotCode = getSpotCode(item);
  const iabClass = getIabClass(item);

  return {
    id: `spot-${item.id || spotCode || title}`,
    type: item.type || "AD SIGNAL",
    title,
    advertiser: item.advertiser || item.brand || "Monitoring Intelligence",
    brand: item.brand || item.advertiser || "Detected Brand",
    product: item.product || item.product_name || "Advertising Signal",
    canonicalProduct: getCanonicalProductName(
      item.product || item.product_name || "Advertising Signal"
    ),
    campaignObject: getCampaignObjectName(item),
    network: item.network || item.channel || "Broadcast Intelligence",
    program: item.program || item.show_name || "Monitoring Feed",
    duration: item.duration || item.duration_seconds || 30,
    spotCode,
    iabClass: iabClass || "Unclassified / pending IAB mapping",
    classificationSource: iabClass
      ? "IAB classification imported from monitoring dataset"
      : "No IAB class found in source row",
    description:
      item.description ||
      item.objective ||
      "Monitoring signal detected and prepared for Brand Galaxy intelligence analysis.",
    transcript:
      item.transcript ||
      "Signal classified through monitoring intelligence and linked to graph-ready advertising context.",
    source: "ad_spots table",
  };
}

export default function MonitoringPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupMode, setGroupMode] = useState<GroupMode>("campaign");

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
        canonicalProduct: getCanonicalProductName(
          item.product || item.name || "Strategic Campaign"
        ),
        campaignObject: item.name || "Campaign Signal",
        network: "Cross-Platform",
        program: "Campaign Monitoring",
        duration: 30,
        spotCode: null,
        iabClass:
          item.iab_class ||
          item.iab_tier_1 ||
          "Unclassified / pending IAB mapping",
        classificationSource: item.iab_class
          ? "IAB class imported with campaign record"
          : "No IAB class found in campaign row",
        description:
          item.objective ||
          item.description ||
          "Campaign activity detected and connected to Brand Galaxy strategic intelligence.",
        transcript:
          "Campaign signal classified and linked to strategic advertising intelligence.",
        source: "campaigns table",
      })),

      ...brands.slice(0, 6).map((item) => ({
        id: `brand-${item.id}`,
        type: "BRAND SIGNAL",
        title: item.name || "Brand Signal",
        advertiser: item.name || "Brand Intelligence",
        brand: item.name || "Detected Brand",
        product: "Brand Ecosystem",
        canonicalProduct: "Brand Ecosystem",
        campaignObject: item.name || "Brand Signal",
        network: "Brand Galaxy",
        program: item.industry || "Brand Monitoring",
        duration: 15,
        spotCode: null,
        iabClass:
          item.iab_class ||
          item.iab_tier_1 ||
          "Unclassified / pending IAB mapping",
        classificationSource: item.iab_class
          ? "IAB class imported with brand record"
          : "No IAB class found in brand row",
        description:
          item.description ||
          "Brand entity detected across ecosystem intelligence relationships.",
        transcript:
          "Brand connected to campaigns, products, competitors and audience targeting layers.",
        source: "brands table",
      })),

      ...products.slice(0, 6).map((item) => ({
        id: `product-${item.id}`,
        type: "PRODUCT SIGNAL",
        title: item.name || "Product Signal",
        advertiser: item.brand || "Product Intelligence",
        brand: item.brand || "Product Intelligence",
        product: item.name || "Detected Product",
        canonicalProduct: getCanonicalProductName(item.name || "Detected Product"),
        campaignObject: item.campaign || item.campaign_name || item.name || "Product Signal",
        network: "Commerce Intelligence",
        program: item.category || item.product_type || "Product Monitoring",
        duration: 20,
        spotCode: null,
        iabClass:
          item.iab_class ||
          item.iab_tier_1 ||
          item.category ||
          "Unclassified / pending IAB mapping",
        classificationSource:
          item.iab_class || item.iab_tier_1
            ? "IAB class imported with product record"
            : "Product category used as fallback until IAB class is imported",
        description:
          item.description ||
          item.category ||
          "Product signal detected in strategic ecosystem analysis.",
        transcript:
          "Product mapped into campaign, audience and relationship intelligence graph.",
        source: "products table",
      })),

      ...audiences.slice(0, 6).map((item) => ({
        id: `audience-${item.id}`,
        type: "AUDIENCE SIGNAL",
        title: item.name || "Audience Signal",
        advertiser: "Audience Intelligence",
        brand: item.name || "Audience Segment",
        product: "Targeting Segment",
        canonicalProduct: "Targeting Segment",
        campaignObject: item.name || "Audience Signal",
        network: "AI Audience Layer",
        program: "Audience Monitoring",
        duration: 10,
        spotCode: null,
        iabClass:
          item.iab_class ||
          item.iab_tier_1 ||
          "Audience segment / non-IAB entity",
        classificationSource:
          "Audience records may not map directly to IAB content taxonomy.",
        description:
          item.description ||
          "Audience targeting segment detected in monitoring ecosystem.",
        transcript:
          "Audience signal classified for strategic targeting and ecosystem analysis.",
        source: "audiences table",
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

  const uniqueAdvertisers = useMemo(() => {
    return new Set(monitoringFeed.map((item) => item.advertiser).filter(Boolean))
      .size;
  }, [monitoringFeed]);

  const uniqueFeedProducts = useMemo(() => {
    return new Set(monitoringFeed.map((item) => item.product).filter(Boolean))
      .size;
  }, [monitoringFeed]);

  const groupedSignals = useMemo(() => {
    const groups: Record<string, any[]> = {};

    monitoringFeed.forEach((item) => {
      const key =
        groupMode === "campaign"
          ? item.campaignObject || item.title || "Unknown Campaign"
          : groupMode === "product"
          ? item.canonicalProduct || item.product || "Unknown Product"
          : item.brand || "Unknown Brand";

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups)
      .map(([key, signals]) => ({
        key,
        signals,
        count: signals.length,
        brands: dedupe(signals.map((signal) => signal.brand)),
        products: dedupe(signals.map((signal) => signal.canonicalProduct || signal.product)),
        rawProducts: dedupe(signals.map((signal) => signal.product)),
        campaigns: dedupe(signals.map((signal) => signal.campaignObject || signal.title)),
        advertisers: dedupe(signals.map((signal) => signal.advertiser)),
        iabClasses: dedupe(signals.map((signal) => signal.iabClass)),
        sources: dedupe(signals.map((signal) => signal.source)),
      }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  }, [monitoringFeed, groupMode]);

  const groupModeDescription =
    groupMode === "campaign"
      ? "Grouping by campaign shows which products, brands, IAB classes and signals appear inside each campaign object."
      : groupMode === "product"
      ? "Grouping by product uses canonical product naming, so variants like Zero Sugar / Coke Zero are reviewed as one product family."
      : "Grouping by brand shows all products, campaigns, IAB classes and signals connected to each brand.";

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

          <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              value={spots.length}
              label="Imported TV Airings"
              tone="cyan"
              source="Source: ad_spots table"
              tooltip="Total imported advertising spots in the current monitoring dataset. If this number is 5, it means 5 individual airing rows currently exist in the ad_spots table."
            />

            <MetricCard
              value={brands.length}
              label="Brand Records"
              tone="pink"
              source="Source: brands table"
              tooltip="Total unique brand records stored in the Brand Galaxy brands table. This is not the same as company ownership. One company can own many brands, and one imported dataset may not include every brand."
            />

            <MetricCard
              value={products.length}
              label="Product Records"
              tone="indigo"
              source="Source: products table"
              tooltip="Total product records stored in the products table. Product names may need normalization when variants like Zero Sugar, Coke Zero or Coca-Cola Zero Sugar describe the same product family."
            />

            <MetricCard
              value={campaigns.length}
              label="Campaign Records"
              tone="green"
              source="Source: campaigns table"
              tooltip="Total campaign records currently stored in the campaigns table. Multiple ads can belong to the same campaign, and one product can appear in multiple campaigns."
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <ExplanationCard title="Dataset Context">
              <p>
                The metrics above come from separate database tables. TV airings
                are raw monitoring rows, while brands, products and campaigns
                are normalized intelligence entities.
              </p>
              <p>
                This means the numbers are not expected to match one-to-one.
                Example: 5 imported airings can still connect to 30 existing
                brand records if the brand table already contains broader demo
                or imported data.
              </p>
            </ExplanationCard>

            <ExplanationCard title="Classification Method">
              <p>
                IAB labels refer to advertising/content classification based on
                the IAB taxonomy when such data exists in the import.
              </p>
              <p>
                If an item is marked as unclassified, it means the current source
                row did not include an IAB class and the platform is showing a
                fallback explanation instead of pretending a class exists.
              </p>
            </ExplanationCard>

            <ExplanationCard title="Current Feed Scope">
              <p>
                The feed combines live rows from{" "}
                <span className="text-cyan-100">ad_spots</span> with existing
                campaign, brand, product and audience records so the dashboard
                remains useful even before a full Nielsen-style export is
                imported.
              </p>
              <p>
                Feed-level unique advertisers: {uniqueAdvertisers}. Feed-level
                unique products: {uniqueFeedProducts}.
              </p>
            </ExplanationCard>
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-gray-300 backdrop-blur-xl">
              Loading monitoring center...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
              <aside className="rounded-[2rem] border border-cyan-300/20 bg-cyan-500/10 p-6 backdrop-blur-xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-cyan-200">
                    Intelligence Snapshot
                  </div>
                  <InfoTooltip text="This panel highlights the first available signal in the monitoring feed. It is a snapshot, not a total count." />
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
                        <span className="ml-2 break-words font-semibold text-white">
                          {featuredSignal.product}
                        </span>
                      </div>

                      <div>
                        Network:
                        <span className="ml-2 font-semibold text-white">
                          {featuredSignal.network}
                        </span>
                      </div>

                      <div>
                        IAB:
                        <span className="ml-2 font-semibold text-white">
                          {featuredSignal.iabClass}
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
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-cyan-200">
                      Pipeline Status
                    </div>
                    <InfoTooltip text="This describes the intended intelligence pipeline: raw monitoring row, entity extraction, graph linking, classification, then Brand Galaxy insight generation." />
                  </div>

                  <div className="space-y-3 text-sm text-gray-300">
                    <div>✦ Entity extraction ready</div>
                    <div>✦ Graph linking active</div>
                    <div>✦ IAB classification layer prepared</div>
                    <div>✦ Brand Galaxy insight generation enabled</div>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-black/24 p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-fuchsia-200">
                      Active Grouping
                    </div>
                    <InfoTooltip text="Grouping does not change the raw data. It only changes how the monitoring feed is organized for review: by campaign, product or brand." />
                  </div>

                  <div className="text-sm leading-6 text-gray-300">
                    {groupModeDescription}
                  </div>
                </div>
              </aside>

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                    Signal Feed
                  </div>
                  <InfoTooltip text="The Monitoring Intelligence Feed shows the current working dataset: imported ad spots first, then fallback graph entities so the dashboard remains informative while a full monitoring export is not yet loaded." />
                </div>

                <h2 className="mb-2 text-3xl font-black">
                  Monitoring Intelligence Feed
                </h2>

                <p className="mb-6 text-sm leading-6 text-gray-400">
                  Each card now represents one grouped intelligence object. Use
                  the controls below to review the same monitoring data by
                  campaign, by canonical product, or by brand. IAB classes are
                  shown inside every grouped object so the classification is
                  visibly linked to the campaign/product/brand context.
                </p>

                <div className="mb-6 flex flex-wrap gap-3">
                  {[
                    { key: "campaign", label: "Group by Campaign" },
                    { key: "product", label: "Group by Product" },
                    { key: "brand", label: "Group by Brand" },
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => setGroupMode(mode.key as GroupMode)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition duration-300 ${
                        groupMode === mode.key
                          ? "border-cyan-300/40 bg-cyan-500/15 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.1)]"
                          : "border-white/10 bg-black/25 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {groupedSignals.length === 0 ? (
                  <div className="rounded-[2rem] border border-white/10 bg-black/30 p-8 text-gray-300">
                    No monitoring signals available yet. Import campaigns,
                    brands, products or audiences to populate this feed.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupedSignals.map((group) => {
                      const primarySignal = group.signals[0];

                      return (
                        <div
                          key={group.key}
                          className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-[0_0_35px_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-black/40"
                        >
                          <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                              <div className="mb-3 inline-flex rounded-full border border-green-300/30 bg-green-500/10 px-3 py-1 text-xs text-green-200">
                                GROUPED BY {groupMode.toUpperCase()}
                              </div>

                              <h3 className="break-words text-2xl font-black text-white">
                                {group.key}
                              </h3>

                              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
                                This grouped object contains {group.count} signal
                                {group.count === 1 ? "" : "s"} connected to{" "}
                                {group.products.length} product
                                {group.products.length === 1 ? "" : "s"},{" "}
                                {group.brands.length} brand
                                {group.brands.length === 1 ? "" : "s"} and{" "}
                                {group.campaigns.length} campaign
                                {group.campaigns.length === 1 ? "" : "s"}.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <div className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-3 text-cyan-100">
                                {group.count} signal
                                {group.count === 1 ? "" : "s"}
                              </div>

                              <div className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-3 text-fuchsia-100">
                                {group.products.length} product
                                {group.products.length === 1 ? "" : "s"}
                              </div>

                              <div className="rounded-2xl border border-green-300/30 bg-green-500/10 px-4 py-3 text-green-100">
                                {group.brands.length} brand
                                {group.brands.length === 1 ? "" : "s"}
                              </div>
                            </div>
                          </div>

                          <div className="mb-5 rounded-3xl border border-cyan-300/20 bg-cyan-500/8 p-5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="text-sm font-bold text-cyan-100">
                                Intelligence Relationship Summary
                              </div>
                              <InfoTooltip text="This box links the grouped object to its core advertising intelligence structure: campaign, canonical product, brand, source signals and IAB classification." />
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 2xl:grid-cols-4">
                              <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                                <div className="mb-1 text-xs uppercase tracking-[0.2em] text-fuchsia-300">
                                  Campaign Object
                                </div>
                                <div className="break-words font-semibold text-white">
                                  {group.campaigns[0] || "Unassigned Campaign"}
                                </div>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                                <div className="mb-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
                                  Canonical Product
                                </div>
                                <div className="break-words font-semibold text-white">
                                  {group.products[0] || "Unspecified Product"}
                                </div>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                                <div className="mb-1 text-xs uppercase tracking-[0.2em] text-green-300">
                                  Brand Context
                                </div>
                                <div className="break-words font-semibold text-white">
                                  {group.brands[0] || "Unassigned Brand"}
                                </div>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                                <div className="mb-1 text-xs uppercase tracking-[0.2em] text-amber-300">
                                  IAB Link
                                </div>
                                <div className="break-words font-semibold text-white">
                                  {group.iabClasses[0] ||
                                    "Unclassified / pending IAB mapping"}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 text-sm leading-6 text-gray-300">
                              This object connects{" "}
                              <span className="font-semibold text-cyan-100">
                                {group.count} signal{group.count === 1 ? "" : "s"}
                              </span>{" "}
                              to{" "}
                              <span className="font-semibold text-fuchsia-100">
                                {group.campaigns.length} campaign
                                {group.campaigns.length === 1 ? "" : "s"}
                              </span>
                              ,{" "}
                              <span className="font-semibold text-cyan-100">
                                {group.products.length} canonical product
                                {group.products.length === 1 ? "" : "s"}
                              </span>{" "}
                              and{" "}
                              <span className="font-semibold text-green-100">
                                {group.brands.length} brand
                                {group.brands.length === 1 ? "" : "s"}
                              </span>
                              . Duplicate-looking products or campaigns are
                              grouped here when they refer to the same object
                              perspective.
                            </div>
                          </div>

                          <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                                Related Products
                                <InfoTooltip text="Products found inside this group. When grouped by product, this usually shows the canonical product object for the group." />
                              </div>

                              <div className="space-y-2 text-sm text-gray-300">
                                {group.products.slice(0, 6).map((product) => (
                                  <div key={product}>{product}</div>
                                ))}

                                {group.rawProducts?.length > group.products.length && (
                                  <div className="pt-2 text-xs leading-5 text-gray-500">
                                    Raw product variants detected:{" "}
                                    {group.rawProducts.join(", ")}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-fuchsia-300">
                                Related Campaigns
                                <InfoTooltip text="Campaigns found inside this group. When grouped by campaign, this shows the campaign object plus any duplicate or related campaign labels." />
                              </div>

                              <div className="space-y-2 text-sm text-gray-300">
                                {group.campaigns.slice(0, 6).map((campaign) => (
                                  <div key={campaign}>{campaign}</div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-green-300">
                                Related Brands
                                <InfoTooltip text="Brands found inside this group. This helps distinguish commercial brands from legal companies or owners." />
                              </div>

                              <div className="space-y-2 text-sm text-gray-300">
                                {group.brands.slice(0, 6).map((brand) => (
                                  <div key={brand}>{brand}</div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                              <div className="mb-1 flex items-center justify-between gap-2 text-sm text-gray-400">
                                Primary Advertiser
                                <InfoTooltip text="The first advertiser detected inside this grouped object. Additional advertisers appear in the grouped hierarchy if present." />
                              </div>
                              <div className="break-words font-bold">
                                {primarySignal.advertiser}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                              <div className="mb-1 flex items-center justify-between gap-2 text-sm text-gray-400">
                                Primary Brand
                                <InfoTooltip text="The first brand detected inside this grouped object. Brand grouping is based on normalized display labels from the current monitoring feed." />
                              </div>
                              <div className="break-words font-bold">
                                {primarySignal.brand}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                              <div className="mb-1 flex items-center justify-between gap-2 text-sm text-gray-400">
                                Primary Product
                                <InfoTooltip text="The first product detected inside this grouped object. Product-level normalization is the next phase, especially for variants like Zero Sugar / Coke Zero." />
                              </div>
                              <div className="break-words font-bold">
                                {primarySignal.canonicalProduct ||
                                  primarySignal.product}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                              <div className="mb-1 flex items-center justify-between gap-2 text-sm text-gray-400">
                                IAB Class
                                <InfoTooltip text="Classification based on IAB taxonomy when imported. If missing, this field explicitly says that mapping is pending instead of hiding the absence." />
                              </div>
                              <div className="break-words font-bold">
                                {group.iabClasses[0] ||
                                  "Unclassified / pending IAB mapping"}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {group.signals.slice(0, 4).map((signal) => (
                              <div
                                key={signal.id}
                                className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                              >
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                                    {signal.type}
                                  </div>

                                  {signal.duration && (
                                    <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-gray-300">
                                      {signal.duration} sec
                                    </div>
                                  )}

                                  {signal.spotCode && (
                                    <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
                                      Spot: {signal.spotCode}
                                    </div>
                                  )}
                                </div>

                                <div className="font-semibold text-white">
                                  {signal.title}
                                </div>

                                <div className="mt-2 text-sm leading-6 text-gray-400">
                                  {signal.description}
                                </div>

                                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">
                                  Source: {signal.source} · Classification:{" "}
                                  {signal.classificationSource}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-4 text-sm leading-6 text-fuchsia-100">
                            Grouping view: this card summarizes multiple
                            monitoring signals around one{" "}
                            {groupMode === "campaign"
                              ? "campaign"
                              : groupMode === "product"
                              ? "product"
                              : "brand"}{" "}
                            object. IAB, product, campaign and brand are now
                            displayed together so the classification and the
                            extracted entity structure are connected in one
                            readable intelligence object. Switch the grouping
                            mode above to inspect the same dataset from another
                            perspective.
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
