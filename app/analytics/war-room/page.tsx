"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";
import BrandIntelligenceModal from "@/app/components/BrandIntelligenceModal";
import { buildBrandProfile, type BrandIntelligenceProfile } from "@/lib/brandProfiles";

type Metric = {
  label: string;
  value: number;
  helper: string;
  tone: "fuchsia" | "cyan" | "emerald" | "amber" | "indigo";
  detailTitle: string;
  detailSubtitle: string;
  detailBullets: string[];
  relatedAction?: {
    label: string;
    href: string;
  };
};

type InfoModal = {
  label: string;
  title: string;
  subtitle: string;
  bullets: string[];
  stats?: { label: string; value: string | number }[];
  chips?: string[];
  href?: string;
  hrefLabel?: string;
};

function getToneClasses(tone: Metric["tone"]) {
  if (tone === "cyan") {
    return {
      border: "border-cyan-300/25",
      bg: "bg-cyan-500/10",
      text: "text-cyan-100",
      glow: "shadow-[0_0_55px_rgba(34,211,238,0.1)]",
    };
  }

  if (tone === "emerald") {
    return {
      border: "border-emerald-300/25",
      bg: "bg-emerald-500/10",
      text: "text-emerald-100",
      glow: "shadow-[0_0_55px_rgba(52,211,153,0.1)]",
    };
  }

  if (tone === "amber") {
    return {
      border: "border-amber-300/25",
      bg: "bg-amber-500/10",
      text: "text-amber-100",
      glow: "shadow-[0_0_55px_rgba(245,158,11,0.1)]",
    };
  }

  if (tone === "indigo") {
    return {
      border: "border-indigo-300/25",
      bg: "bg-indigo-500/10",
      text: "text-indigo-100",
      glow: "shadow-[0_0_55px_rgba(129,140,248,0.1)]",
    };
  }

  return {
    border: "border-fuchsia-300/25",
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-100",
    glow: "shadow-[0_0_55px_rgba(217,70,239,0.1)]",
  };
}

function buildIabLabel(entity: any) {
  return (
    [entity?.iab_tier_1, entity?.iab_tier_2, entity?.iab_tier_3]
      .filter(Boolean)
      .join(" → ") || "Pending Classification"
  );
}

function cleanText(value?: string | null) {
  return (value || "").trim();
}

function MetricTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex">
      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[10px] font-bold text-gray-300">
        i
      </div>

      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[#020617] p-3 text-xs leading-5 text-gray-300 shadow-2xl group-hover:block">
        {text}
      </div>
    </div>
  );
}

function BrandLogo({ brand }: { brand: any }) {
  const logoUrl = brand?.logo_url || brand?.logoUrl || brand?.logo || "";
  const name = brand?.name || "Brand";

  if (!logoUrl) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 text-sm font-black text-fuchsia-100">
        {String(name).slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/90 p-1">
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="max-h-full max-w-full object-contain"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

export default function StrategyHubPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [recentBrands, setRecentBrands] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [taxonomy, setTaxonomy] = useState<any[]>([]);
  const [spots, setSpots] = useState<any[]>([]);
  const [modal, setModal] = useState<InfoModal | null>(null);
  const [selectedBrandProfile, setSelectedBrandProfile] = useState<BrandIntelligenceProfile | null>(null);

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

      const companiesData = companiesResult.data || [];
      const brandsData = brandsResult.data || [];
      const productsData = productsResult.data || [];
      const campaignsData = campaignsResult.data || [];
      const audiencesData = audiencesResult.data || [];
      const relationshipsData = relationshipsResult.data || [];
      const taxonomyData = taxonomyResult.data || [];
      const spotsData = spotsResult.data || [];

      const uniqueBrands = new Set(
        brandsData.map((b: any) => (b.name || "").trim().toLowerCase())
      ).size;

      const uniqueProducts = new Set(
        productsData.map((p: any) =>
          (p.name || p.product_name || "").trim().toLowerCase()
        )
      ).size;

      const uniqueCampaigns = new Set(
        campaignsData.map((c: any) =>
          (c.name || c.campaign_name || "").trim().toLowerCase()
        )
      ).size;

      const uniqueCompanies = new Set(
        companiesData.map((c: any) => (c.name || "").trim().toLowerCase())
      ).size;

      const usableGraphSignals = relationshipsData.filter((r: any) =>
        ["owned_by", "has_product", "runs_campaign", "promotes", "targets"].includes(
          r.relationship_type
        )
      ).length;

      setCompanies(companiesData);
      setProducts(productsData);
      setCampaigns(campaignsData.slice(0, 8));
      setAudiences(audiencesData);
      setRelationships(relationshipsData);
      setTaxonomy(taxonomyData);
      setSpots(spotsData);
      setRecentBrands(brandsData.slice(0, 12));

      setMetrics([
        {
          label: "Brand Stars",
          value: uniqueBrands,
          helper: "Total number of brand entities currently stored in Brand Galaxy.",
          tone: "fuchsia",
          detailTitle: "Brand Stars",
          detailSubtitle: "Brands mapped inside the galaxy.",
          detailBullets: [
            "Represents every market-facing brand entity in the platform.",
            "Used by Strategy Hub, Galaxy Map, Monitoring and Galaxy Search.",
            "Brands become stronger when connected to products, campaigns, audiences and companies.",
          ],
          relatedAction: {
            label: "Open Galaxy Map",
            href: "/relationships",
          },
        },
        {
          label: "Products",
          value: uniqueProducts,
          helper: "Advertised products and services.",
          tone: "emerald",
          detailTitle: "Products",
          detailSubtitle: "Advertised products and services.",
          detailBullets: [
            "Represents products, product families and advertised service offers.",
            "Products connect brands to specific commercial propositions.",
            "Imported Nielsen/CSV and ARGUS signals can add products automatically when detected.",
          ],
          relatedAction: {
            label: "Open CSV Import",
            href: "/csv-import",
          },
        },
        {
          label: "Campaigns",
          value: uniqueCampaigns,
          helper: "Active campaign intelligence.",
          tone: "amber",
          detailTitle: "Campaigns",
          detailSubtitle: "Active campaign intelligence.",
          detailBullets: [
            "Campaigns group ad activity into recognizable marketing activations.",
            "They can connect to brands, products, objectives and audiences.",
            "Campaign Radar shows a short list of active or recently imported campaign objects.",
          ],
          relatedAction: {
            label: "Open Monitoring",
            href: "/monitoring",
          },
        },
        {
          label: "Audiences",
          value: audiencesData.length,
          helper: "Target audience clusters.",
          tone: "cyan",
          detailTitle: "Audiences",
          detailSubtitle: "Target audience clusters.",
          detailBullets: [
            "Audiences represent consumer segments, intent groups and campaign targeting clusters.",
            "They help explain who a brand, campaign or product is trying to reach.",
            "Audience links are shown as relationship edges in the graph.",
          ],
          relatedAction: {
            label: "Open Galaxy Map",
            href: "/relationships",
          },
        },
        {
          label: "Companies",
          value: uniqueCompanies,
          helper: "Ownership signals.",
          tone: "indigo",
          detailTitle: "Companies",
          detailSubtitle: "Ownership signals.",
          detailBullets: [
            "Companies represent owners, advertisers, holding groups or legal entities.",
            "Ownership signals connect brands to their parent or advertiser entity.",
            "This layer is important for brand history, subsidiaries and ownership changes.",
          ],
          relatedAction: {
            label: "Open Galaxy Search",
            href: "/entity-search",
          },
        },
        {
          label: "Graph Signals",
          value: usableGraphSignals,
          helper: "Relationship edges.",
          tone: "cyan",
          detailTitle: "Graph Signals",
          detailSubtitle: "Relationship edges.",
          detailBullets: [
            "Graph signals are the edges between entities: ownership, products, campaigns, audiences and competitors.",
            "The stronger the relationship layer, the more useful Galaxy Map becomes.",
            "These edges power relationship exploration and ecosystem summaries.",
          ],
          relatedAction: {
            label: "Open Relationship Graph",
            href: "/relationships",
          },
        },
        {
          label: "IAB Categories",
          value: taxonomyData.length,
          helper: "Taxonomy enrichment rows.",
          tone: "emerald",
          detailTitle: "IAB Categories",
          detailSubtitle: "Taxonomy enrichment rows.",
          detailBullets: [
            "IAB taxonomy rows enrich brands, products and campaigns with market context.",
            "They support filtering, category analysis and imported signal classification.",
            "ARGUS-provided IAB values are prioritized; local taxonomy matching can fill gaps.",
          ],
          relatedAction: {
            label: "Open Monitoring",
            href: "/monitoring",
          },
        },
        {
          label: "TV Airings",
          value: spotsData.length,
          helper: "Monitoring signals.",
          tone: "amber",
          detailTitle: "TV Airings",
          detailSubtitle: "Monitoring signals.",
          detailBullets: [
            "TV airings are raw monitoring events that can become intelligence objects.",
            "They are connected to clips, brands, products and campaign data when available.",
            "Clean import rules remove PRG, PROMO, digital and station-noise clips before enrichment.",
          ],
          relatedAction: {
            label: "Open Monitoring",
            href: "/monitoring",
          },
        },
      ]);

      setLoading(false);
    }

    loadHub();
  }, []);

  const galaxyScore = useMemo(() => {
    const brands = metrics.find((m) => m.label === "Brand Stars")?.value || 0;
    const productsCount = metrics.find((m) => m.label === "Products")?.value || 0;
    const campaignsCount = metrics.find((m) => m.label === "Campaigns")?.value || 0;
    const audiencesCount = metrics.find((m) => m.label === "Audiences")?.value || 0;
    const companiesCount = metrics.find((m) => m.label === "Companies")?.value || 0;
    const graphSignals = metrics.find((m) => m.label === "Graph Signals")?.value || 0;
    const iabRows = metrics.find((m) => m.label === "IAB Categories")?.value || 0;

    return Math.min(
      100,
      Math.round(
        brands * 1.6 +
          productsCount * 0.9 +
          campaignsCount * 1.8 +
          audiencesCount * 1.2 +
          companiesCount * 1.1 +
          graphSignals * 0.55 +
          Math.min(iabRows, 300) * 0.04
      )
    );
  }, [metrics]);

  const campaignStats = useMemo(() => {
    const withObjective = campaigns.filter((campaign) => cleanText(campaign.objective)).length;
    const classified = campaigns.filter((campaign) => buildIabLabel(campaign) !== "Pending Classification").length;

    return {
      visible: campaigns.length,
      withObjective,
      classified,
    };
  }, [campaigns]);

  const brandStats = useMemo(() => {
    const classified = recentBrands.filter((brand) => buildIabLabel(brand) !== "Pending Classification").length;
    const withDescription = recentBrands.filter((brand) => cleanText(brand.description)).length;
    const withLogo = recentBrands.filter((brand) => brand.logo_url || brand.logoUrl || brand.logo).length;

    return {
      visible: recentBrands.length,
      classified,
      withDescription,
      withLogo,
    };
  }, [recentBrands]);

  function getCampaignProductCount(campaign: any) {
    const campaignName = (campaign.name || campaign.campaign_name || "").toLowerCase().trim();

    return products.filter((product) => {
      const productCampaignId = product.campaign_id || product.campaignId;
      const productCampaignName = (product.campaign_name || product.campaign || "").toLowerCase().trim();

      return (
        productCampaignId === campaign.id ||
        (campaignName && productCampaignName && productCampaignName === campaignName)
      );
    }).length;
  }

  function openStoryModal() {
    setModal({
      label: "Strategy Hub Story",
      title: "Why this page exists",
      subtitle:
        "Strategy Hub is the executive layer of Brand Galaxy. It gathers the platform’s entity counts, campaign activity, graph signals and taxonomy coverage into one command view.",
      bullets: [
        "Monitoring brings in ARGUS, Nielsen/CSV and advertising signal data.",
        "CSV Import cleans, validates and enriches uploaded files before writing to Supabase.",
        "Relationship Graph turns brands, products, campaigns, audiences and companies into a connected galaxy map.",
        "Entity Search gives a searchable, logo-enriched directory for brands and related commercial entities.",
        "Strategy Hub summarizes the whole intelligence system for fast review and decision-making.",
      ],
      stats: [
        { label: "Brands", value: metrics.find((m) => m.label === "Brand Stars")?.value || 0 },
        { label: "Products", value: products.length },
        { label: "Campaigns", value: metrics.find((m) => m.label === "Campaigns")?.value || 0 },
        { label: "Graph edges", value: metrics.find((m) => m.label === "Graph Signals")?.value || 0 },
      ],
      chips: ["Monitoring", "CSV Import", "Relationship Graph", "Galaxy Search", "Strategy Hub"],
    });
  }

  function openQualityModal() {
    setModal({
      label: "Advertising Intelligence",
      title: "Coverage & Quality",
      subtitle:
        "Quality snapshot of how ready the Brand Galaxy dataset is for advertising intelligence, strategy review and demo presentation.",
      bullets: [
        "Logo Coverage shows how many visible brand profiles have a usable logo.",
        "Website Coverage shows how many brands have a verified or generated website URL.",
        "IAB Coverage shows how much taxonomy/category intelligence exists in the platform.",
        "Graph Density shows how many usable relationship edges connect brands, products, campaigns and companies.",
        "Use this panel before demos to quickly identify missing logos, weak categories or disconnected graph entities.",
      ],
      stats: [
        {
          label: "Logo Coverage",
          value: `${recentBrands.filter((b) => b.logo_url || b.logoUrl || b.logo).length} / ${recentBrands.length}`,
        },
        {
          label: "Website Coverage",
          value: `${recentBrands.filter((b) => b.website).length} / ${recentBrands.length}`,
        },
        {
          label: "IAB Coverage",
          value: metrics.find((m) => m.label === "IAB Categories")?.value || 0,
        },
        {
          label: "Graph Density",
          value: metrics.find((m) => m.label === "Graph Signals")?.value || 0,
        },
      ],
      chips: [
        "Data Quality",
        "IAB Coverage",
        "Logo Enrichment",
        "Graph Density",
        "Demo Readiness",
      ],
    });
  }

  function openMetricModal(metric: Metric) {
    setModal({
      label: "Metric Intelligence",
      title: metric.detailTitle,
      subtitle: metric.detailSubtitle,
      bullets: metric.detailBullets,
      stats: [
        { label: "Current total", value: metric.value },
        { label: "Platform area", value: metric.label },
      ],
      chips: [metric.helper, "Clickable KPI", "Strategy Hub"],
      href: metric.relatedAction?.href,
      hrefLabel: metric.relatedAction?.label,
    });
  }

  function openCampaignModal(campaign: any) {
    const productCount = getCampaignProductCount(campaign);

    setModal({
      label: "Campaign Radar",
      title: campaign.name || campaign.campaign_name || "Unnamed campaign",
      subtitle: campaign.objective || "No objective available yet.",
      bullets: [
        "This campaign can be connected to brands, products, audiences and monitoring signals.",
        "Campaign Radar surfaces current or recently imported campaign intelligence.",
        "Connected products help explain what the campaign is promoting or positioning.",
        "Future enrichment can add flight dates, spend, creative format, competitors and performance notes.",
      ],
      stats: [
        {
          label: "IAB Category",
          value:
            buildIabLabel(campaign) === "Pending Classification"
              ? "Pending Classification"
              : buildIabLabel(campaign),
        },
        {
          label: "Campaign Status",
          value:
            campaign.status === "active"
              ? "Active"
              : campaign.status || "Unknown",
        },
        {
          label: "Connected Products",
          value: productCount,
        },
      ],
      chips: [
        campaign.objective || "No objective",
        buildIabLabel(campaign),
        campaign.status || "Status pending",
        `${productCount} connected products`,
      ],
      href: "/monitoring",
      hrefLabel: "Open Monitoring",
    });
  }

  function openBrandModal(brand: any) {
    const relatedProducts = products
      .filter((product) => product.brand_id === brand.id || product.brand_name === brand.name)
      .map((product) => product.name || product.product_name)
      .filter(Boolean);

    const relatedCampaigns = campaigns
      .filter((campaign) => campaign.brand_id === brand.id || campaign.brand_name === brand.name)
      .map((campaign) => campaign.name || campaign.campaign_name)
      .filter(Boolean);

    setSelectedBrandProfile(
      buildBrandProfile(brand, {
        products: relatedProducts,
        campaigns: relatedCampaigns,
        iabFootprint: [buildIabLabel(brand)],
        categories: [brand.industry, brand.country].filter(Boolean),
        sources: ["Strategy Hub", "Supabase"],
      })
    );
  }

  function openScoreModal() {
    setModal({
      label: "Galaxy Intelligence Score",
      title: `Galaxy Score: ${galaxyScore}`,
      subtitle:
        "The score is an executive readiness indicator based on mapped entities, usable graph edges, campaign coverage, audience coverage and IAB taxonomy context.",
      bullets: [
        "Brands and products create the visible commercial universe.",
        "Campaign and audience coverage improve strategic usefulness.",
        "Graph signals increase relationship explainability and ecosystem depth.",
        "IAB taxonomy coverage improves category and market context for imported data.",
      ],
      stats: [
        { label: "Score", value: galaxyScore },
        { label: "Brands", value: metrics.find((m) => m.label === "Brand Stars")?.value || 0 },
        { label: "Graph signals", value: metrics.find((m) => m.label === "Graph Signals")?.value || 0 },
        { label: "IAB rows", value: taxonomy.length },
      ],
      chips: ["Coverage", "Graph density", "Classification", "Freshness"],
    });
  }

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] p-10 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40" />

        <div className="relative z-10">
          <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <button
                onClick={openStoryModal}
                className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-fuchsia-200 transition hover:border-fuchsia-200/60 hover:bg-fuchsia-500/20"
              >
                Brand Galaxy Command Center · Click for story
              </button>

              <h1 className="mb-3 text-7xl font-black tracking-tight">
                Strategy Hub
              </h1>

              <div className="mb-4 text-xs uppercase tracking-[0.32em] text-cyan-200">
                Advertising Intelligence Platform
              </div>

              <p className="max-w-3xl text-lg leading-8 text-gray-300">
                Executive overview of your advertising galaxy: brands,
                campaigns, audiences, IAB taxonomy, competitors and monitoring
                signals.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/relationships"
                className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-5 py-4 font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
              >
                Open Galaxy Map
              </Link>

              <Link
                href="/monitoring"
                className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-5 py-4 font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
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
              <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.55fr]">
                <button
                  onClick={openScoreModal}
                  className="rounded-[2rem] border border-fuchsia-300/30 bg-fuchsia-500/10 p-6 text-left shadow-[0_0_60px_rgba(217,70,239,0.15)] backdrop-blur-xl transition hover:border-fuchsia-200/60 hover:bg-fuchsia-500/15"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-fuchsia-200">
                        Galaxy Intelligence Score
                      </div>

                      <div className="text-7xl font-black text-white">
                        {galaxyScore}
                      </div>
                    </div>

                    <div className="max-w-2xl leading-7 text-gray-300">
                      Brand Galaxy transforms monitoring, campaign and taxonomy
                      signals into a connected advertising intelligence system for
                      faster strategy, competitor analysis and audience discovery.
                    </div>
                  </div>

                  <div className="mt-5 text-xs uppercase tracking-[0.24em] text-fuchsia-200/80">
                    Click to inspect score logic →
                  </div>
                </button>

                <button
                  onClick={openQualityModal}
                  className="rounded-[2rem] border border-cyan-300/25 bg-cyan-500/10 p-6 text-left shadow-[0_0_60px_rgba(34,211,238,0.12)] backdrop-blur-xl transition hover:border-cyan-200/50 hover:bg-cyan-500/15"
                >
                  <div className="mb-3 text-xs uppercase tracking-[0.3em] text-cyan-200">
                    Advertising Intelligence
                  </div>

                  <div className="text-3xl font-black text-white">
                    Coverage & Quality
                  </div>

                  <p className="mt-4 text-sm leading-7 text-gray-300">
                    Executive snapshot of data quality, classification coverage, relationship
                    density and intelligence readiness across the Brand Galaxy ecosystem.
                  </p>

                  <div className="mt-5 text-xs uppercase tracking-[0.24em] text-cyan-200/80">
                    Click to inspect quality →
                  </div>
                </button>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                  const tone = getToneClasses(metric.tone);

                  return (
                    <button
                      key={metric.label}
                      onClick={() => openMetricModal(metric)}
                      className={`rounded-[2rem] border ${tone.border} ${tone.bg} ${tone.glow} p-6 text-left backdrop-blur-xl transition hover:scale-[1.015] hover:border-white/30`}
                    >
                      <div className={`mb-3 text-5xl font-black ${tone.text}`}>
                        {metric.value}
                      </div>

                      <div className="mb-1 flex items-center gap-2 text-lg font-bold text-white">
                        {metric.label}
                        <MetricTooltip text={metric.helper} />
                      </div>

                      <div className="text-sm text-gray-400">{metric.helper}</div>

                      <div className="mt-4 text-xs uppercase tracking-[0.22em] text-gray-500">
                        Click for context →
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_50px_rgba(34,211,238,0.08)] backdrop-blur-xl">
                  <button
                    onClick={() =>
                      setModal({
                        label: "Campaign Radar",
                        title: "Campaign Radar",
                        subtitle:
                          "Campaign Radar surfaces active campaign intelligence and helps connect campaigns to objectives, brands, products and audiences.",
                        bullets: [
                          "Every campaign row is clickable.",
                          "Campaigns can become graph nodes connected to products and brands.",
                          "Use this area for campaign QA, activation review and strategic prioritization.",
                        ],
                        stats: [
                          { label: "Visible campaigns", value: campaignStats.visible },
                          { label: "With objective", value: campaignStats.withObjective },
                          { label: "Classified", value: campaignStats.classified },
                        ],
                        chips: ["Campaigns", "Objectives", "Activations"],
                      })
                    }
                    className="mb-5 block text-left"
                  >
                    <div className="mb-3 text-xs uppercase tracking-[0.3em] text-cyan-200">
                      Campaign Constellation
                    </div>

                    <h2 className="text-3xl font-black transition hover:text-cyan-100">
                      Campaign Radar
                    </h2>
                  </button>

                  <div className="space-y-3">
                    {campaigns.length > 0 ? (
                      campaigns.map((campaign) => (
                        <button
                          key={campaign.id}
                          onClick={() => openCampaignModal(campaign)}
                          className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-left transition hover:border-cyan-300/35 hover:bg-cyan-500/10"
                        >
                          <div className="font-bold text-white">
                            {campaign.name || campaign.campaign_name || "Unnamed campaign"}
                          </div>

                          <div className="mt-1 text-sm text-gray-400">
                            {campaign.objective || "No objective available"}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-cyan-100">
                              {buildIabLabel(campaign)}
                            </span>
                            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-gray-300">
                              {getCampaignProductCount(campaign)} products
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-400">
                        No campaigns found yet.
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_50px_rgba(217,70,239,0.08)] backdrop-blur-xl">
                  <button
                    onClick={() =>
                      setModal({
                        label: "Brand Stars",
                        title: "Brand Stars",
                        subtitle:
                          "Brand Stars are the market-facing brand entities that form the visible universe of Brand Galaxy.",
                        bullets: [
                          "Every brand card is clickable.",
                          "Brand Stars show logo, category, ownership and relationship context when available.",
                          "These brands can be opened inside the Relationship Graph for a wider ecosystem view.",
                        ],
                        stats: [
                          { label: "Visible brands", value: brandStats.visible },
                          { label: "Classified", value: brandStats.classified },
                          { label: "With logo", value: brandStats.withLogo },
                        ],
                        chips: ["Brands", "IAB", "Ownership", "Graph"],
                        href: "/relationships",
                        hrefLabel: "Open Galaxy Map",
                      })
                    }
                    className="mb-5 block text-left"
                  >
                    <div className="mb-3 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                      Brand Galaxy
                    </div>

                    <h2 className="text-3xl font-black transition hover:text-fuchsia-100">
                      Brand Stars
                    </h2>
                  </button>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {recentBrands.length > 0 ? (
                      recentBrands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => openBrandModal(brand)}
                          className="rounded-2xl border border-white/10 bg-black/30 p-4 text-left transition hover:border-fuchsia-300/35 hover:bg-fuchsia-500/10"
                        >
                          <div className="flex items-center gap-3">
                            <BrandLogo brand={brand} />

                            <div className="min-w-0">
                              <div className="truncate font-bold text-white">{brand.name}</div>
                              <div className="mt-1 truncate text-xs text-indigo-200">
                                {buildIabLabel(brand)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-400">
                        No brands found yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>

        <BrandIntelligenceModal
          profile={selectedBrandProfile}
          onClose={() => setSelectedBrandProfile(null)}
        />

        {modal && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-4 backdrop-blur-xl">
            <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-cyan-300/25 bg-[#020617] p-6 shadow-[0_0_100px_rgba(34,211,238,0.16)]">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 inline-flex rounded-full border border-cyan-300/25 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
                    {modal.label}
                  </div>

                  <h3 className="text-4xl font-black text-white">
                    {modal.title}
                  </h3>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">
                    {modal.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => setModal(null)}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:text-white"
                >
                  Close
                </button>
              </div>

              {modal.stats && modal.stats.length > 0 && (
                <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {modal.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                    >
                      <div className="text-2xl font-black text-cyan-100">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {modal.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-gray-300"
                  >
                    {bullet}
                  </div>
                ))}
              </div>

              {modal.chips && modal.chips.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {modal.chips.filter(Boolean).map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              {modal.href && modal.hrefLabel && (
                <Link
                  href={modal.href}
                  className="inline-flex rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                >
                  {modal.hrefLabel}
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
