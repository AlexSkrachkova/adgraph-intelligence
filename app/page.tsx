"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-[11px] font-black text-cyan-100 transition group-hover:border-cyan-200/60 group-hover:bg-cyan-500/20">
        i
      </span>

      <span className="pointer-events-none absolute left-1/2 top-7 z-50 hidden w-48 -translate-x-1/2 rounded-2xl border border-cyan-300/20 bg-slate-950/95 p-3 text-center text-xs leading-5 text-gray-200 shadow-[0_0_35px_rgba(34,211,238,0.16)] backdrop-blur-xl group-hover:block">
      </span>
    </span>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
  glow,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  glow: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition-all duration-700 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] ${glow}`}
    >
      <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />

      <div className="relative z-10">
        <div className="mb-5 text-5xl transition duration-700 group-hover:scale-110">
          {icon}
        </div>

        <h2 className="mb-3 text-2xl font-black text-white">{title}</h2>

        <p className="leading-7 text-gray-400">{description}</p>
      </div>
    </Link>
  );
}

function Metric({
  value,
  label,
  tooltip,
}: {
  value: string;
  label: string;
  tooltip: string;
}) {
  return (
    <div className="relative overflow-visible rounded-3xl border border-white/10 bg-black/35 p-5 transition duration-500 hover:border-cyan-300/20 hover:bg-black/45 hover:shadow-[0_0_28px_rgba(34,211,238,0.08)]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="text-4xl font-black text-cyan-200">{value}</div>
        <InfoTooltip text={tooltip} />
      </div>

      <div className="text-xs uppercase tracking-[0.22em] text-gray-500">
        {label}
      </div>
    </div>
  );
}

function CapabilityCard({
  title,
  href,
  tooltip,
}: {
  title: string;
  href: string;
  tooltip: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-white/10 bg-black/30 p-5 transition duration-500 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-black/45 hover:shadow-[0_0_28px_rgba(34,211,238,0.08)]"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-cyan-200">✦</div>
        <InfoTooltip text={tooltip} />
      </div>

      <div className="leading-7 text-gray-200">{title}</div>

      <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-cyan-200 opacity-0 transition group-hover:opacity-100">
        Open context →
      </div>
    </Link>
  );
}

function FlowStepCard({
  step,
  index,
  href,
  tooltip,
}: {
  step: string;
  index: number;
  href: string;
  tooltip: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition duration-500 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-black/45 hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-sm font-black text-cyan-100 transition group-hover:border-cyan-200/50 group-hover:bg-cyan-500/20">
        {index + 1}
      </div>

      <div className="min-w-0 flex-1 text-gray-200">{step}</div>

      <InfoTooltip text={tooltip} />
    </Link>
  );
}

type FeedSignal = {
  id: string;
  brand: string;
  signal: string;
  type: string;
};

type PlatformStats = {
  entities: number;
  relationships: number;
  campaigns: number;
  insights: string;
};

const fallbackSignals: FeedSignal[] = [
  {
    id: "fallback-nike",
    brand: "Nike",
    signal: "Campaign momentum spike detected",
    type: "Campaign",
  },
  {
    id: "fallback-mcdonalds",
    brand: "McDonald's",
    signal: "Audience cluster expanded",
    type: "Audience",
  },
  {
    id: "fallback-netflix",
    brand: "Netflix",
    signal: "Streaming ecosystem overlap increased",
    type: "Ecosystem",
  },
];

const platformCapabilities = [
  {
    title: "CSV intelligence ingestion",
    href: "/csv-import",
    tooltip:
      "Opens the import workflow where CSV/Nielsen-style rows become brands, products, campaigns, audiences and graph relationships.",
  },
  {
    title: "Relationship graph engine",
    href: "/relationships",
    tooltip:
      "Opens the Galaxy Map where entities become connected brand, product, company, campaign and audience signals.",
  },
  {
    title: "Strategic ecosystem scoring",
    href: "/relationships",
    tooltip:
      "Explains how the platform scores ecosystem health, campaign momentum, audience affinity and relationship density.",
  },
  {
    title: "Timeline intelligence",
    href: "/timeline",
    tooltip:
      "Shows how platform signals can be reviewed over time for campaign and market context.",
  },
  {
    title: "Campaign clustering",
    href: "/campaigns",
    tooltip:
      "Groups campaigns and promotions so the demo can explain advertising activity instead of showing raw rows only.",
  },
  {
    title: "Audience analytics",
    href: "/monitoring",
    tooltip:
      "Uses audience and IAB/context signals to explain targeting, affinity and market relevance.",
  },
  {
    title: "IAB taxonomy enrichment",
    href: "/monitoring",
    tooltip:
      "Shows category intelligence from ARGUS/IAB fields and fallback classification when imported data is incomplete.",
  },
  {
    title: "Competitive overlap detection",
    href: "/relationships",
    tooltip:
      "Uses relationship signals and related brand stars to infer competitive or category overlap.",
  },
  {
    title: "Semantic-style search engine",
    href: "/entity-search",
    tooltip:
      "Opens Galaxy Search where brands, products, companies, campaigns and audiences can be explored directly.",
  },
];

const intelligenceFlow = [
  {
    step: "Monitoring Signals",
    href: "/monitoring",
    tooltip:
      "Raw advertising and monitoring signals enter the platform through ARGUS/API data and imports.",
  },
  {
    step: "Entity Recognition",
    href: "/entity-search",
    tooltip:
      "The platform identifies brands, companies, products, campaigns and audiences from source data.",
  },
  {
    step: "Relationship Linking",
    href: "/relationships",
    tooltip:
      "Entities are connected into graph relationships such as ownership, product, campaign and audience links.",
  },
  {
    step: "Strategic Classification",
    href: "/monitoring",
    tooltip:
      "Signals are classified by category, IAB context and strategic relevance for cleaner review.",
  },
  {
    step: "Audience Mapping",
    href: "/relationships",
    tooltip:
      "Audience signals connect brands to targeting context, affinity and market opportunities.",
  },
  {
    step: "Timeline Intelligence",
    href: "/timeline",
    tooltip:
      "Campaign and market signals can be reviewed as a time-based story for presentation context.",
  },
  {
    step: "Momentum Analysis",
    href: "/analytics/war-room",
    tooltip:
      "Strategy Hub summarizes campaign momentum, graph signals and readiness for executive review.",
  },
  {
    step: "Strategic Insights",
    href: "/strategy-intelligence",
    tooltip:
      "Final intelligence views turn graph and monitoring data into demo-ready strategic explanations.",
  },
];

export default function HomePage() {
  const [selectedSignal, setSelectedSignal] = useState<FeedSignal | null>(null);
  const [feedSignals, setFeedSignals] = useState<FeedSignal[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    entities: 0,
    relationships: 0,
    campaigns: 0,
    insights: "Live",
  });

  useEffect(() => {
    async function loadLiveFeed() {
      setFeedLoading(true);

      try {
        const [
          { count: companiesCount },
          { count: brandsCount },
          { count: productsCount },
          { count: campaignsCount },
          { count: audiencesCount },
          { count: relationshipsCount },
        ] = await Promise.all([
          supabase.from("companies").select("*", { count: "exact", head: true }),
          supabase.from("brands").select("*", { count: "exact", head: true }),
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("campaigns").select("*", { count: "exact", head: true }),
          supabase.from("audiences").select("*", { count: "exact", head: true }),
          supabase.from("entity_relationships").select("*", {
            count: "exact",
            head: true,
          }),
        ]);

        const entities =
          (companiesCount || 0) +
          (brandsCount || 0) +
          (productsCount || 0) +
          (campaignsCount || 0) +
          (audiencesCount || 0);

        setPlatformStats({
          entities,
          relationships: relationshipsCount || 0,
          campaigns: campaignsCount || 0,
          insights: entities > 0 || relationshipsCount ? "Live" : "Ready",
        });

        const [{ data: campaigns }, { data: brands }, { data: audiences }] =
          await Promise.all([
            supabase.from("campaigns").select("id, name, objective, status").limit(3),
            supabase.from("brands").select("id, name, industry").limit(3),
            supabase.from("audiences").select("id, name, description").limit(3),
          ]);

        const nextSignals: FeedSignal[] = [
          ...(campaigns || []).map((campaign: any) => ({
            id: `campaign-${campaign.id}`,
            brand: campaign.name || "Campaign Signal",
            signal:
              campaign.objective ||
              campaign.status ||
              "Campaign intelligence signal detected",
            type: "Campaign",
          })),
          ...(brands || []).map((brand: any) => ({
            id: `brand-${brand.id}`,
            brand: brand.name || "Brand Signal",
            signal: brand.industry || "Brand ecosystem activity detected",
            type: "Brand",
          })),
          ...(audiences || []).map((audience: any) => ({
            id: `audience-${audience.id}`,
            brand: audience.name || "Audience Signal",
            signal: audience.description || "Audience cluster intelligence detected",
            type: "Audience",
          })),
        ].slice(0, 3);

        setFeedSignals(nextSignals.length ? nextSignals : fallbackSignals);
      } catch (error) {
        console.error(error);
        setFeedSignals(fallbackSignals);
      } finally {
        setFeedLoading(false);
      }
    }

    loadLiveFeed();
  }, []);

  const visibleSignals = useMemo(() => {
    return feedSignals.length ? feedSignals : fallbackSignals;
  }, [feedSignals]);

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-visible bg-[#020617] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(217,70,239,0.22),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.16),transparent_22%),radial-gradient(circle_at_50%_85%,rgba(99,102,241,0.16),transparent_30%)]" />

        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10 mx-auto max-w-[1800px] px-6 py-10 md:px-10 md:py-12">
          <section className="mb-12 grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_760px]">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-5 py-3 text-xs uppercase tracking-[0.35em] text-fuchsia-200 backdrop-blur-xl">
                Brand Galaxy AI Intelligence Platform
              </div>

              <h1 className="mb-8 text-5xl font-black leading-none tracking-tight md:text-7xl xl:text-8xl">
                Advertising
                <br />
                Intelligence
                <br />
                Galaxy
              </h1>

              <p className="max-w-4xl text-lg leading-8 text-gray-300 md:text-xl md:leading-9">
                A connected strategic intelligence platform for brands,
                campaigns, products, audiences, monitoring signals, competitive
                ecosystems and AI-powered analytics.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/relationships"
                  className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/20 px-7 py-4 text-sm font-semibold text-white transition-all duration-500 hover:-translate-y-0.5 hover:bg-fuchsia-500/30 hover:shadow-[0_0_28px_rgba(217,70,239,0.18)]"
                >
                  Open Galaxy Map
                </Link>

                <Link
                  href="/strategy-intelligence"
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-500/15 px-7 py-4 text-sm font-semibold text-cyan-100 transition-all duration-500 hover:-translate-y-0.5 hover:bg-cyan-500/25 hover:shadow-[0_0_28px_rgba(34,211,238,0.16)]"
                >
                  Strategy Intelligence
                </Link>

                <Link
                  href="/csv-import"
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-7 py-4 text-sm font-semibold text-gray-200 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]"
                >
                  Import CSV Data
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-fuchsia-300/20 bg-white/[0.06] p-7 backdrop-blur-2xl shadow-[0_0_80px_rgba(217,70,239,0.14)] transition duration-700 hover:border-fuchsia-200/30 hover:shadow-[0_0_95px_rgba(217,70,239,0.18)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,70,239,0.16),transparent_55%)]" />

                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                      Live Intelligence Status
                    </div>
                    <InfoTooltip text="These numbers are loaded from the live Supabase tables, not hard-coded presentation numbers." />
                  </div>

                  <h2 className="mb-8 text-4xl font-black">
                    Strategic Command Layer
                  </h2>

                  <div className="grid grid-cols-[1fr_1.15fr] gap-4">
                    <Metric
                      value={String(platformStats.entities)}
                      label="Entities"
                      tooltip="Total live entities across companies, brands, products, campaigns and audiences."
                    />
                    <Metric
                      value={String(platformStats.relationships)}
                      label="Relationships"
                      tooltip="Total live graph links from the entity_relationships table."
                    />
                    <Metric
                      value={String(platformStats.campaigns)}
                      label="Campaigns"
                      tooltip="Total live campaigns stored in the campaigns table."
                    />
                    <Metric
                      value={platformStats.insights}
                      label="Insights"
                      tooltip="Indicates that the platform is using live data to generate intelligence views and strategic context."
                    />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-500/10 p-7 backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.12)] transition duration-700 hover:border-cyan-200/30 hover:shadow-[0_0_80px_rgba(34,211,238,0.16)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_60%)]" />

                <div className="relative z-10">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-200">
                        Live Intelligence Feed
                      </div>

                      <div className="mt-2 text-2xl font-black text-white">
                        Strategic Signal Stream
                      </div>
                    </div>

                    <InfoTooltip text="This feed previews recent live campaign, brand and audience records from Supabase. It falls back only if no live records are available." />
                  </div>

                  <div className="space-y-3">
                    {feedLoading ? (
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
                        Loading live intelligence signals...
                      </div>
                    ) : (
                      visibleSignals.map((item) => (
                        <button
  key={item.id}
  onClick={() => setSelectedSignal(item)}
  className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-left transition duration-500 hover:border-cyan-300/25 hover:bg-black/45"
>
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate text-sm font-black text-white">
                              {item.brand}
                            </div>

                            <div className="shrink-0 text-[9px] uppercase tracking-[0.2em] text-cyan-200">
                              {item.type}
                            </div>
                          </div>

                          <div className="mt-1 line-clamp-2 text-xs text-gray-300">
                            {item.signal}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            <FeatureCard
              href="/analytics/war-room"
              icon="🛰️"
              title="Strategy Hub"
              description="Executive overview of campaigns, signals, strategic insights and ecosystem intelligence."
              glow="hover:shadow-[0_0_60px_rgba(217,70,239,0.18)]"
            />

            <FeatureCard
              href="/relationships"
              icon="🌌"
              title="Galaxy Map"
              description="Explore brands, products, audiences and campaigns through a dynamic relationship galaxy."
              glow="hover:shadow-[0_0_60px_rgba(99,102,241,0.18)]"
            />

            <FeatureCard
              href="/strategy-intelligence"
              icon="🧠"
              title="Strategy Intelligence"
              description="Strategic scoring, momentum analytics, ecosystem power and timeline intelligence."
              glow="hover:shadow-[0_0_60px_rgba(34,211,238,0.18)]"
            />

            <FeatureCard
              href="/monitoring"
              icon="📡"
              title="Monitoring Center"
              description="Transform monitoring signals into connected intelligence and campaign graph data."
              glow="hover:shadow-[0_0_60px_rgba(217,70,239,0.18)]"
            />

            <FeatureCard
              href="/entity-search"
              icon="🔎"
              title="Galaxy Search"
              description="Search brands, campaigns, products, audiences and strategic graph signals."
              glow="hover:shadow-[0_0_60px_rgba(99,102,241,0.18)]"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_500px]">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                  Platform Capabilities
                </div>
                <InfoTooltip text="Each capability card is clickable and opens the relevant platform area used during the demo." />
              </div>

              <h2 className="mb-8 text-4xl font-black md:text-5xl">
                AI-Powered Advertising Intelligence
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {platformCapabilities.map((item) => (
                  <CapabilityCard
                    key={item.title}
                    title={item.title}
                    href={item.href}
                    tooltip={item.tooltip}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-cyan-300/20 bg-cyan-500/10 p-8 backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.3em] text-cyan-200">
                  Intelligence Flow
                </div>
                <InfoTooltip text="This pipeline explains the path from raw monitoring/imported data to graph relationships and strategic insights." />
              </div>

              <h2 className="mb-8 text-4xl font-black">Live AI Pipeline</h2>

              <div className="space-y-5">
                {intelligenceFlow.map((item, index) => (
                  <FlowStepCard
                    key={item.step}
                    step={item.step}
                    index={index}
                    href={item.href}
                    tooltip={item.tooltip}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      {selectedSignal && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
    <div className="w-full max-w-2xl rounded-[2rem] border border-cyan-300/20 bg-slate-950 p-6 shadow-[0_0_60px_rgba(34,211,238,0.18)]">
      <div className="mb-3 text-xs uppercase tracking-[0.25em] text-cyan-300">
        {selectedSignal.type} Intelligence
      </div>

      <h2 className="mb-4 text-3xl font-black text-white">
        {selectedSignal.brand}
      </h2>

      <p className="mb-5 text-sm leading-7 text-gray-300">
        {selectedSignal.signal}
      </p>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-cyan-200">
            Signal Type
          </div>
          <div className="mt-2 text-sm font-bold text-white">
            {selectedSignal.type}
          </div>
        </div>

        <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">
            Intelligence Role
          </div>
          <div className="mt-2 text-sm font-bold text-white">
            Campaign Context
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">
            Status
          </div>
          <div className="mt-2 text-sm font-bold text-white">
            Live Signal
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 text-sm font-semibold text-cyan-200">
          Why this matters
        </div>
        <div className="text-sm leading-7 text-gray-300">
          This signal is part of the live intelligence stream and helps explain current campaign, brand or audience activity inside the Brand Galaxy platform.
        </div>
      </div>

      <button
        onClick={() => setSelectedSignal(null)}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Close
      </button>
    </div>
  </div>
)}
    </>
  );
}
