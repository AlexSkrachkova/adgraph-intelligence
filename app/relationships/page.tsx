"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabase";

const GALAXY_BACKGROUND = "/wallpaperflare.com_wallpaper.jpg";

const hiddenBrandNames = ["Nintendo Switch", "Samsung Galaxy"];

const demoScenarios = [
  {
    id: "gaming",
    emoji: "🎮",
    title: "Gaming",
    subtitle: "Console brands, products and gamer audiences",
    brandNames: ["PlayStation", "Xbox", "Nintendo"],
  },
  {
    id: "streaming",
    emoji: "📺",
    title: "Streaming",
    subtitle: "Streaming platforms and media audiences",
    brandNames: ["Netflix", "YouTube", "Spotify"],
  },
  {
    id: "beverage",
    emoji: "🥤",
    title: "Beverage",
    subtitle: "Soft drinks and beverage competitors",
    brandNames: ["Coca-Cola", "Pepsi"],
  },
  {
    id: "mobile",
    emoji: "📱",
    title: "Mobile Tech",
    subtitle: "Smartphones and mobile technology ecosystems",
    brandNames: ["Apple", "Samsung"],
  },
  {
    id: "auto",
    emoji: "🚗",
    title: "Automotive",
    subtitle: "Vehicle brands, EVs and auto audiences",
    brandNames: ["BMW", "Mercedes-Benz", "Toyota", "Ford", "Mini", "Jeep"],
  },
  {
    id: "fashion",
    emoji: "👟",
    title: "Fashion",
    subtitle: "Sportswear and lifestyle fashion brands",
    brandNames: ["Nike", "Adidas", "Puma"],
  },
  {
    id: "fast_food",
    emoji: "🍔",
    title: "Fast Food",
    subtitle: "Quick service restaurant brands and audiences",
    brandNames: ["McDonald's", "Burger King", "KFC"],
  },
  {
    id: "luxury",
    emoji: "💎",
    title: "Luxury",
    subtitle: "Luxury fashion and premium lifestyle brands",
    brandNames: ["Gucci", "Louis Vuitton", "Chanel"],
  },
];

type IntelligenceAnswer = {
  title: string;
  summary: string;
  matchedNodes: any[];
  suggestions: string[];
};

function normalizeBrandName(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function nodeMatchesScenario(node: any, scenario: any) {
  if (!scenario) return true;
  if (node.data.entityType !== "brand") return false;

  const nodeName = normalizeBrandName(node.data.entity?.name || "");

  return scenario.brandNames.some(
    (brandName: string) => normalizeBrandName(brandName) === nodeName
  );
}

function nodeMatchesSearch(node: any, query: string) {
  if (!query.trim()) return false;

  const entity = node.data.entity;

  return [
    node.data.label,
    entity.name,
    entity.description,
    entity.industry,
    entity.country,
    entity.product_type,
    entity.category,
    entity.objective,
    entity.status,
    entity.iab_tier_1,
    entity.iab_tier_2,
    entity.iab_tier_3,
    ...(entity.search_keywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getConnectedNodeIds(
  startNodeId: string,
  relationships: any[],
  depth = 3
) {
  const visited = new Set<string>([startNodeId]);
  let currentLevel = new Set<string>([startNodeId]);

  for (let i = 0; i < depth; i++) {
    const nextLevel = new Set<string>();

    relationships.forEach((rel: any) => {
      const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
      const targetNodeId = `${rel.target_type}-${rel.target_id}`;

      const touchesSource = currentLevel.has(sourceNodeId);
      const touchesTarget = currentLevel.has(targetNodeId);

      if (!touchesSource && !touchesTarget) return;

      const connectedNodeId = touchesSource ? targetNodeId : sourceNodeId;

      if (visited.has(connectedNodeId)) return;

      visited.add(connectedNodeId);

      if (rel.relationship_type !== "competes_with") {
        nextLevel.add(connectedNodeId);
      }
    });

    currentLevel = nextLevel;
  }

  visited.delete(startNodeId);
  return Array.from(visited);
}

function buildEcosystemProfile(
  selectedNode: any,
  relationships: any[],
  nodeLookup: Record<string, any>
) {
  if (!selectedNode?.nodeId) {
    return {
      companies: [],
      products: [],
      campaigns: [],
      audiences: [],
      brands: [],
      score: 0,
      intensity: "None",
    };
  }

  const connectedIds = getConnectedNodeIds(selectedNode.nodeId, relationships, 3);

  const uniqueNodes = Array.from(
    new Map(
      connectedIds
        .map((id) => nodeLookup[id]?.data)
        .filter(Boolean)
        .filter(
          (node: any) =>
            !(
              node.entityType === "brand" &&
              hiddenBrandNames.includes(node.entity?.name)
            )
        )
        .map((node: any) => [node.nodeId, node])
    ).values()
  );

  const companies = uniqueNodes.filter(
    (node: any) => node.entityType === "company"
  );
  const products = uniqueNodes.filter(
    (node: any) => node.entityType === "product"
  );
  const campaigns = uniqueNodes.filter(
    (node: any) => node.entityType === "campaign"
  );
  const audiences = uniqueNodes.filter(
    (node: any) => node.entityType === "audience"
  );
  const brands = uniqueNodes.filter((node: any) => node.entityType === "brand");

  const score = Math.min(
    100,
    companies.length * 18 +
      products.length * 18 +
      campaigns.length * 22 +
      audiences.length * 22 +
      brands.length * 12
  );

  const intensity =
    score >= 75 ? "High" : score >= 40 ? "Medium" : score > 0 ? "Low" : "None";

  return {
    companies,
    products,
    campaigns,
    audiences,
    brands,
    score,
    intensity,
  };
}

function generateAIStrategicSummary(selectedNode: any, ecosystemProfile: any) {
  if (!selectedNode) return "";

  const entity = selectedNode.entity;

  return `${entity?.name} is connected to ${
    ecosystemProfile.products.length
  } products, ${ecosystemProfile.campaigns.length} campaigns, ${
    ecosystemProfile.audiences.length
  } audiences and ${
    ecosystemProfile.brands.length
  } related brand stars inside the Brand Galaxy intelligence ecosystem. This entity is classified under ${
    [entity?.iab_tier_1, entity?.iab_tier_2, entity?.iab_tier_3]
      .filter(Boolean)
      .join(" → ") || "Unclassified"
  }.`;
}

function getNodeColor(entityType: string) {
  if (entityType === "brand") {
    return {
      border: "border-cyan-200/55",
      glow: "shadow-[0_0_22px_rgba(34,211,238,0.14)]",
      label: "text-cyan-100",
      ring: "border-cyan-100/20",
      line: "#67e8f9",
      planet:
        "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.22), transparent 15%), radial-gradient(circle at 42% 35%, rgba(125,211,252,0.24), transparent 28%), radial-gradient(circle at 58% 58%, rgba(14,165,233,0.18), transparent 34%), radial-gradient(circle at 70% 78%, rgba(0,0,0,0.72), transparent 58%), linear-gradient(135deg, rgba(8,47,73,0.96), rgba(2,6,23,0.98))",
      texture:
        "radial-gradient(circle at 38% 42%, rgba(255,255,255,0.11) 0 2px, transparent 3px), radial-gradient(circle at 55% 30%, rgba(255,255,255,0.08) 0 1px, transparent 3px), linear-gradient(35deg, transparent 35%, rgba(255,255,255,0.08) 45%, transparent 56%)",
    };
  }

  if (entityType === "product") {
    return {
      border: "border-emerald-200/50",
      glow: "shadow-[0_0_18px_rgba(52,211,153,0.12)]",
      label: "text-emerald-100",
      ring: "border-emerald-200/18",
      line: "#34d399",
      planet:
        "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.2), transparent 15%), radial-gradient(circle at 45% 38%, rgba(110,231,183,0.24), transparent 30%), radial-gradient(circle at 60% 60%, rgba(16,185,129,0.16), transparent 36%), radial-gradient(circle at 70% 78%, rgba(0,0,0,0.72), transparent 58%), linear-gradient(135deg, rgba(6,78,59,0.96), rgba(2,6,23,0.98))",
      texture:
        "linear-gradient(25deg, transparent 32%, rgba(255,255,255,0.09) 42%, transparent 52%), radial-gradient(circle at 48% 52%, rgba(255,255,255,0.08) 0 2px, transparent 4px)",
    };
  }

  if (entityType === "campaign") {
    return {
      border: "border-violet-200/50",
      glow: "shadow-[0_0_18px_rgba(168,85,247,0.12)]",
      label: "text-violet-100",
      ring: "border-violet-200/18",
      line: "#a855f7",
      planet:
        "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.2), transparent 15%), radial-gradient(circle at 45% 38%, rgba(196,181,253,0.24), transparent 30%), radial-gradient(circle at 58% 60%, rgba(168,85,247,0.18), transparent 36%), radial-gradient(circle at 70% 78%, rgba(0,0,0,0.72), transparent 58%), linear-gradient(135deg, rgba(59,7,100,0.96), rgba(2,6,23,0.98))",
      texture:
        "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08) 42%, transparent 56%), radial-gradient(circle at 52% 42%, rgba(255,255,255,0.09) 0 2px, transparent 4px)",
    };
  }

  if (entityType === "audience") {
    return {
      border: "border-amber-200/50",
      glow: "shadow-[0_0_18px_rgba(251,191,36,0.12)]",
      label: "text-amber-100",
      ring: "border-amber-200/18",
      line: "#f59e0b",
      planet:
        "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.2), transparent 15%), radial-gradient(circle at 45% 38%, rgba(252,211,77,0.25), transparent 30%), radial-gradient(circle at 60% 60%, rgba(245,158,11,0.18), transparent 36%), radial-gradient(circle at 70% 78%, rgba(0,0,0,0.74), transparent 58%), linear-gradient(135deg, rgba(120,53,15,0.96), rgba(2,6,23,0.98))",
      texture:
        "linear-gradient(35deg, transparent 28%, rgba(255,255,255,0.08) 43%, transparent 58%), radial-gradient(circle at 48% 44%, rgba(255,255,255,0.08) 0 2px, transparent 4px)",
    };
  }

  if (entityType === "company") {
    return {
      border: "border-yellow-200/50",
      glow: "shadow-[0_0_18px_rgba(234,179,8,0.12)]",
      label: "text-yellow-100",
      ring: "border-yellow-200/18",
      line: "#eab308",
      planet:
        "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.2), transparent 15%), radial-gradient(circle at 45% 38%, rgba(253,224,71,0.23), transparent 30%), radial-gradient(circle at 60% 60%, rgba(202,138,4,0.18), transparent 36%), radial-gradient(circle at 70% 78%, rgba(0,0,0,0.74), transparent 58%), linear-gradient(135deg, rgba(113,63,18,0.96), rgba(2,6,23,0.98))",
      texture:
        "linear-gradient(25deg, transparent 30%, rgba(255,255,255,0.08) 42%, transparent 56%), radial-gradient(circle at 52% 50%, rgba(255,255,255,0.08) 0 2px, transparent 4px)",
    };
  }

  return {
    border: "border-white/30",
    glow: "shadow-[0_0_14px_rgba(255,255,255,0.08)]",
    label: "text-white",
    ring: "border-white/12",
    line: "#94a3b8",
    planet:
      "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.14), transparent 15%), radial-gradient(circle at 70% 78%, rgba(0,0,0,0.72), transparent 58%), linear-gradient(135deg, rgba(30,41,59,0.96), rgba(2,6,23,0.98))",
    texture:
      "radial-gradient(circle at 48% 44%, rgba(255,255,255,0.08) 0 2px, transparent 4px)",
  };
}

function getCleanName(name: string) {
  if (!name) return "Unknown";
  return name.length > 22 ? `${name.slice(0, 21)}…` : name;
}

function PlanetNode({ data }: any) {
  const selected = data.selected;
  const hasSelection = data.hasSelection;
  const intelligenceHighlighted = data.intelligenceHighlighted;
  const entityType = data.entityType;
  const name = data.entity?.name || "Unknown";
  const color = getNodeColor(entityType);

  const size =
    selected && entityType === "brand"
      ? "h-40 w-40"
      : entityType === "brand"
      ? "h-32 w-32"
      : "h-24 w-24";

  const dimmed = hasSelection && !selected && entityType === "brand";
  const isBrand = entityType === "brand";
  const hasRing = entityType === "campaign" || entityType === "company";

  return (
    <div
      className={`group relative flex items-center justify-center rounded-full transition-all duration-500 ${size} ${
        selected ? "scale-110" : ""
      } ${dimmed ? "opacity-25 blur-[1px] scale-90" : "opacity-100"} ${
        intelligenceHighlighted ? "scale-110" : ""
      }`}
    >
      {(selected || intelligenceHighlighted) && (
        <>
          <div className="absolute -inset-5 rounded-full border border-cyan-200/22 shadow-[0_0_32px_rgba(103,232,249,0.18)]" />
          <div className="absolute -inset-10 rounded-full border border-cyan-300/8" />
        </>
      )}

      {hasRing && (
        <div className="absolute h-[34%] w-[132%] rotate-[-14deg] rounded-full border border-white/20 shadow-[0_0_14px_rgba(255,255,255,0.08)]" />
      )}

      <div
        className={`absolute inset-0 overflow-hidden rounded-full border-2 ${color.border} ${color.glow}`}
      >
        <div
          className="absolute inset-0"
          style={{ background: color.planet }}
        />

        <div
          className="absolute inset-0 opacity-65 mix-blend-screen"
          style={{ background: color.texture }}
        />

        <div className="absolute inset-0 bg-black/18" />
      </div>

      <div className={`absolute inset-[5px] rounded-full border ${color.ring}`} />

      <Handle className="opacity-0" type="source" position={Position.Right} />
      <Handle className="opacity-0" type="target" position={Position.Left} />

      <div className="relative z-10 max-w-[76%] overflow-hidden rounded-xl bg-black/50 px-2 py-1 text-center shadow-[0_0_16px_rgba(0,0,0,0.58)] backdrop-blur-[2px]">
        <div
          className={`mb-0.5 uppercase tracking-[0.1em] ${color.label} ${
            isBrand ? "text-[8px]" : "text-[7px]"
          }`}
        >
          {entityType}
        </div>

        <div
          className={`max-w-full overflow-hidden whitespace-nowrap text-center font-semibold leading-none text-white ${
            isBrand ? (selected ? "text-[16px]" : "text-[13px]") : "text-[10px]"
          }`}
          style={{
            textOverflow: "ellipsis",
            textShadow: "0 2px 8px rgba(0,0,0,0.95)",
          }}
          title={name}
        >
          {getCleanName(name)}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  moleculeBrand: PlanetNode,
  moleculeSatellite: PlanetNode,
};

function getScatterPosition(index: number, total: number, scenarioMode: boolean) {
  const columns = scenarioMode ? 3 : 5;
  const spacingX = scenarioMode ? 330 : 310;
  const spacingY = scenarioMode ? 245 : 215;

  const row = Math.floor(index / columns);
  const col = index % columns;
  const rows = Math.ceil(total / columns);

  const baseX = 680 - ((columns - 1) * spacingX) / 2;
  const baseY = 430 - ((rows - 1) * spacingY) / 2;

  const waveX = Math.sin(index * 1.73) * 70;
  const waveY = Math.cos(index * 1.31) * 58;

  return {
    x: baseX + col * spacingX + waveX,
    y: baseY + row * spacingY + waveY,
  };
}

function getRelationshipColor(type: string) {
  if (type === "owned_by") return "#38bdf8";
  if (type === "has_product") return "#a3e635";
  if (type === "promotes") return "#a855f7";
  if (type === "targets") return "#f59e0b";
  return "#94a3b8";
}

function getRelationshipLabel(type: string) {
  if (type === "owned_by") return "owns";
  if (type === "has_product") return "product";
  if (type === "promotes") return "promotes";
  if (type === "targets") return "targets";
  return type;
}

function getNodeText(node: any) {
  const entity = node.data.entity;

  return [
    node.data.label,
    entity?.name,
    entity?.description,
    entity?.industry,
    entity?.country,
    entity?.product_type,
    entity?.category,
    entity?.objective,
    entity?.status,
    entity?.iab_tier_1,
    entity?.iab_tier_2,
    entity?.iab_tier_3,
    ...(entity?.search_keywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildIntelligenceAnswer(
  question: string,
  nodes: any[],
  relationships: any[],
  nodeLookup: Record<string, any>
): IntelligenceAnswer | null {
  const q = question.trim().toLowerCase();
  if (!q) return null;

  const brands = nodes.filter(
    (node) =>
      node.data.entityType === "brand" &&
      !hiddenBrandNames.includes(node.data.entity?.name)
  );
  const products = nodes.filter((node) => node.data.entityType === "product");
  const campaigns = nodes.filter((node) => node.data.entityType === "campaign");
  const audiences = nodes.filter((node) => node.data.entityType === "audience");
  const companies = nodes.filter((node) => node.data.entityType === "company");

  const allSearchableNodes = [
    ...brands,
    ...products,
    ...campaigns,
    ...audiences,
    ...companies,
  ];

  const matchedEntity =
    allSearchableNodes.find((node) =>
      q.includes((node.data.entity?.name || "").toLowerCase())
    ) ||
    allSearchableNodes.find((node) =>
      getNodeText(node)
        .split(" ")
        .some((word) => word.length > 3 && q.includes(word))
    );

  const categoryMatch = demoScenarios.find(
    (scenario) =>
      q.includes(scenario.title.toLowerCase()) ||
      scenario.brandNames.some((brand) => q.includes(brand.toLowerCase()))
  );

  if (q.includes("which brands") && categoryMatch) {
    const matchedBrands = brands.filter((brand) =>
      categoryMatch.brandNames.includes(brand.data.entity?.name)
    );

    return {
      title: `${categoryMatch.title} brands`,
      summary: `${categoryMatch.title} includes ${categoryMatch.brandNames.join(
        ", "
      )}.`,
      matchedNodes: matchedBrands,
      suggestions: [
        "Show campaigns related to Samsung",
        "What products belong to Xbox?",
      ],
    };
  }

  if ((q.includes("product") || q.includes("products")) && matchedEntity) {
    const connectedIds = getConnectedNodeIds(
      matchedEntity.data.nodeId,
      relationships,
      3
    );
    const matchedProducts = connectedIds
      .map((id) => nodeLookup[id])
      .filter(Boolean)
      .filter((node) => node.data.entityType === "product");

    return {
      title: `Products connected to ${matchedEntity.data.entity?.name}`,
      summary:
        matchedProducts.length > 0
          ? `${matchedEntity.data.entity?.name} is connected to ${matchedProducts
              .map((node) => node.data.entity?.name)
              .join(", ")}.`
          : `No products were found around ${matchedEntity.data.entity?.name}.`,
      matchedNodes: [matchedEntity, ...matchedProducts],
      suggestions: [
        `Show campaigns related to ${matchedEntity.data.entity?.name}`,
        `Which audiences target ${matchedEntity.data.entity?.name}?`,
      ],
    };
  }

  if ((q.includes("campaign") || q.includes("campaigns")) && matchedEntity) {
    const connectedIds = getConnectedNodeIds(
      matchedEntity.data.nodeId,
      relationships,
      3
    );
    const matchedCampaigns = connectedIds
      .map((id) => nodeLookup[id])
      .filter(Boolean)
      .filter((node) => node.data.entityType === "campaign");

    return {
      title: `Campaigns related to ${matchedEntity.data.entity?.name}`,
      summary:
        matchedCampaigns.length > 0
          ? `${matchedEntity.data.entity?.name} is connected to ${matchedCampaigns
              .map((node) => node.data.entity?.name)
              .join(", ")}.`
          : `No campaigns were found around ${matchedEntity.data.entity?.name}.`,
      matchedNodes: [matchedEntity, ...matchedCampaigns],
      suggestions: [
        `What products belong to ${matchedEntity.data.entity?.name}?`,
        `Which audiences are connected to ${matchedEntity.data.entity?.name}?`,
      ],
    };
  }

  if (
    q.includes("audience") ||
    q.includes("audiences") ||
    q.includes("target") ||
    q.includes("targets")
  ) {
    const matchedAudience = audiences.find((node) =>
      q.includes((node.data.entity?.name || "").toLowerCase())
    );

    if (matchedAudience) {
      const connectedIds = getConnectedNodeIds(
        matchedAudience.data.nodeId,
        relationships,
        3
      );
      const connectedBrands = connectedIds
        .map((id) => nodeLookup[id])
        .filter(Boolean)
        .filter((node) => node.data.entityType === "brand");

      return {
        title: `Brands targeting ${matchedAudience.data.entity?.name}`,
        summary:
          connectedBrands.length > 0
            ? `${matchedAudience.data.entity?.name} is connected to ${connectedBrands
                .map((node) => node.data.entity?.name)
                .join(", ")}.`
            : `No brands were found for ${matchedAudience.data.entity?.name}.`,
        matchedNodes: [matchedAudience, ...connectedBrands],
        suggestions: ["Show campaigns related to PlayStation"],
      };
    }

    if (matchedEntity) {
      const connectedIds = getConnectedNodeIds(
        matchedEntity.data.nodeId,
        relationships,
        3
      );
      const matchedAudiences = connectedIds
        .map((id) => nodeLookup[id])
        .filter(Boolean)
        .filter((node) => node.data.entityType === "audience");

      return {
        title: `Audiences connected to ${matchedEntity.data.entity?.name}`,
        summary:
          matchedAudiences.length > 0
            ? `${matchedEntity.data.entity?.name} is connected to ${matchedAudiences
                .map((node) => node.data.entity?.name)
                .join(", ")}.`
            : `No audiences were found around ${matchedEntity.data.entity?.name}.`,
        matchedNodes: [matchedEntity, ...matchedAudiences],
        suggestions: [
          `Show campaigns related to ${matchedEntity.data.entity?.name}`,
          `What products belong to ${matchedEntity.data.entity?.name}?`,
        ],
      };
    }
  }

  if (matchedEntity) {
    const connectedIds = getConnectedNodeIds(
      matchedEntity.data.nodeId,
      relationships,
      3
    );
    const connectedNodes = connectedIds
      .map((id) => nodeLookup[id])
      .filter(Boolean)
      .slice(0, 12);

    return {
      title: `Galaxy context for ${matchedEntity.data.entity?.name}`,
      summary: `${matchedEntity.data.entity?.name} is connected to ${connectedNodes.length} visible intelligence signals in the Brand Galaxy graph.`,
      matchedNodes: [matchedEntity, ...connectedNodes],
      suggestions: [
        `Show campaigns related to ${matchedEntity.data.entity?.name}`,
        `What products belong to ${matchedEntity.data.entity?.name}?`,
      ],
    };
  }

  const fallbackMatches = allSearchableNodes
    .filter((node) =>
      q
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .some((word) => getNodeText(node).includes(word))
    )
    .slice(0, 8);

  return {
    title: fallbackMatches.length ? "Best matching signals" : "No strong match found",
    summary: fallbackMatches.length
      ? `I found ${fallbackMatches.length} possible matches: ${fallbackMatches
          .map((node) => node.data.entity?.name)
          .join(", ")}.`
      : "Try asking about a brand, product, campaign, audience, or sector.",
    matchedNodes: fallbackMatches,
    suggestions: [
      "Show campaigns related to Samsung",
      "What products belong to Xbox?",
    ],
  };
}

function IntelligenceMetric({ label, value }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[0_0_18px_rgba(255,255,255,0.03)]">
      <div className="text-3xl font-bold text-cyan-100">{value}</div>
      <div className="text-xs uppercase text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function MiniEntityList({ title, items }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[0_0_18px_rgba(255,255,255,0.03)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="text-xs text-gray-500">{items.length}</span>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-500">No signals detected.</p>
      )}

      <div className="space-y-2">
        {items.map((item: any) => (
          <div
            key={item.nodeId}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="text-xs uppercase text-cyan-300">
              {item.entityType}
            </div>

            <div className="text-sm font-semibold">
              {item.entity?.name || "Unknown"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitiveOverlapPanel({
  selectedNode,
  relationships,
  nodeLookup,
}: any) {
  if (!selectedNode) return null;

  const selectedNodeId = selectedNode.nodeId;

  const directCompetitors = relationships
    .filter((rel: any) => {
      const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
      const targetNodeId = `${rel.target_type}-${rel.target_id}`;

      return (
        rel.relationship_type === "competes_with" &&
        (sourceNodeId === selectedNodeId || targetNodeId === selectedNodeId)
      );
    })
    .map((rel: any) => {
      const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
      const targetNodeId = `${rel.target_type}-${rel.target_id}`;

      const competitorId =
        sourceNodeId === selectedNodeId ? targetNodeId : sourceNodeId;

      return nodeLookup[competitorId]?.data;
    })
    .filter(Boolean)
    .filter(
      (item: any) =>
        !(
          item.entityType === "brand" &&
          hiddenBrandNames.includes(item.entity?.name)
        )
    );

  const uniqueCompetitors = Array.from(
    new Map(directCompetitors.map((item: any) => [item.nodeId, item])).values()
  );

  if (uniqueCompetitors.length === 0) {
    return (
      <div className="mb-6 rounded-3xl border border-white/10 bg-black/24 p-5">
        <div className="text-slate-200 text-sm font-semibold mb-2">
          Competitive Orbit
        </div>

        <div className="text-sm text-gray-400">
          No direct competitor orbit detected yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-3xl border border-red-400/24 bg-red-500/8 p-5 shadow-[0_0_24px_rgba(239,68,68,0.08)]">
      <div className="text-red-200 text-sm font-semibold mb-4">
        Competitive Orbit
      </div>

      <div className="space-y-3">
        {uniqueCompetitors.map((competitor: any) => (
          <div
            key={competitor.nodeId}
            className="rounded-2xl border border-white/10 bg-black/24 p-4"
          >
            <div className="text-xs uppercase text-red-200">
              Competitor Star
            </div>

            <div className="text-lg font-bold text-white">
              {competitor.entity?.name}
            </div>

            <div className="mt-2 text-sm text-gray-300 leading-6">
              {selectedNode.entity?.name} and {competitor.entity?.name} share
              direct competitive positioning signals in the advertising galaxy.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectedEntityPanel({
  selectedNode,
  ecosystemProfile,
  aiSummary,
  relationships,
  nodeLookup,
  activeScenario,
  intelligenceAnswer,
}: any) {
  if (!selectedNode && !intelligenceAnswer) {
    return (
      <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 min-h-[780px] shadow-[0_0_42px_rgba(34,211,238,0.08)] backdrop-blur-xl">
        <div className="rounded-3xl border border-cyan-300/18 bg-cyan-500/8 p-5 mb-5">
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200 mb-2">
            Command Deck
          </div>

          <h2 className="text-3xl font-black mb-3">Brand Galaxy</h2>

          <p className="text-gray-300 leading-6 text-sm">
            Select a sector, click a planet, or ask Brand Galaxy a question.
          </p>
        </div>

        {activeScenario && (
          <div className="rounded-3xl border border-indigo-400/24 bg-indigo-500/8 p-5">
            <div className="text-4xl mb-3">{activeScenario.emoji}</div>

            <div className="text-indigo-200 text-sm font-semibold mb-2">
              Active Sector
            </div>

            <div className="text-xl font-bold text-white mb-2">
              {activeScenario.title}
            </div>

            <div className="text-sm text-gray-300">
              Showing matching brand planets in this category.
            </div>
          </div>
        )}
      </aside>
    );
  }

  if (intelligenceAnswer && !selectedNode) {
    return (
      <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 min-h-[780px] overflow-y-auto shadow-[0_0_42px_rgba(34,211,238,0.08)] backdrop-blur-xl">
        <div className="text-xs tracking-[0.25em] text-cyan-300 uppercase mb-2">
          Ask Brand Galaxy
        </div>

        <h2 className="text-3xl font-black mb-4">
          {intelligenceAnswer.title}
        </h2>

        <div className="mb-6 rounded-3xl border border-cyan-300/24 bg-cyan-500/8 p-5 text-gray-200 leading-7">
          {intelligenceAnswer.summary}
        </div>

        <MiniEntityList
          title="Matched Intelligence Signals"
          items={intelligenceAnswer.matchedNodes.map((node: any) => node.data)}
        />

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/24 p-5">
          <div className="text-cyan-200 font-semibold mb-3">
            Suggested questions
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            {intelligenceAnswer.suggestions.map((suggestion: string) => (
              <div key={suggestion}>{suggestion}</div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  const entity = selectedNode.entity;

  return (
    <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 min-h-[780px] overflow-y-auto shadow-[0_0_42px_rgba(34,211,238,0.08)] backdrop-blur-xl">
      <div className="text-xs tracking-[0.25em] text-cyan-300 uppercase mb-2">
        {selectedNode.entityType} signal
      </div>

      <h2 className="text-3xl font-black mb-6">{entity?.name || "Unknown"}</h2>

      <div className="mb-6 rounded-3xl border border-cyan-300/24 bg-cyan-500/8 p-5 shadow-[0_0_28px_rgba(34,211,238,0.08)]">
        <div className="text-sm text-cyan-200 font-semibold mb-3">
          Galaxy Intelligence Score
        </div>

        <div className="text-6xl font-black text-white mb-2">
          {ecosystemProfile.score}
        </div>

        <div className="text-sm text-gray-300">
          Signal density:
          <span className="text-cyan-200 font-semibold ml-2">
            {ecosystemProfile.intensity}
          </span>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-black/24 p-5 shadow-[0_0_24px_rgba(255,255,255,0.03)]">
        <div className="text-cyan-200 text-sm font-semibold mb-3">
          AI Strategic Galaxy Summary
        </div>

        <div className="text-gray-200 leading-7 text-sm">{aiSummary}</div>
      </div>

      <CompetitiveOverlapPanel
        selectedNode={selectedNode}
        relationships={relationships}
        nodeLookup={nodeLookup}
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <IntelligenceMetric
          label="Companies"
          value={ecosystemProfile.companies.length}
        />
        <IntelligenceMetric
          label="Products"
          value={ecosystemProfile.products.length}
        />
        <IntelligenceMetric
          label="Campaigns"
          value={ecosystemProfile.campaigns.length}
        />
        <IntelligenceMetric
          label="Audiences"
          value={ecosystemProfile.audiences.length}
        />
      </div>

      <div className="space-y-4">
        <MiniEntityList
          title="Company Planets"
          items={ecosystemProfile.companies}
        />
        <MiniEntityList
          title="Product Moons"
          items={ecosystemProfile.products}
        />
        <MiniEntityList
          title="Campaign Planets"
          items={ecosystemProfile.campaigns}
        />
        <MiniEntityList
          title="Audience Planets"
          items={ecosystemProfile.audiences}
        />
        <MiniEntityList
          title="Related Brand Stars"
          items={ecosystemProfile.brands}
        />
      </div>
    </aside>
  );
}

export default function RelationshipExplorer() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [nodeLookup, setNodeLookup] = useState<Record<string, any>>({});
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [focusedBrandNodeId, setFocusedBrandNodeId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [questionQuery, setQuestionQuery] = useState("");
  const [intelligenceAnswer, setIntelligenceAnswer] =
    useState<IntelligenceAnswer | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const activeScenario = useMemo(() => {
    return (
      demoScenarios.find((scenario) => scenario.id === activeScenarioId) || null
    );
  }, [activeScenarioId]);

  const intelligenceNodeIds = useMemo(() => {
    return new Set(
      intelligenceAnswer?.matchedNodes.map((node: any) => node.id) || []
    );
  }, [intelligenceAnswer]);

  useEffect(() => {
    async function loadGraph() {
      const { data: relationshipsData } = await supabase
        .from("entity_relationships")
        .select("*");

      const { data: companies } = await supabase.from("companies").select("*");
      const { data: brands } = await supabase.from("brands").select("*");
      const { data: products } = await supabase.from("products").select("*");
      const { data: campaigns } = await supabase.from("campaigns").select("*");
      const { data: audiences } = await supabase.from("audiences").select("*");

      const usedNodeIds = new Set<string>();
      const lookup: Record<string, any> = {};

      relationshipsData?.forEach((rel: any) => {
        usedNodeIds.add(`${rel.source_type}-${rel.source_id}`);
        usedNodeIds.add(`${rel.target_type}-${rel.target_id}`);
      });

      const graphNodes: any[] = [];

      function addNode(type: string, item: any, label: string) {
        const id = `${type}-${item.id}`;

        if (type !== "brand" && !usedNodeIds.has(id)) return;
        if (type === "brand" && hiddenBrandNames.includes(item.name)) return;

        const node = {
          id,
          type: "default",
          data: {
            label,
            entityType: type,
            entity: item,
            nodeId: id,
          },
          position: { x: 0, y: 0 },
        };

        graphNodes.push(node);
        lookup[id] = node;
      }

      companies?.forEach((item: any) =>
        addNode("company", item, `Company: ${item.name}`)
      );

      brands?.forEach((item: any) =>
        addNode("brand", item, `Brand: ${item.name}`)
      );

      products?.forEach((item: any) =>
        addNode("product", item, `Product: ${item.name}`)
      );

      campaigns?.forEach((item: any) =>
        addNode("campaign", item, `Campaign: ${item.name}`)
      );

      audiences?.forEach((item: any) =>
        addNode("audience", item, `Audience: ${item.name}`)
      );

      setNodes(graphNodes);
      setRelationships(relationshipsData || []);
      setNodeLookup(lookup);
    }

    loadGraph();
  }, []);

  const taxonomySearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return nodes
      .filter((node) => nodeMatchesSearch(node, searchQuery))
      .slice(0, 12);
  }, [searchQuery, nodes]);

  const selectedEcosystemProfile = useMemo(() => {
    return buildEcosystemProfile(selectedNode, relationships, nodeLookup);
  }, [selectedNode, relationships, nodeLookup]);

  const aiSummary = useMemo(() => {
    return generateAIStrategicSummary(selectedNode, selectedEcosystemProfile);
  }, [selectedNode, selectedEcosystemProfile]);

  const selectedSatelliteCount = useMemo(() => {
    if (!focusedBrandNodeId) return 0;

    return relationships.filter((rel: any) => {
      const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
      return (
        sourceNodeId === focusedBrandNodeId &&
        ["owned_by", "has_product", "runs_campaign", "targets"].includes(
          rel.relationship_type
        )
      );
    }).length;
  }, [relationships, focusedBrandNodeId]);

  const moleculeData = useMemo(() => {
    const allBrandNodes = nodes.filter(
      (node) =>
        node.data.entityType === "brand" &&
        !hiddenBrandNames.includes(node.data.entity?.name)
    );

    const visibleBrandNodes = activeScenario
      ? allBrandNodes.filter((node) => nodeMatchesScenario(node, activeScenario))
      : allBrandNodes;

    const brandMoleculeNodes = visibleBrandNodes.map((brand, index) => {
      const isSelected = focusedBrandNodeId === brand.data.nodeId;

      const scatter = getScatterPosition(
        index,
        visibleBrandNodes.length,
        Boolean(activeScenario)
      );

      return {
        id: brand.id,
        type: "moleculeBrand",
        zIndex: isSelected || intelligenceNodeIds.has(brand.id) ? 45 : 20,
        data: {
          ...brand.data,
          selected: isSelected,
          hasSelection: Boolean(focusedBrandNodeId),
          scenarioMode: Boolean(activeScenario),
          intelligenceHighlighted: intelligenceNodeIds.has(brand.id),
        },
        position: isSelected ? { x: 610, y: 360 } : scatter,
      };
    });

    const visibleNodeIds = new Set(brandMoleculeNodes.map((node) => node.id));

    const visibleBrandEdges = !focusedBrandNodeId
      ? relationships
          .filter((rel: any) => {
            if (rel.relationship_type === "competes_with") return false;

            const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
            const targetNodeId = `${rel.target_type}-${rel.target_id}`;

            return (
              visibleNodeIds.has(sourceNodeId) &&
              visibleNodeIds.has(targetNodeId)
            );
          })
          .map((rel: any) => {
            const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
            const targetNodeId = `${rel.target_type}-${rel.target_id}`;
            const color = getRelationshipColor(rel.relationship_type);

            return {
              id: `visible-${rel.id || sourceNodeId + targetNodeId}`,
              source: sourceNodeId,
              target: targetNodeId,
              type: "default",
              animated: false,
              label: getRelationshipLabel(rel.relationship_type),
              labelStyle: {
                fill: "#e5e7eb",
                fontSize: 9,
                fontWeight: 400,
              },
              labelBgStyle: {
                fill: "rgba(0,0,0,0.55)",
                fillOpacity: 0.8,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 12,
                height: 12,
                color,
              },
              style: {
                stroke: color,
                strokeWidth: 1.05,
                opacity: 0.42,
                filter: `drop-shadow(0 0 3px ${color})`,
              },
            };
          })
      : [];

    if (!focusedBrandNodeId) {
      return {
        nodes: brandMoleculeNodes,
        edges: visibleBrandEdges,
      };
    }

    const connectedIds = relationships
      .filter((rel: any) => {
        const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
        return (
          sourceNodeId === focusedBrandNodeId &&
          ["owned_by", "has_product", "runs_campaign", "targets"].includes(
            rel.relationship_type
          )
        );
      })
      .map((rel: any) => `${rel.target_type}-${rel.target_id}`);

    const satelliteEntities = connectedIds
      .map((nodeId) => nodeLookup[nodeId])
      .filter(Boolean)
      .filter((node) =>
        ["company", "product", "campaign", "audience"].includes(
          node.data.entityType
        )
      );

    const uniqueSatellites = Array.from(
      new Map(
        satelliteEntities.map((node: any) => [node.data.nodeId, node])
      ).values()
    ).slice(0, 14);

    const satelliteNodes = uniqueSatellites.map((node: any, index: number) => {
      const angle =
        (index / Math.max(uniqueSatellites.length, 1)) * Math.PI * 2;

      const radius =
        uniqueSatellites.length <= 4
          ? 205
          : uniqueSatellites.length <= 8
          ? 250
          : 285;

      const satelliteId = `satellite-${node.data.nodeId}`;

      return {
        id: satelliteId,
        type: "moleculeSatellite",
        zIndex: intelligenceNodeIds.has(node.id) ? 45 : 30,
        data: {
          ...node.data,
          intelligenceHighlighted: intelligenceNodeIds.has(node.id),
        },
        position: {
          x: Math.cos(angle) * radius + 640,
          y: Math.sin(angle) * radius + 390,
        },
      };
    });

    const satelliteEdges = satelliteNodes.map((satellite) => {
      const targetType = satellite.data.entityType;
      const edgeColor =
        targetType === "product"
          ? "#a3e635"
          : targetType === "campaign"
          ? "#a855f7"
          : targetType === "audience"
          ? "#f59e0b"
          : targetType === "company"
          ? "#38bdf8"
          : "#94a3b8";

      return {
        id: `edge-${focusedBrandNodeId}-${satellite.id}`,
        source: focusedBrandNodeId,
        target: satellite.id,
        animated: false,
        zIndex: 1,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 13,
          height: 13,
          color: edgeColor,
        },
        style: {
          stroke: edgeColor,
          strokeWidth: 1.2,
          opacity: 0.58,
          filter: `drop-shadow(0 0 4px ${edgeColor})`,
        },
      };
    });

    return {
      nodes: [...brandMoleculeNodes, ...satelliteNodes],
      edges: satelliteEdges,
    };
  }, [
    nodes,
    relationships,
    nodeLookup,
    focusedBrandNodeId,
    activeScenario,
    intelligenceNodeIds,
  ]);

  useEffect(() => {
    if (!reactFlowInstance) return;

    const timeout = window.setTimeout(() => {
      if (focusedBrandNodeId) {
        reactFlowInstance.setCenter(640, 390, {
          zoom:
            selectedSatelliteCount <= 4
              ? 1.42
              : selectedSatelliteCount <= 8
              ? 1.18
              : 1.02,
          duration: 800,
        });
      } else {
        reactFlowInstance.fitView({
          padding: activeScenarioId ? 0.32 : 0.25,
          duration: 800,
          maxZoom: 1,
        });
      }
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [
    reactFlowInstance,
    activeScenarioId,
    focusedBrandNodeId,
    selectedSatelliteCount,
    moleculeData.nodes.length,
  ]);

  function activateScenario(scenario: any) {
    setActiveScenarioId(scenario.id);
    setSelectedNode(null);
    setFocusedBrandNodeId(null);
    setSearchQuery("");
    setIntelligenceAnswer(null);
  }

  function askBrandGalaxy(customQuestion?: string) {
    const question = customQuestion || questionQuery;
    const answer = buildIntelligenceAnswer(
      question,
      nodes,
      relationships,
      nodeLookup
    );

    setIntelligenceAnswer(answer);
    setSelectedNode(null);

    const lowerQuestion = question.toLowerCase();

    const matchedScenario = demoScenarios.find(
      (scenario) =>
        lowerQuestion.includes(scenario.title.toLowerCase()) ||
        scenario.brandNames.some((brand) =>
          lowerQuestion.includes(brand.toLowerCase())
        )
    );

    if (matchedScenario && lowerQuestion.includes("which brands")) {
      setActiveScenarioId(matchedScenario.id);
      setFocusedBrandNodeId(null);
      return;
    }

    const firstBrand = answer?.matchedNodes.find(
      (node: any) => node.data.entityType === "brand"
    );

    if (firstBrand) {
      setFocusedBrandNodeId(firstBrand.data.nodeId);
    } else {
      setFocusedBrandNodeId(null);
    }
  }

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(15,23,42,0.38),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-28 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10">
          <div className="mb-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-cyan-300/24 bg-cyan-500/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200 backdrop-blur-xl">
                Brand Galaxy Map
              </div>

              <h1 className="text-6xl font-black mb-3 tracking-tight text-white">
                Galaxy Map
              </h1>

              <div className="text-sm uppercase tracking-[0.3em] text-cyan-200 mb-4">
                Strategic Relationship Intelligence
              </div>

              <p className="text-gray-300 text-lg max-w-3xl">
                Explore brand planets, product moons, campaign planets, audience
                segments and strategic relationship orbits.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
              <div>
                <div className="text-2xl font-black text-cyan-200">
                  {
                    nodes.filter(
                      (node) =>
                        node.data.entityType === "brand" &&
                        !hiddenBrandNames.includes(node.data.entity?.name)
                    ).length
                  }
                </div>
                <div className="text-xs text-gray-400">Brand Planets</div>
              </div>

              <div>
                <div className="text-2xl font-black text-sky-200">
                  {relationships.length}
                </div>
                <div className="text-xs text-gray-400">Signals</div>
              </div>

              <div>
                <div className="text-2xl font-black text-indigo-200">
                  {demoScenarios.length}
                </div>
                <div className="text-xs text-gray-400">Sectors</div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            <button
              onClick={() => {
                setActiveScenarioId(null);
                setSelectedNode(null);
                setFocusedBrandNodeId(null);
                setIntelligenceAnswer(null);
              }}
              className={`rounded-3xl border p-5 text-left transition backdrop-blur-xl ${
                !activeScenario
                  ? "border-cyan-300/42 bg-cyan-500/14 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                  : "border-white/10 bg-white/[0.055] hover:bg-white/10"
              }`}
            >
              <div className="text-3xl mb-3">🌌</div>
              <div className="font-bold text-white mb-1">All</div>
              <div className="text-sm text-gray-400">Full brand universe</div>
            </button>

            {demoScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => activateScenario(scenario)}
                className={`rounded-3xl border p-5 text-left transition backdrop-blur-xl ${
                  activeScenarioId === scenario.id
                    ? "border-cyan-300/42 bg-cyan-500/14 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                    : "border-white/10 bg-white/[0.055] hover:bg-white/10"
                }`}
              >
                <div className="text-3xl mb-3">{scenario.emoji}</div>

                <div className="font-bold text-white mb-1">
                  {scenario.title}
                </div>

                <div className="text-sm text-gray-400">
                  {scenario.subtitle}
                </div>
              </button>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur-xl shadow-[0_0_26px_rgba(255,255,255,0.03)]">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand planets, audiences, campaigns or IAB categories..."
                className="w-full rounded-2xl bg-black/36 border border-white/10 p-4 text-white placeholder:text-gray-500 outline-none focus:border-cyan-300/60"
              />
            </div>

            <div className="rounded-3xl border border-cyan-300/18 bg-cyan-500/8 p-3 backdrop-blur-xl shadow-[0_0_26px_rgba(34,211,238,0.05)]">
              <div className="flex gap-2">
                <input
                  value={questionQuery}
                  onChange={(e) => setQuestionQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") askBrandGalaxy();
                  }}
                  placeholder="Ask Brand Galaxy: Show campaigns related to Samsung"
                  className="w-full rounded-2xl bg-black/36 border border-white/10 p-4 text-white placeholder:text-gray-500 outline-none focus:border-cyan-300/60"
                />

                <button
                  onClick={() => askBrandGalaxy()}
                  disabled={!questionQuery.trim()}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-500/16 px-5 font-semibold text-cyan-100 hover:bg-cyan-500/24 disabled:opacity-40"
                >
                  Ask
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {[
                  "Show campaigns related to Samsung",
                  "What products belong to Xbox?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuestionQuery(suggestion);
                      askBrandGalaxy(suggestion);
                    }}
                    className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-gray-300 hover:border-cyan-300/40 hover:text-cyan-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {taxonomySearchResults.length > 0 && (
            <div className="mb-6 rounded-3xl border border-cyan-300/24 bg-cyan-500/8 p-5 backdrop-blur-xl">
              <div className="text-cyan-200 font-semibold mb-3">
                Intelligence Search Results
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {taxonomySearchResults.map((node: any) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node.data);
                      setIntelligenceAnswer(null);

                      if (node.data.entityType === "brand") {
                        setFocusedBrandNodeId(node.data.nodeId);
                      }
                    }}
                    className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left hover:border-cyan-300/50 transition"
                  >
                    <div className="text-xs uppercase text-cyan-300 mb-1">
                      {node.data.entityType}
                    </div>

                    <div className="font-semibold text-white mb-2">
                      {node.data.entity?.name || "Unknown"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-6">
            <div className="relative h-[850px] rounded-[2rem] border border-white/10 overflow-hidden bg-black shadow-[0_0_45px_rgba(34,211,238,0.08)]">
              <div
                className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-64"
                style={{
                  backgroundImage: `url(${GALAXY_BACKGROUND})`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 z-0 bg-slate-950/26" />
              <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,rgba(2,6,23,0.18)_58%,rgba(2,6,23,0.62)_100%)]" />

              <ReactFlow
                nodes={moleculeData.nodes}
                edges={moleculeData.edges}
                fitView
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => {
                  setSelectedNode(node.data);
                  setIntelligenceAnswer(null);

                  if (node.data.entityType === "brand") {
                    setFocusedBrandNodeId(node.data.nodeId);
                  }
                }}
                onPaneClick={() => {
                  setSelectedNode(null);
                  setFocusedBrandNodeId(null);
                }}
                style={{
                  background: "transparent",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Background color="#ffffff12" gap={30} />
                <Controls />
              </ReactFlow>

              <div className="pointer-events-none absolute bottom-3 right-4 z-20 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] text-gray-200 backdrop-blur-md">
                Image: The Hubble Deep Field, December 1995, 3,000 previously unseen, distant galaxies
              </div>
            </div>

            <SelectedEntityPanel
              selectedNode={selectedNode}
              ecosystemProfile={selectedEcosystemProfile}
              aiSummary={aiSummary}
              relationships={relationships}
              nodeLookup={nodeLookup}
              activeScenario={activeScenario}
              intelligenceAnswer={intelligenceAnswer}
            />
          </div>
        </div>
      </main>
    </>
  );
}