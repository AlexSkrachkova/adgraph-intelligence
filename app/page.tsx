"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";

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

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-5 transition duration-500 hover:border-cyan-300/20 hover:bg-black/45 hover:shadow-[0_0_28px_rgba(34,211,238,0.08)]">
      <div className="text-4xl font-black text-cyan-200">{value}</div>

      <div className="mt-2 text-xs uppercase tracking-[0.22em] text-gray-500">
        {label}
      </div>
    </div>
  );
}

type FeedSignal = {
  id: string;
  brand: string;
  signal: string;
  type: string;
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
  "CSV intelligence ingestion",
  "Relationship graph engine",
  "Strategic ecosystem scoring",
  "Timeline intelligence",
  "Campaign clustering",
  "Audience analytics",
  "IAB taxonomy enrichment",
  "Competitive overlap detection",
  "Semantic-style search engine",
];

const intelligenceFlow = [
  "Monitoring Signals",
  "Entity Recognition",
  "Relationship Linking",
  "Strategic Classification",
  "Audience Mapping",
  "Timeline Intelligence",
  "Momentum Analysis",
  "Strategic Insights",
];

export default function HomePage() {
  const [feedSignals, setFeedSignals] = useState<FeedSignal[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    async function loadLiveFeed() {
      setFeedLoading(true);

      try {
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
            signal:
              brand.industry || "Brand ecosystem activity detected",
            type: "Brand",
          })),
          ...(audiences || []).map((audience: any) => ({
            id: `audience-${audience.id}`,
            brand: audience.name || "Audience Signal",
            signal:
              audience.description || "Audience cluster intelligence detected",
            type: "Audience",
          })),
        ].slice(0, 3);

        setFeedSignals(nextSignals.length ? nextSignals : fallbackSignals);
      } catch (error) {
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

      <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
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
                  <div className="mb-4 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                    Live Intelligence Status
                  </div>

                  <h2 className="mb-8 text-4xl font-black">
                    Strategic Command Layer
                  </h2>

                  <div className="grid grid-cols-[1fr_1.15fr] gap-4">
                    <Metric value="250+" label="Entities" />
                    <Metric value="900+" label="Relationships" />
                    <Metric value="40+" label="Campaigns" />
                    <Metric value="AI" label="Insights" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-500/10 p-7 backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.12)] transition duration-700 hover:border-cyan-200/30 hover:shadow-[0_0_80px_rgba(34,211,238,0.16)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_60%)]" />

                <div className="relative z-10">
                  <div className="mb-5">
                    <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-200">
                      Live Intelligence Feed
                    </div>

                    <div className="mt-2 text-2xl font-black text-white">
                      Strategic Signal Stream
                    </div>
                  </div>

                  <div className="space-y-3">
                    {feedLoading ? (
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
                        Loading live intelligence signals...
                      </div>
                    ) : (
                      visibleSignals.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-white/10 bg-black/30 p-3 transition duration-500 hover:border-cyan-300/25 hover:bg-black/45"
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
                        </div>
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
              <div className="mb-4 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                Platform Capabilities
              </div>

              <h2 className="mb-8 text-4xl font-black md:text-5xl">
                AI-Powered Advertising Intelligence
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {platformCapabilities.map((item) => (
                  <div
                    key={item}
                    className="rounded-3xl border border-white/10 bg-black/30 p-5 transition duration-500 hover:border-cyan-300/20 hover:bg-black/40"
                  >
                    <div className="mb-3 text-cyan-200">✦</div>

                    <div className="leading-7 text-gray-200">{item}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-cyan-300/20 bg-cyan-500/10 p-8 backdrop-blur-2xl">
              <div className="mb-4 text-xs uppercase tracking-[0.3em] text-cyan-200">
                Intelligence Flow
              </div>

              <h2 className="mb-8 text-4xl font-black">Live AI Pipeline</h2>

              <div className="space-y-5">
                {intelligenceFlow.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition duration-500 hover:border-cyan-300/20 hover:bg-black/40"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-sm font-black text-cyan-100">
                      {index + 1}
                    </div>

                    <div className="text-gray-200">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
