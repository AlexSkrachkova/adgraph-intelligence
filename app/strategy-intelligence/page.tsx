"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";

type EntityNode = {
  id: string;
  type: "brand" | "product" | "campaign" | "audience" | "company";
  name: string;
  data: any;
};

type Relationship = {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship_type: string;
  description?: string;
};

type TimelineEvent = {
  id: string;
  title: string;
  description?: string;
  event_type?: string;
  event_date?: string;
  importance_score?: number;
  campaign_id?: string;
};

type StrategySearchAnswer = {
  title: string;
  summary: string;
  matchedNodes: EntityNode[];
  relatedNodes: EntityNode[];
  insights: string[];
};

function getNodeId(type: string, id: string) {
  return `${type}-${id}`;
}

function Card({ title, children }: any) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(217,70,239,0.08)] transition duration-500 hover:-translate-y-0.5 hover:border-white/20">
      <h2 className="mb-5 text-xl font-black text-white">{title}</h2>
      {children}
    </div>
  );
}

function Metric({ label, value }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-5 transition duration-500 hover:border-fuchsia-300/20 hover:bg-black/45">
      <div className="text-4xl font-black text-fuchsia-200">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
        {label}
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-gray-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500 transition-all duration-700"
          style={{
            width: `${Math.min(100, value)}%`,
          }}
        />
      </div>
    </div>
  );
}

function getNodeText(node: EntityNode) {
  const data = node.data || {};

  return [
    node.name,
    node.type,
    data.description,
    data.industry,
    data.country,
    data.product_type,
    data.category,
    data.objective,
    data.status,
    data.iab_tier_1,
    data.iab_tier_2,
    data.iab_tier_3,
    ...(data.search_keywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildStrategySearchAnswer({
  query,
  nodes,
  relationships,
  nodeLookup,
}: {
  query: string;
  nodes: EntityNode[];
  relationships: Relationship[];
  nodeLookup: Record<string, EntityNode>;
}): StrategySearchAnswer | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const words = q.split(/\s+/).filter((word) => word.length > 2);

  const matchedNodes = nodes
    .map((node) => {
      const text = getNodeText(node);
      const exactNameMatch = node.name.toLowerCase().includes(q) ? 5 : 0;
      const wordScore = words.reduce(
        (score, word) => score + (text.includes(word) ? 1 : 0),
        0
      );

      return {
        node,
        score: exactNameMatch + wordScore,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.node);

  if (matchedNodes.length === 0) {
    return {
      title: "No strong strategy match found",
      summary:
        "Try searching for a brand, product, campaign, audience, company, category or keyword.",
      matchedNodes: [],
      relatedNodes: [],
      insights: [
        "Example: Samsung",
        "Example: Xbox Game Pass",
        "Example: Core Gamers",
        "Example: Streaming",
      ],
    };
  }

  const matchedIds = new Set(matchedNodes.map((node) => node.id));

  const relatedNodes = relationships
    .filter((rel) => {
      const sourceId = getNodeId(rel.source_type, rel.source_id);
      const targetId = getNodeId(rel.target_type, rel.target_id);

      return matchedIds.has(sourceId) || matchedIds.has(targetId);
    })
    .map((rel) => {
      const sourceId = getNodeId(rel.source_type, rel.source_id);
      const targetId = getNodeId(rel.target_type, rel.target_id);
      const otherId = matchedIds.has(sourceId) ? targetId : sourceId;

      return nodeLookup[otherId];
    })
    .filter(Boolean)
    .filter(
      (node, index, array) =>
        array.findIndex((item) => item.id === node.id) === index
    )
    .slice(0, 12);

  const brands = [...matchedNodes, ...relatedNodes].filter(
    (node) => node.type === "brand"
  );
  const products = [...matchedNodes, ...relatedNodes].filter(
    (node) => node.type === "product"
  );
  const campaigns = [...matchedNodes, ...relatedNodes].filter(
    (node) => node.type === "campaign"
  );
  const audiences = [...matchedNodes, ...relatedNodes].filter(
    (node) => node.type === "audience"
  );
  const companies = [...matchedNodes, ...relatedNodes].filter(
    (node) => node.type === "company"
  );

  const primary = matchedNodes[0];

  return {
    title: `Strategy search: ${primary.name}`,
    summary: `Found ${matchedNodes.length} direct match(es) and ${relatedNodes.length} related graph signal(s) for "${query}".`,
    matchedNodes,
    relatedNodes,
    insights: [
      `${brands.length} brand signal(s), ${products.length} product signal(s), ${campaigns.length} campaign signal(s), ${audiences.length} audience signal(s), and ${companies.length} company signal(s) are connected to this search.`,
      campaigns.length
        ? `Campaign opportunity: review ${campaigns
            .slice(0, 3)
            .map((node) => node.name)
            .join(", ")} for strategic positioning.`
        : "Campaign opportunity: this search has weak campaign coverage.",
      audiences.length
        ? `Audience coverage includes ${audiences
            .slice(0, 3)
            .map((node) => node.name)
            .join(", ")}.`
        : "Audience opportunity: add clearer audience segments for this area.",
      products.length
        ? `Product ecosystem includes ${products
            .slice(0, 4)
            .map((node) => node.name)
            .join(", ")}.`
        : "Product opportunity: add product-level signals for better ecosystem strength.",
    ],
  };
}

export default function StrategyIntelligencePage() {
  const [nodes, setNodes] = useState<EntityNode[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [strategyQuery, setStrategyQuery] = useState("");
  const [strategyAnswer, setStrategyAnswer] =
    useState<StrategySearchAnswer | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const { data: companies } = await supabase.from("companies").select("*");
      const { data: brands } = await supabase.from("brands").select("*");
      const { data: products } = await supabase.from("products").select("*");
      const { data: campaigns } = await supabase.from("campaigns").select("*");
      const { data: audiences } = await supabase.from("audiences").select("*");
      const { data: rels } = await supabase
        .from("entity_relationships")
        .select("*");

      const { data: timeline } = await supabase
        .from("timeline_events")
        .select("*")
        .order("event_date", { ascending: false });

      const nextNodes: EntityNode[] = [
        ...(companies || []).map((item: any) => ({
          id: getNodeId("company", item.id),
          type: "company" as const,
          name: item.name,
          data: item,
        })),
        ...(brands || []).map((item: any) => ({
          id: getNodeId("brand", item.id),
          type: "brand" as const,
          name: item.name,
          data: item,
        })),
        ...(products || []).map((item: any) => ({
          id: getNodeId("product", item.id),
          type: "product" as const,
          name: item.name,
          data: item,
        })),
        ...(campaigns || []).map((item: any) => ({
          id: getNodeId("campaign", item.id),
          type: "campaign" as const,
          name: item.name,
          data: item,
        })),
        ...(audiences || []).map((item: any) => ({
          id: getNodeId("audience", item.id),
          type: "audience" as const,
          name: item.name,
          data: item,
        })),
      ];

      setNodes(nextNodes);
      setRelationships(rels || []);
      setTimelineEvents(timeline || []);
      setLoading(false);
    }

    loadData();
  }, []);

  const nodeLookup = useMemo(() => {
    return Object.fromEntries(nodes.map((node) => [node.id, node]));
  }, [nodes]);

  function runStrategySearch(customQuery?: string) {
    const query = customQuery || strategyQuery;

    const answer = buildStrategySearchAnswer({
      query,
      nodes,
      relationships,
      nodeLookup,
    });

    setStrategyAnswer(answer);
  }

  const brandScores = useMemo(() => {
    return nodes
      .filter((node) => node.type === "brand")
      .map((brand) => {
        const brandId = brand.id;

        const connected = relationships.filter((rel) => {
          const sourceId = getNodeId(rel.source_type, rel.source_id);
          const targetId = getNodeId(rel.target_type, rel.target_id);
          return sourceId === brandId || targetId === brandId;
        });

        const products = connected.filter(
          (rel) => rel.relationship_type === "has_product"
        ).length;

        const campaigns = connected.filter(
          (rel) => rel.relationship_type === "runs_campaign"
        ).length;

        const audiences = connected.filter(
          (rel) => rel.relationship_type === "targets"
        ).length;

        const companies = connected.filter(
          (rel) => rel.relationship_type === "owned_by"
        ).length;

        const score = Math.min(
          100,
          products * 22 + campaigns * 24 + audiences * 20 + companies * 14
        );

        return {
          brand,
          score,
          products,
          campaigns,
          audiences,
          companies,
          connectedCount: connected.length,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [nodes, relationships]);

  const intelligenceSignals = useMemo(() => {
    return brandScores.map((item) => {
      const momentum =
        item.campaigns * 12 + item.audiences * 9 + item.products * 7;

      const ecosystemStrength =
        item.connectedCount * 10 + item.products * 14 + item.campaigns * 16;

      const strategicPower = Math.round(
        Math.min(100, item.score + momentum + ecosystemStrength / 3)
      );

      let status = "Emerging";

      if (strategicPower >= 85) {
        status = "Dominant";
      } else if (strategicPower >= 65) {
        status = "Strong";
      } else if (strategicPower >= 45) {
        status = "Growing";
      }

      return {
        ...item,
        momentum,
        ecosystemStrength,
        strategicPower,
        status,
      };
    });
  }, [brandScores]);

  const campaignClusters = useMemo(() => {
    return nodes
      .filter((node) => node.type === "campaign")
      .map((campaign) => {
        const campaignId = campaign.id;

        const connected = relationships.filter((rel) => {
          const sourceId = getNodeId(rel.source_type, rel.source_id);
          const targetId = getNodeId(rel.target_type, rel.target_id);
          return sourceId === campaignId || targetId === campaignId;
        });

        const connectedNames = connected
          .map((rel) => {
            const sourceId = getNodeId(rel.source_type, rel.source_id);
            const targetId = getNodeId(rel.target_type, rel.target_id);
            const otherId = sourceId === campaignId ? targetId : sourceId;
            return nodeLookup[otherId]?.name;
          })
          .filter(Boolean);

        return {
          campaign,
          connectedNames,
          strength: connected.length,
        };
      })
      .sort((a, b) => b.strength - a.strength);
  }, [nodes, relationships, nodeLookup]);

  const audienceCoverage = useMemo(() => {
    return nodes
      .filter((node) => node.type === "audience")
      .map((audience) => {
        const audienceId = audience.id;

        const connectedBrands = relationships
          .filter((rel) => {
            const sourceId = getNodeId(rel.source_type, rel.source_id);
            const targetId = getNodeId(rel.target_type, rel.target_id);
            return sourceId === audienceId || targetId === audienceId;
          })
          .map((rel) => {
            const sourceId = getNodeId(rel.source_type, rel.source_id);
            const targetId = getNodeId(rel.target_type, rel.target_id);
            const otherId = sourceId === audienceId ? targetId : sourceId;
            return nodeLookup[otherId];
          })
          .filter((node) => node?.type === "brand");

        return {
          audience,
          brands: connectedBrands,
        };
      })
      .sort((a, b) => b.brands.length - a.brands.length);
  }, [nodes, relationships, nodeLookup]);

  const timelineInsights = useMemo(() => {
    const highImpactEvents = timelineEvents.filter(
      (event) => (event.importance_score || 50) >= 70
    );

    const latestEvent = timelineEvents[0];

    return {
      total: timelineEvents.length,
      highImpact: highImpactEvents.length,
      latestEvent,
    };
  }, [timelineEvents]);

  const insights = useMemo(() => {
    const topBrand = intelligenceSignals[0];
    const weakBrands = intelligenceSignals
      .filter((item) => item.strategicPower < 45)
      .slice(0, 5);
    const strongestCampaign = campaignClusters[0];

    return [
      topBrand
        ? `${topBrand.brand.name} currently has the strongest strategic power with score ${topBrand.strategicPower} and ${topBrand.status} status.`
        : null,
      strongestCampaign
        ? `${strongestCampaign.campaign.name} is the most connected campaign cluster.`
        : null,
      timelineInsights.latestEvent
        ? `Latest timeline signal: ${timelineInsights.latestEvent.title}.`
        : null,
      timelineInsights.highImpact
        ? `${timelineInsights.highImpact} high-impact timeline event(s) are currently detected.`
        : null,
      weakBrands.length
        ? `${weakBrands
            .map((item) => item.brand.name)
            .join(", ")} need more products, campaigns or audience signals.`
        : null,
      `The graph currently contains ${nodes.length} entities and ${relationships.length} relationships.`,
    ].filter(Boolean);
  }, [
    intelligenceSignals,
    campaignClusters,
    nodes,
    relationships,
    timelineInsights,
  ]);

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white sm:px-6 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_30%)]" />

        <div className="relative z-10">
          <div className="mb-10 animate-[fadeIn_0.7s_ease-out]">
            <div className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
              Strategy Intelligence Layer
            </div>

            <h1 className="mb-4 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Strategy Intelligence
            </h1>

            <p className="max-w-3xl text-lg text-gray-300">
              Read-only analytics layer for brand influence, campaign clusters,
              audience coverage, timeline momentum and auto-generated strategic
              insights.
            </p>
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-gray-300 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
              Loading strategy intelligence graph...
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-[2rem] border border-cyan-300/20 bg-cyan-500/10 p-5 backdrop-blur-xl">
                <div className="mb-3 text-sm font-semibold text-cyan-200">
                  Strategy Search
                </div>

                <div className="flex flex-col gap-3 xl:flex-row">
                  <input
                    value={strategyQuery}
                    onChange={(event) => setStrategyQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") runStrategySearch();
                    }}
                    placeholder="Search strategy signals: Samsung, Xbox Game Pass, Core Gamers, Streaming..."
                    className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none placeholder:text-gray-500 focus:border-cyan-300/60"
                  />

                  <button
                    onClick={() => runStrategySearch()}
                    disabled={!strategyQuery.trim()}
                    className="rounded-2xl border border-cyan-300/30 bg-cyan-500/20 px-6 py-4 font-semibold text-cyan-100 transition duration-300 hover:bg-cyan-500/30 disabled:opacity-40"
                  >
                    Analyze
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {[
                    "Samsung",
                    "Xbox",
                    "Core Gamers",
                    "Streaming",
                    "Automotive",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setStrategyQuery(suggestion);
                        runStrategySearch(suggestion);
                      }}
                      className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-gray-300 transition duration-300 hover:border-cyan-300/40 hover:text-cyan-100"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {strategyAnswer && (
                <div className="mb-6 rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-500/10 p-6 backdrop-blur-xl">
                  <div className="mb-2 text-xs uppercase tracking-[0.25em] text-fuchsia-200">
                    Strategic Answer
                  </div>

                  <h2 className="mb-3 text-3xl font-black">
                    {strategyAnswer.title}
                  </h2>

                  <p className="mb-5 text-sm leading-7 text-gray-200">
                    {strategyAnswer.summary}
                  </p>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                      <div className="mb-3 text-sm font-semibold text-cyan-200">
                        Matched Signals
                      </div>

                      <div className="space-y-2">
                        {strategyAnswer.matchedNodes.length ? (
                          strategyAnswer.matchedNodes.map((node) => (
                            <div
                              key={node.id}
                              className="rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.08]"
                            >
                              <div className="text-xs uppercase text-gray-500">
                                {node.type}
                              </div>

                              <div className="font-semibold">{node.name}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400">
                            No direct matches.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                      <div className="mb-3 text-sm font-semibold text-cyan-200">
                        Related Graph Signals
                      </div>

                      <div className="space-y-2">
                        {strategyAnswer.relatedNodes.length ? (
                          strategyAnswer.relatedNodes.map((node) => (
                            <div
                              key={node.id}
                              className="rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.08]"
                            >
                              <div className="text-xs uppercase text-gray-500">
                                {node.type}
                              </div>

                              <div className="font-semibold">{node.name}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400">
                            No related signals.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                      <div className="mb-3 text-sm font-semibold text-cyan-200">
                        Auto Strategy Insights
                      </div>

                      <div className="space-y-2">
                        {strategyAnswer.insights.map((insight) => (
                          <div
                            key={insight}
                            className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-3 text-sm leading-6 text-gray-200"
                          >
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-6">
                <Metric
                  label="Brands"
                  value={nodes.filter((node) => node.type === "brand").length}
                />
                <Metric
                  label="Products"
                  value={nodes.filter((node) => node.type === "product").length}
                />
                <Metric
                  label="Campaigns"
                  value={
                    nodes.filter((node) => node.type === "campaign").length
                  }
                />
                <Metric
                  label="Audiences"
                  value={
                    nodes.filter((node) => node.type === "audience").length
                  }
                />
                <Metric label="Relationships" value={relationships.length} />
                <Metric label="Timeline" value={timelineEvents.length} />
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <Card title="Top Strategic Brand Ranking">
                  <div className="space-y-3">
                    {intelligenceSignals.slice(0, 10).map((item, index) => (
                      <div
                        key={item.brand.id}
                        className="rounded-3xl border border-white/10 bg-black/35 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs text-gray-500">
                              #{index + 1}
                            </div>

                            <div className="text-xl font-black text-white">
                              {item.brand.name}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                                {item.status}
                              </div>

                              <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
                                Ecosystem {item.ecosystemStrength}
                              </div>

                              <div className="rounded-full border border-green-300/20 bg-green-500/10 px-3 py-1 text-xs text-green-100">
                                Momentum {item.momentum}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-4xl font-black text-cyan-200">
                              {item.strategicPower}
                            </div>

                            <div className="text-xs uppercase tracking-[0.18em] text-gray-500">
                              Strategic Power
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-300 xl:grid-cols-4">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.08]">
                            {item.products} products
                          </div>

                          <div className="mt-5 space-y-3">
                            <ProgressBar
                              label="Strategic Power"
                              value={item.strategicPower}
                            />

                            <ProgressBar
                              label="Ecosystem Strength"
                              value={item.ecosystemStrength}
                            />

                            <ProgressBar
                              label="Momentum"
                              value={item.momentum}
                            />
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.08]">
                            {item.campaigns} campaigns
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.08]">
                            {item.audiences} audiences
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.08]">
                            {item.connectedCount} total signals
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Auto-Generated Strategy Insights">
                  <div className="space-y-3">
                    {insights.map((insight: any) => (
                      <div
                        key={insight}
                        className="rounded-3xl border border-cyan-300/20 bg-cyan-500/10 p-4 text-sm leading-6 text-gray-200"
                      >
                        {insight}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Campaign Clusters">
                  <div className="space-y-3">
                    {campaignClusters.slice(0, 10).map((item) => (
                      <div
                        key={item.campaign.id}
                        className="rounded-3xl border border-white/10 bg-black/35 p-4"
                      >
                        <div className="font-bold">{item.campaign.name}</div>

                        <div className="mt-2 text-xs text-gray-400">
                          Strength: {item.strength}
                        </div>

                        <div className="mt-2 text-sm text-gray-300">
                          {item.connectedNames.slice(0, 5).join(", ") ||
                            "No connected entities"}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Audience Coverage">
                  <div className="space-y-3">
                    {audienceCoverage.slice(0, 10).map((item) => (
                      <div
                        key={item.audience.id}
                        className="rounded-3xl border border-white/10 bg-black/35 p-4"
                      >
                        <div className="font-bold">{item.audience.name}</div>

                        <div className="mt-2 text-sm text-gray-300">
                          Connected brands:{" "}
                          {item.brands.map((brand) => brand.name).join(", ") ||
                            "None"}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Timeline Intelligence">
                  <div className="space-y-3">
                    {timelineEvents.length ? (
                      timelineEvents.slice(0, 12).map((event) => {
                        const connectedCampaign = nodes.find(
                          (node) =>
                            node.type === "campaign" &&
                            node.data?.id === event.campaign_id
                        );

                        return (
                          <div
                            key={event.id}
                            className="rounded-3xl border border-white/10 bg-black/35 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-lg font-bold text-white">
                                  {event.title}
                                </div>

                                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
                                  {event.event_type || "Timeline Event"}
                                </div>
                              </div>

                              <div className="rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
                                Score {event.importance_score || 50}
                              </div>
                            </div>

                            {event.description && (
                              <div className="mt-3 text-sm leading-6 text-gray-300">
                                {event.description}
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              {connectedCampaign && (
                                <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                                  Campaign: {connectedCampaign.name}
                                </div>
                              )}

                              {event.event_date && (
                                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                                  {new Date(
                                    event.event_date
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-3xl border border-white/10 bg-black/35 p-5 text-sm text-gray-400">
                        No timeline events found.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}