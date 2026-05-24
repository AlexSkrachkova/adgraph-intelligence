import Link from "next/link";
import NavBar from "@/components/NavBar";

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
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-white/20 ${glow}`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(135deg,rgba(217,70,239,0.16),transparent_35%,rgba(34,211,238,0.14))]" />

      <div className="relative z-10">
        <div className="mb-5 text-5xl transition-transform duration-500 group-hover:scale-110">
          {icon}
        </div>

        <h2 className="mb-3 text-2xl font-black text-white">{title}</h2>

        <p className="leading-7 text-gray-400 transition-colors duration-500 group-hover:text-gray-300">
          {description}
        </p>
      </div>
    </Link>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-black/35 p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-black/45 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]">
      <div className="text-4xl font-black text-cyan-200 transition-all duration-500 group-hover:text-cyan-100">
        {value}
      </div>

      <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-gray-500 transition-colors duration-500 group-hover:text-gray-400">
        {label}
      </div>
    </div>
  );
}

const liveSignals = [
  {
    brand: "Nike",
    signal: "Campaign momentum spike detected",
  },
  {
    brand: "McDonald's",
    signal: "Audience cluster expanded",
  },
  {
    brand: "Netflix",
    signal: "Streaming ecosystem overlap increased",
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
  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(217,70,239,0.22),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.16),transparent_22%),radial-gradient(circle_at_50%_85%,rgba(99,102,241,0.16),transparent_30%)]" />

        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-fuchsia-500/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020617] to-transparent" />

        <div className="relative z-10 mx-auto max-w-[1800px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <section className="mb-12 grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_760px]">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-5 py-3 text-xs uppercase tracking-[0.3em] text-fuchsia-200 backdrop-blur-xl shadow-[0_0_30px_rgba(217,70,239,0.08)] transition-all duration-500 hover:border-fuchsia-200/40 hover:bg-fuchsia-500/15">
                Brand Galaxy AI Intelligence Platform
              </div>

              <h1 className="mb-8 text-5xl font-black leading-none tracking-tight sm:text-6xl lg:text-8xl">
                Advertising
                <br />
                Intelligence
                <br />
                Galaxy
              </h1>

              <p className="max-w-4xl text-lg leading-8 text-gray-300 sm:text-xl sm:leading-9">
                A connected strategic intelligence platform for brands,
                campaigns, products, audiences, monitoring signals, competitive
                ecosystems and AI-powered analytics.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/relationships"
                  className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/20 px-7 py-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(217,70,239,0.08)] transition-all duration-500 hover:-translate-y-0.5 hover:border-fuchsia-200/45 hover:bg-fuchsia-500/30 hover:shadow-[0_0_34px_rgba(217,70,239,0.16)]"
                >
                  Open Galaxy Map
                </Link>

                <Link
                  href="/strategy-intelligence"
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-500/15 px-7 py-4 text-sm font-semibold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.06)] transition-all duration-500 hover:-translate-y-0.5 hover:border-cyan-200/45 hover:bg-cyan-500/25 hover:shadow-[0_0_34px_rgba(34,211,238,0.14)]"
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
              <div className="relative overflow-hidden rounded-[2.5rem] border border-fuchsia-300/20 bg-white/[0.06] p-7 backdrop-blur-2xl shadow-[0_0_80px_rgba(217,70,239,0.14)] transition-all duration-700 hover:-translate-y-1 hover:border-fuchsia-200/30 hover:shadow-[0_0_95px_rgba(217,70,239,0.18)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,70,239,0.16),transparent_55%)]" />

                <div className="relative z-10">
                  <div className="mb-4 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                    Live Intelligence Status
                  </div>

                  <h2 className="mb-8 text-3xl font-black sm:text-4xl">
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

              <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-500/10 p-7 backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.12)] transition-all duration-700 hover:-translate-y-1 hover:border-cyan-200/30 hover:shadow-[0_0_80px_rgba(34,211,238,0.18)]">
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
                    {liveSignals.map((item) => (
                      <div
                        key={item.brand}
                        className="group rounded-2xl border border-white/10 bg-black/30 p-3 transition-all duration-500 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-black/45"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-sm font-black text-white">
                            {item.brand}
                          </div>

                          <div className="h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)] transition-all duration-500 group-hover:scale-125" />
                        </div>

                        <div className="mt-1 text-xs text-gray-300">
                          {item.signal}
                        </div>
                      </div>
                    ))}
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
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl transition-all duration-700 hover:border-white/15 sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.04] to-transparent" />

              <div className="relative z-10">
                <div className="mb-4 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                  Platform Capabilities
                </div>

                <h2 className="mb-8 text-4xl font-black sm:text-5xl">
                  AI-Powered Advertising Intelligence
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {platformCapabilities.map((item) => (
                    <div
                      key={item}
                      className="group rounded-3xl border border-white/10 bg-black/30 p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-black/40"
                    >
                      <div className="mb-3 text-cyan-200 transition-transform duration-500 group-hover:scale-110">
                        ✦
                      </div>

                      <div className="leading-7 text-gray-200">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-500/10 p-6 backdrop-blur-2xl transition-all duration-700 hover:border-cyan-200/30 sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/10 to-transparent" />

              <div className="relative z-10">
                <div className="mb-4 text-xs uppercase tracking-[0.3em] text-cyan-200">
                  Intelligence Flow
                </div>

                <h2 className="mb-8 text-4xl font-black">Live AI Pipeline</h2>

                <div className="space-y-5">
                  {intelligenceFlow.map((step, index) => (
                    <div
                      key={step}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-black/45"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-sm font-black text-cyan-100 transition-all duration-500 group-hover:border-cyan-200/50 group-hover:bg-cyan-500/20">
                        {index + 1}
                      </div>

                      <div className="text-gray-200">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
