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

const hiddenBrandNames = [
  "Nintendo Switch",
  "Samsung Galaxy",
  "PROMO",
  "PRG",
  "DIGITAL",
  "Digital",
  "Promo",
];

type RelationshipFilter = "all" | "competitors" | "products" | "campaigns" | "audiences";

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

function normalizeEntityKey(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[®™©]/g, "")
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/\b(the|brand|company|inc|llc|ltd|corp|corporation|group)\b/gi, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

const BRAND_ALIAS_MAP: Record<string, string> = {
  jeep: "Jeep",
  jeepbrand: "Jeep",
  jeepcherokee: "Jeep",
  stellantisjeep: "Jeep",
  coca: "Coca-Cola",
  cocacola: "Coca-Cola",
  coke: "Coca-Cola",
  pepsi: "Pepsi",
  pepsico: "Pepsi",
  mcdonalds: "McDonald's",
  mcdonald: "McDonald's",
  burgerking: "Burger King",
  bk: "Burger King",
  kfc: "KFC",
  kentuckyfriedchicken: "KFC",
  apple: "Apple",
  appleinc: "Apple",
  samsung: "Samsung",
  samsungmobile: "Samsung",
  playstation: "PlayStation",
  sonyplaystation: "PlayStation",
  xbox: "Xbox",
  microsoftxbox: "Xbox",
  nintendo: "Nintendo",
  netflix: "Netflix",
  youtube: "YouTube",
  spotify: "Spotify",
  toyota: "Toyota",
  ford: "Ford",
  bmw: "BMW",
  mercedesbenz: "Mercedes-Benz",
  mercedes: "Mercedes-Benz",
  audi: "Audi",
  gmc: "GMC",
  thor: "Thor",
  lancome: "Lancome",
  carshield: "Car Shield",
  carshieldcom: "Car Shield",
  audienhearing: "Audien Hearing",
  paramountplus: "Paramount Plus",
  libertymutual: "Liberty Mutual",
  libertymutualinsurance: "Liberty Mutual",
  progressive: "Progressive",
  progressiveinsurance: "Progressive",
  republicbankfoundation: "Republic Bank Foundation",
};

function canonicalBrandName(value: string) {
  const raw = (value || "").trim();
  const key = normalizeEntityKey(raw);

  if (!key) return "";
  if (BRAND_ALIAS_MAP[key]) return BRAND_ALIAS_MAP[key];

  const fuzzyMatch = Object.entries(BRAND_ALIAS_MAP).find(([alias]) =>
    key === alias || key.startsWith(alias) || key.includes(alias)
  );

  if (fuzzyMatch) return fuzzyMatch[1];

  return raw
    .replace(/[®™©]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalProductName(value: string, brandName = "") {
  const raw = (value || "").replace(/[®™©]/g, "").replace(/\s+/g, " ").trim();
  if (!raw) return "";

  const brand = canonicalBrandName(brandName);
  const brandKey = normalizeEntityKey(brand);
  let cleaned = raw;

  if (brandKey) {
    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned
      .replace(new RegExp(`^${escapedBrand}\\s+`, "i"), "")
      .replace(new RegExp(`\\s+by\\s+${escapedBrand}$`, "i"), "")
      .replace(new RegExp(`^${escapedBrand}[-: ]+`, "i"), "")
      .trim();
  }

  const normalized = normalizeEntityKey(cleaned);

  if (normalized.includes("wrangler")) return "Wrangler";
  if (normalized.includes("grandcherokee")) return "Grand Cherokee";
  if (normalized.includes("gladiator")) return "Gladiator";
  if (normalized.includes("cherokee")) return "Cherokee";
  if (normalized.includes("cocacolazero") || normalized.includes("cokezero") || normalized.includes("zerosugar")) {
    return "Coca-Cola Zero Sugar";
  }
  if (normalized === "coke" || normalized === "cocacola") return "Coca-Cola";
  if (normalized.includes("bigmac")) return "Big Mac";
  if (normalized.includes("whopper")) return "Whopper";
  if (normalized.includes("airmax")) return "Nike Air Max";
  if (normalized.includes("ultraboost")) return "Adidas Ultraboost";

  return cleaned || raw;
}


function isNoisyImportedEntityName(value: string) {
  const text = (value || "").toLowerCase().trim();

  if (!text) return true;

  const exactNoise = ["promo", "prg", "digital", "unknown advertiser"];
  if (exactNoise.includes(text)) return true;

  const noisePatterns = [
    "promo",
    "program",
    "station id",
    "news open",
    "weather open",
    "wlky.com",
    "digital",
  ];

  return noisePatterns.some((pattern) => text === pattern || text.includes(pattern));
}


function splitArgusProducts(value: string, brandName = "") {
  return Array.from(
    new Set(
      (value || "")
        .split(/[,;|]/)
        .map((item) => canonicalProductName(item, brandName))
        .filter(Boolean)
    )
  );
}

function getLiveNodeId(type: string, name: string) {
  return `${type}-argus-${normalizeEntityKey(name)}`;
}

function findExistingNodeByName(graphNodes: any[], type: string, name: string) {
  const key = normalizeEntityKey(type === "brand" ? canonicalBrandName(name) : name);
  if (!key) return null;

  return (
    graphNodes.find((node) => {
      if (node.data.entityType !== type) return false;

      const nodeName = node.data.entity?.name || "";
      const nodeKey = normalizeEntityKey(
        type === "brand" ? canonicalBrandName(nodeName) : nodeName
      );

      const aliases = node.data.entity?.aliases || [];
      const aliasKeys = aliases.map((alias: string) =>
        normalizeEntityKey(type === "brand" ? canonicalBrandName(alias) : alias)
      );

      return nodeKey === key || aliasKeys.includes(key);
    }) || null
  );
}

function createLiveNode(type: string, name: string, extra: any = {}) {
  const id = getLiveNodeId(type, name);

  return {
    id,
    type: "default",
    data: {
      label: `${type}: ${name}`,
      entityType: type,
      entity: {
        id: `argus-${normalizeEntityKey(name)}`,
        name,
        aliases: extra.aliases || [],
        source: "ARGUS Public API",
        is_live_argus: true,
        ...extra,
      },
      nodeId: id,
      liveArgus: true,
    },
    position: { x: 0, y: 0 },
  };
}

function createLiveRelationship(
  sourceType: string,
  sourceId: string,
  targetType: string,
  targetId: string,
  relationshipType: string,
  extra: any = {}
) {
  return {
    id: `argus-${relationshipType}-${sourceId}-${targetId}`,
    source_type: sourceType,
    source_id: sourceId.replace(`${sourceType}-`, ""),
    target_type: targetType,
    target_id: targetId.replace(`${targetType}-`, ""),
    relationship_type: relationshipType,
    weight: extra.weight || 0.82,
    source: "ARGUS Public API",
    is_live_argus: true,
    ...extra,
  };
}

function mergeArgusIntoGraph(baseNodes: any[], baseRelationships: any[], argusAds: any[]) {
  const mergedNodes = [...baseNodes];
  const mergedRelationships = [...baseRelationships];

  function upsertNode(type: string, name: string, extra: any = {}) {
    if (!name) return null;

    const canonicalName = type === "brand" ? canonicalBrandName(name) : name;
    const existing = findExistingNodeByName(mergedNodes, type, canonicalName);

    if (existing) {
      const aliases = Array.from(
        new Set([
          ...(existing.data.entity?.aliases || []),
          ...(extra.aliases || []),
          name,
          canonicalName,
        ].filter(Boolean))
      );

      existing.data.entity = {
        ...existing.data.entity,
        ...extra,
        name: existing.data.entity?.name || canonicalName,
        aliases,
        live_argus_seen: true,
        source: existing.data.entity?.source || "Supabase + ARGUS",
      };
      existing.data.liveArgus = existing.data.liveArgus || extra.liveArgusOnly || false;
      return existing;
    }

    const created = createLiveNode(type, canonicalName, {
      ...extra,
      aliases: Array.from(new Set([...(extra.aliases || []), name, canonicalName].filter(Boolean))),
    });
    mergedNodes.push(created);
    return created;
  }

  function addRelationshipOnce(rel: any) {
    const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
    const targetNodeId = `${rel.target_type}-${rel.target_id}`;

    const exists = mergedRelationships.some((existing) => {
      const existingSource = `${existing.source_type}-${existing.source_id}`;
      const existingTarget = `${existing.target_type}-${existing.target_id}`;
      return (
        existing.relationship_type === rel.relationship_type &&
        existingSource === sourceNodeId &&
        existingTarget === targetNodeId
      );
    });

    if (!exists) mergedRelationships.push(rel);
  }

  argusAds.forEach((ad) => {
    const rawBrandName = ad.brand_name || ad.brand || "";
    const brandName = canonicalBrandName(rawBrandName);
    if (!brandName) return;

    const advertiserName = canonicalBrandName(
      ad.advertiser_name || ad.advertiser || ad.parent_company || ""
    );

    const campaignName =
      ad.promotion_name ||
      ad.campaign_name ||
      ad.title ||
      `${brandName} ARGUS Campaign`;

    const products = splitArgusProducts(ad.products_text || ad.product || "", brandName);
    const iabName =
      ad.iab_full_path ||
      ad.iab_selected_category ||
      ad.iab_tier_1 ||
      ad.primary_category ||
      "";

    const brandNode = upsertNode("brand", brandName, {
      aliases: [rawBrandName, brandName],
      description:
        ad.primary_category || ad.iab_full_path
          ? `Live ARGUS brand signal classified as ${ad.iab_full_path || ad.primary_category}.`
          : "Live ARGUS brand signal.",
      category: ad.primary_category,
      iab_tier_1: ad.iab_tier_1,
      iab_tier_2: ad.iab_tier_2,
      iab_tier_3: ad.iab_tier_3,
      iab_full_path: ad.iab_full_path,
      confidence: ad.confidence,
      latest_argus_ad_id: ad.id,
      search_keywords: [
        rawBrandName,
        brandName,
        ad.primary_category,
        ad.subcategory,
        ad.iab_full_path,
        ad.products_text,
        ad.promotion_name,
      ].filter(Boolean),
    });

    if (!brandNode) return;

    if (advertiserName && normalizeEntityKey(advertiserName) !== normalizeEntityKey(brandName)) {
      const companyNode = upsertNode("company", advertiserName, {
        description: `ARGUS advertiser/company detected for ${brandName}.`,
        latest_argus_ad_id: ad.id,
      });

      if (companyNode) {
        addRelationshipOnce(
          createLiveRelationship(
            "brand",
            brandNode.data.nodeId,
            "company",
            companyNode.data.nodeId,
            "owned_by",
            { weight: 0.9 }
          )
        );
      }
    }

    if (campaignName) {
      const campaignNode = upsertNode("campaign", campaignName, {
        aliases: [ad.promotion_name, ad.campaign_name, ad.title].filter(Boolean),
        description: `Live ARGUS campaign/promotion for ${brandName}.`,
        objective: ad.primary_category || ad.subcategory || "ARGUS campaign signal",
        iab_tier_1: ad.iab_tier_1,
        iab_full_path: ad.iab_full_path,
        confidence: ad.confidence,
        latest_argus_ad_id: ad.id,
      });

      if (campaignNode) {
        addRelationshipOnce(
          createLiveRelationship(
            "brand",
            brandNode.data.nodeId,
            "campaign",
            campaignNode.data.nodeId,
            "runs_campaign",
            { weight: 0.84 }
          )
        );
      }
    }

    products.forEach((productName) => {
      const productNode = upsertNode("product", productName, {
        aliases: [productName, `${brandName} ${productName}`],
        description: `Live ARGUS product detected inside ${brandName} ad ${ad.id}.`,
        category: ad.primary_category,
        product_type: ad.subcategory || ad.iab_selected_category,
        iab_tier_1: ad.iab_tier_1,
        iab_full_path: ad.iab_full_path,
        confidence: ad.confidence,
        latest_argus_ad_id: ad.id,
      });

      if (productNode) {
        addRelationshipOnce(
          createLiveRelationship(
            "brand",
            brandNode.data.nodeId,
            "product",
            productNode.data.nodeId,
            "has_product",
            { weight: 0.86 }
          )
        );

        if (campaignName) {
          const campaignNode = findExistingNodeByName(mergedNodes, "campaign", campaignName);

          if (campaignNode) {
            addRelationshipOnce(
              createLiveRelationship(
                "campaign",
                campaignNode.data.nodeId,
                "product",
                productNode.data.nodeId,
                "promotes",
                { weight: 0.78 }
              )
            );
          }
        }
      }
    });

    if (iabName) {
      const audienceName = `${iabName} Context`;
      const audienceNode = upsertNode("audience", audienceName, {
        description: `ARGUS IAB/context signal generated from ${ad.iab_full_path || ad.primary_category}.`,
        category: ad.primary_category,
        iab_tier_1: ad.iab_tier_1,
        iab_full_path: ad.iab_full_path,
        latest_argus_ad_id: ad.id,
      });

      if (audienceNode) {
        addRelationshipOnce(
          createLiveRelationship(
            "brand",
            brandNode.data.nodeId,
            "audience",
            audienceNode.data.nodeId,
            "targets",
            { weight: 0.7 }
          )
        );
      }
    }
  });

  return {
    nodes: mergedNodes,
    relationships: mergedRelationships,
  };
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

  const selectedNodeId = selectedNode.nodeId;

  const directConnectedIds = relationships
    .filter((rel: any) => {
      const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
      const targetNodeId = `${rel.target_type}-${rel.target_id}`;

      return sourceNodeId === selectedNodeId || targetNodeId === selectedNodeId;
    })
    .map((rel: any) => {
      const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
      const targetNodeId = `${rel.target_type}-${rel.target_id}`;

      return sourceNodeId === selectedNodeId ? targetNodeId : sourceNodeId;
    });

  const deepConnectedIds = getConnectedNodeIds(selectedNodeId, relationships, 3);

  const allConnectedIds = Array.from(
    new Set([...directConnectedIds, ...deepConnectedIds])
  );

  const uniqueNodes = Array.from(
    new Map(
      allConnectedIds
        .map((id) => nodeLookup[id]?.data)
        .filter(Boolean)
        .filter(
          (node: any) =>
            !(
              node.entityType === "brand" &&
              hiddenBrandNames.includes(node.entity?.name)
            ) &&
            !isNoisyImportedEntityName(node.entity?.name || "")
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
      className={`group relative flex items-center justify-center rounded-full transition-all duration-700 ease-out hover:scale-[1.04] ${size} ${
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
        {data.liveArgus && (
  <div className="mt-1 text-[7px] uppercase tracking-[0.2em] text-emerald-200">
    Live ARGUS
  </div>
)}
      </div>
    </div>
  );
}

const nodeTypes = {
  moleculeBrand: PlanetNode,
  moleculeSatellite: PlanetNode,
};

function getScatterPosition(
  index: number,
  total: number,
  scenarioMode: boolean
) {
  const columns = scenarioMode ? 7 : 11;

  const spacingX = scenarioMode ? 420 : 390;
  const spacingY = scenarioMode ? 300 : 285;

  const row = Math.floor(index / columns);
  const col = index % columns;
  const rows = Math.ceil(total / columns);

  const baseX = 980 - ((columns - 1) * spacingX) / 2;
  const baseY = 540 - ((rows - 1) * spacingY) / 2;

  const offsetX =
    Math.sin(index * 1.37) * 95 +
    Math.cos(index * 0.71) * 45;

  const offsetY =
    Math.cos(index * 1.11) * 75 +
    Math.sin(index * 0.53) * 35;

  return {
    x: baseX + col * spacingX + offsetX,
    y: baseY + row * spacingY + offsetY,
  };
}

function getRelationshipColor(type: string) {
  if (type === "owned_by") return "#38bdf8";
  if (type === "has_product") return "#a3e635";
  if (type === "promotes" || type === "runs_campaign") return "#a855f7";
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


function getRelationshipCategory(type: string): RelationshipFilter {
  if (type === "competes_with") return "competitors";
  if (type === "has_product") return "products";
  if (type === "runs_campaign" || type === "promotes") return "campaigns";
  if (type === "targets") return "audiences";
  return "all";
}

function getRelationshipStrength(rel: any) {
  if (typeof rel.weight === "number") {
    return Math.max(10, Math.min(100, Math.round(rel.weight * 100)));
  }

  if (rel.relationship_type === "competes_with") return 88;
  if (rel.relationship_type === "targets") return 76;
  if (rel.relationship_type === "runs_campaign" || rel.relationship_type === "promotes") return 72;
  if (rel.relationship_type === "has_product") return 68;
  if (rel.relationship_type === "owned_by") return 95;

  return 55;
}

function getRelationshipWhy(type: string) {
  if (type === "competes_with") {
    return "Direct competitor relationship based on shared market/category positioning.";
  }

  if (type === "owned_by") {
    return "Ownership relationship connecting a commercial brand to its company entity.";
  }

  if (type === "has_product") {
    return "Product relationship connecting the brand to a product or product family.";
  }

  if (type === "runs_campaign" || type === "promotes") {
    return "Campaign relationship connecting the brand or product to an advertising activation.";
  }

  if (type === "targets") {
    return "Audience relationship showing which audience segment is connected to this signal.";
  }

  return "Relationship exists in the Brand Galaxy graph dataset.";
}

function getRelationshipBadge(strength: number, type: string) {
  if (type === "competes_with" && strength >= 80) return "High Competitive Overlap";
  if (type === "owned_by") return "Ownership Signal";
  if (type === "targets") return "Audience Link";
  if (type === "runs_campaign" || type === "promotes") return "Campaign Activation";
  if (type === "has_product") return "Product Link";
  if (strength >= 80) return "High Strength";
  if (strength >= 60) return "Medium Strength";
  return "Emerging Signal";
}

function buildRelationshipInsights(selectedNode: any, relationships: any[], nodeLookup: Record<string, any>) {
  if (!selectedNode?.nodeId) return [];

  return relationships
    .filter((rel: any) => {
      const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
      const targetNodeId = `${rel.target_type}-${rel.target_id}`;

      return sourceNodeId === selectedNode.nodeId || targetNodeId === selectedNode.nodeId;
    })
    .map((rel: any) => {
      const sourceNodeId = `${rel.source_type}-${rel.source_id}`;
      const targetNodeId = `${rel.target_type}-${rel.target_id}`;
      const otherNodeId = sourceNodeId === selectedNode.nodeId ? targetNodeId : sourceNodeId;
      const otherNode = nodeLookup[otherNodeId]?.data;
      const strength = getRelationshipStrength(rel);

      return {
        id: rel.id || `${sourceNodeId}-${targetNodeId}-${rel.relationship_type}`,
        type: rel.relationship_type,
        category: getRelationshipCategory(rel.relationship_type),
        strength,
        badge: getRelationshipBadge(strength, rel.relationship_type),
        why: getRelationshipWhy(rel.relationship_type),
        otherNode,
      };
    })
    .filter((item: any) => item.otherNode)
    .filter(
      (item: any) =>
        !(
          item.otherNode.entityType === "brand" &&
          hiddenBrandNames.includes(item.otherNode.entity?.name)
        ) &&
        !isNoisyImportedEntityName(item.otherNode.entity?.name || "")
    )
    .sort((a: any, b: any) => b.strength - a.strength);
}

function RelationshipInsightPanel({
  selectedNode,
  relationships,
  nodeLookup,
}: any) {
  const insights = buildRelationshipInsights(selectedNode, relationships, nodeLookup);

  if (!selectedNode) return null;

  if (insights.length === 0) {
    return (
      <div className="mb-5 rounded-3xl border border-white/10 bg-black/24 p-5">
        <div className="mb-2 text-sm font-semibold text-cyan-200">
          Relationship Intelligence
        </div>
        <div className="text-sm text-gray-400">
          No direct relationship intelligence found for this object yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-3xl border border-cyan-300/20 bg-cyan-500/8 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-cyan-200">
          Relationship Intelligence
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-black/25 px-3 py-1 text-xs text-cyan-100">
          {insights.length} direct signals
        </div>
      </div>

      <div className="space-y-3">
        {insights.slice(0, 5).map((insight: any) => (
          <div
            key={insight.id}
            className="rounded-2xl border border-white/10 bg-black/25 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-200">
                {getRelationshipLabel(insight.type)}
              </div>

              <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
                {insight.badge}
              </div>

              <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                Strength {insight.strength}%
              </div>
            </div>

            <div className="text-base font-bold text-white">
              {selectedNode.entity?.name} ↔ {insight.otherNode.entity?.name || "Unknown"}
            </div>

            <div className="mt-2 text-sm leading-6 text-gray-300">
              {insight.why}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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

function MiniEntityList({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: any[];
  onSelect?: (item: any) => void;
}) {
  const emptyContext = {
    nodeId: `empty-${title}`,
    entityType: "coverage",
    emptyContext: true,
    entity: {
      name: title,
      source: "Brand Galaxy",
    },
    contextTitle: title,
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[0_0_18px_rgba(255,255,255,0.03)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Click any card to open its intelligence context.
          </p>
        </div>
        <span className="shrink-0 text-xs text-gray-500">{items.length}</span>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <button
            type="button"
            onClick={() => onSelect?.(emptyContext)}
            className="w-full rounded-2xl border border-dashed border-cyan-300/20 bg-cyan-500/5 p-4 text-left transition hover:border-cyan-300/40 hover:bg-cyan-500/10"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                Intelligence Context
              </div>

              <div className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-gray-300">
                Explore
              </div>
            </div>

            <div className="text-sm font-bold text-white">
              {title} coverage
            </div>

            <div className="mt-2 text-xs leading-5 text-gray-400">
              No direct signals are mapped yet, but this panel is ready for review, enrichment and future relationship expansion.
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-100">
                Clickable Context
              </div>

              <div className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-gray-300">
                Ready for Signals
              </div>
            </div>
          </button>
        ) : (
          items.map((item: any) => (
            <button
              key={item.nodeId}
              type="button"
              onClick={() => onSelect?.(item)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-300/30 hover:bg-cyan-500/5"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                  {item.entityType}
                </div>

                <div className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-gray-300">
                  Signal
                </div>
              </div>

              <div className="text-sm font-bold text-white">
                {item.entity?.name || "Unknown"}
              </div>

              <div className="mt-2 text-xs leading-5 text-gray-400">
                {item.entityType === "product" &&
                  "Product intelligence signal inside the ecosystem."}

                {item.entityType === "campaign" &&
                  "Campaign activity connected to the selected brand."}

                {item.entityType === "brand" &&
                  "Related brand star with ecosystem overlap."}

                {item.entityType === "audience" &&
                  "Audience signal contributing to targeting intelligence."}

                {item.entityType === "company" &&
                  "Corporate ownership or strategic company relationship."}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-100">
                  Intelligence
                </div>

                <div className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-gray-300">
                  Active Signal
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function CompetitiveOverlapPanel({
  selectedNode,
  relationships,
  nodeLookup,
  ecosystemProfile,
}: any) {
  if (!selectedNode) return null;

  const selectedNodeId = selectedNode.nodeId;
  const selectedName = selectedNode.entity?.name || "Selected Entity";
  const selectedNameKey = normalizeEntityKey(selectedName);

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

      const competitor = nodeLookup[competitorId]?.data;
      const strength = getRelationshipStrength(rel);

      return competitor
        ? {
            ...competitor,
            relationshipStrength: strength,
            relationshipBadge: getRelationshipBadge(strength, rel.relationship_type),
            inferred: false,
          }
        : null;
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

  const allBrandNodes = Object.values(nodeLookup)
    .map((node: any) => node?.data)
    .filter(Boolean)
    .filter((node: any) => node.entityType === "brand")
    .filter((node: any) => node.nodeId !== selectedNodeId)
    .filter((node: any) => !hiddenBrandNames.includes(node.entity?.name))
    .filter((node: any) => !isNoisyImportedEntityName(node.entity?.name || ""));

  const scenarioBrandNames =
    demoScenarios.find((scenario) =>
      scenario.brandNames.some(
        (brandName: string) => normalizeEntityKey(brandName) === selectedNameKey
      )
    )?.brandNames || [];

  const scenarioCompetitors = allBrandNodes.filter((brand: any) =>
    scenarioBrandNames.some(
      (brandName: string) =>
        normalizeEntityKey(brandName) === normalizeEntityKey(brand.entity?.name || "")
    )
  );

  const selectedCategory =
    selectedNode.entity?.iab_tier_1 ||
    selectedNode.entity?.industry ||
    selectedNode.entity?.category ||
    selectedNode.entity?.primary_category ||
    "";

  const categoryCompetitors = selectedCategory
    ? allBrandNodes.filter((brand: any) => {
        const category =
          brand.entity?.iab_tier_1 ||
          brand.entity?.industry ||
          brand.entity?.category ||
          brand.entity?.primary_category ||
          "";

        return (
          category &&
          normalizeEntityKey(category) === normalizeEntityKey(selectedCategory)
        );
      })
    : [];

  const fallbackSource =
    uniqueCompetitors.length > 0
      ? uniqueCompetitors
      : ecosystemProfile?.brands?.length > 0
      ? ecosystemProfile.brands
      : scenarioCompetitors.length > 0
      ? scenarioCompetitors
      : categoryCompetitors.length > 0
      ? categoryCompetitors
      : allBrandNodes;

  const fallbackCompetitors = Array.from(
    new Map(
      fallbackSource
        .filter((brand: any) => brand.nodeId !== selectedNodeId)
        .filter((brand: any) => !hiddenBrandNames.includes(brand.entity?.name))
        .map((brand: any, index: number) => [
          brand.nodeId,
          uniqueCompetitors.length > 0
            ? brand
            : {
                ...brand,
                relationshipStrength: Math.max(62, 88 - index * 6),
                relationshipBadge: "AI-inferred Competitive Signal",
                inferred: true,
              },
        ])
    ).values()
  ).slice(0, 6);

  return (
    <div className="mb-6 rounded-3xl border border-red-400/24 bg-red-500/8 p-5 shadow-[0_0_24px_rgba(239,68,68,0.08)]">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-red-200 text-sm font-semibold">
          Competitive Orbit
        </div>
        <div className="text-xs text-gray-500">
          {uniqueCompetitors.length > 0
            ? "Direct competitor relationships"
            : "AI-inferred competitive landscape"}
        </div>
      </div>

      {fallbackCompetitors.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
          <div className="text-lg font-bold text-white">
            Competitive Intelligence Ready
          </div>

          <div className="mt-3 text-sm leading-6 text-gray-300">
            This entity is ready for competitor mapping. Add related brand, campaign, audience or category signals to strengthen competitive analysis.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {fallbackCompetitors.map((competitor: any) => (
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

              <div className="mt-2 flex flex-wrap gap-2">
                <div className="rounded-full border border-red-300/20 bg-red-500/10 px-3 py-1 text-xs text-red-100">
                  Strength {competitor.relationshipStrength || 88}%
                </div>
                <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-gray-200">
                  {competitor.relationshipBadge || "Competitive Signal"}
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-300 leading-6">
                {competitor.inferred
                  ? `${competitor.entity?.name} is positioned as a competitive or adjacent brand to ${selectedName} based on shared sector, category, ecosystem or related brand signals.`
                  : `${selectedName} and ${competitor.entity?.name} share direct competitive positioning signals in the advertising galaxy.`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function getOverlapDetails(selectedNode: any, insight: any, relationships: any[], nodeLookup: Record<string, any>) {
  const selectedConnected = new Set(getConnectedNodeIds(selectedNode.nodeId, relationships, 2));
  const otherConnected = new Set(getConnectedNodeIds(insight.otherNode.nodeId, relationships, 2));

  const sharedIds = Array.from(selectedConnected).filter((id) => otherConnected.has(id));
  const sharedNodes = sharedIds.map((id) => nodeLookup[id]?.data).filter(Boolean);

  const sharedAudiences = sharedNodes.filter((node: any) => node.entityType === "audience");
  const sharedCampaigns = sharedNodes.filter((node: any) => node.entityType === "campaign");
  const sharedProducts = sharedNodes.filter((node: any) => node.entityType === "product");
  const sharedBrands = sharedNodes.filter((node: any) => node.entityType === "brand");

  const explanation = [
    insight.why,
    sharedAudiences.length > 0
      ? `Shared audience overlap detected through ${sharedAudiences.length} audience signal${sharedAudiences.length === 1 ? "" : "s"}.`
      : "No shared audience signal detected yet.",
    sharedCampaigns.length > 0
      ? `Campaign overlap detected through ${sharedCampaigns.length} campaign signal${sharedCampaigns.length === 1 ? "" : "s"}.`
      : "No campaign overlap detected yet.",
    sharedProducts.length > 0
      ? `Product/category proximity detected through ${sharedProducts.length} product signal${sharedProducts.length === 1 ? "" : "s"}.`
      : "No shared product signal detected yet.",
  ];

  const conflictLevel =
    insight.type === "competes_with" && (sharedAudiences.length + sharedCampaigns.length + sharedProducts.length > 1)
      ? "High"
      : insight.type === "competes_with"
      ? "Medium"
      : sharedAudiences.length + sharedCampaigns.length + sharedProducts.length > 2
      ? "Medium"
      : "Low";

  return {
    sharedAudiences,
    sharedCampaigns,
    sharedProducts,
    sharedBrands,
    explanation,
    conflictLevel,
  };
}

function ExplainabilityLayer({
  selectedNode,
  relationships,
  nodeLookup,
}: any) {
  const insights = buildRelationshipInsights(selectedNode, relationships, nodeLookup).slice(0, 4);

  if (!selectedNode || insights.length === 0) return null;

  return (
    <div className="mb-5 rounded-3xl border border-indigo-300/20 bg-indigo-500/8 p-5">
      <div className="mb-3 text-sm font-semibold text-indigo-200">
        Explainability Layer
      </div>

      <div className="space-y-4">
        {insights.map((insight: any) => {
          const overlap = getOverlapDetails(selectedNode, insight, relationships, nodeLookup);

          return (
            <div
              key={`explain-${insight.id}`}
              className="rounded-2xl border border-white/10 bg-black/25 p-4"
            >
              <div className="mb-2 flex flex-wrap gap-2">
                <div className="rounded-full border border-indigo-300/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                  Why connected?
                </div>
                <div className="rounded-full border border-red-300/20 bg-red-500/10 px-3 py-1 text-xs text-red-100">
                  Strategic conflict: {overlap.conflictLevel}
                </div>
              </div>

              <div className="mb-3 text-base font-bold text-white">
                {selectedNode.entity?.name} ↔ {insight.otherNode.entity?.name}
              </div>

              <div className="space-y-2 text-sm leading-6 text-gray-300">
                {overlap.explanation.map((line: string) => (
                  <div key={line}>✦ {line}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RelationshipHeatmap({
  selectedNode,
  relationships,
  nodeLookup,
}: any) {
  const insights = buildRelationshipInsights(selectedNode, relationships, nodeLookup).slice(0, 6);

  if (!selectedNode || insights.length === 0) return null;

  return (
    <div className="mb-5 rounded-3xl border border-orange-300/20 bg-orange-500/8 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-orange-200">
          Relationship Heatmap
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Strength index
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight: any) => (
          <div key={`heat-${insight.id}`}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-gray-300">
                {selectedNode.entity?.name} ↔ {insight.otherNode.entity?.name}
              </span>
              <span className="font-bold text-white">{insight.strength}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-orange-300"
                style={{ width: `${insight.strength}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrossSectorIntelligence({
  activeScenario,
  nodes,
  relationships,
}: any) {
  const brandNodes = nodes.filter(
    (node: any) =>
      node.data.entityType === "brand" &&
      !hiddenBrandNames.includes(node.data.entity?.name)
  );

  const sectorSignals = demoScenarios
    .map((scenario) => {
      const presentBrands = brandNodes.filter((node: any) =>
        scenario.brandNames.includes(node.data.entity?.name)
      );

      const signalCount = relationships.filter((rel: any) =>
        presentBrands.some((brand: any) => {
          const id = brand.data.nodeId;
          return (
            `${rel.source_type}-${rel.source_id}` === id ||
            `${rel.target_type}-${rel.target_id}` === id
          );
        })
      ).length;

      return {
        ...scenario,
        presentBrands,
        signalCount,
      };
    })
    .filter((sector) => sector.presentBrands.length > 0)
    .sort((a, b) => b.signalCount - a.signalCount)
    .slice(0, 4);

  return (
    <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-cyan-200">
            Cross-Sector Intelligence
          </div>
          <div className="text-xs text-gray-500">
            Compares sectors by available brand and relationship signal density.
          </div>
        </div>

        <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
          {activeScenario ? `${activeScenario.title} active` : "All sectors"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {sectorSignals.map((sector) => (
          <div
            key={sector.id}
            className="rounded-2xl border border-white/10 bg-black/24 p-4"
          >
            <div className="mb-2 text-2xl">{sector.emoji}</div>
            <div className="font-bold text-white">{sector.title}</div>
            <div className="mt-1 text-xs text-gray-400">
              {sector.presentBrands.length} brands · {sector.signalCount} signals
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-300"
                style={{ width: `${Math.min(100, sector.signalCount * 8)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphLegend() {
  return (
    <div className="absolute left-4 top-4 z-20 max-w-[300px] rounded-3xl border border-white/10 bg-black/60 p-4 text-xs text-gray-300 backdrop-blur-xl">
      <div className="mb-3 font-bold text-white">Graph Legend</div>

      <div className="space-y-2">
        <div><span className="text-cyan-200">●</span> Brand planet = market-facing brand</div>
        <div><span className="text-emerald-200">●</span> Product moon = product/product family</div>
        <div><span className="text-violet-200">●</span> Campaign planet = advertising activation</div>
        <div><span className="text-amber-200">●</span> Audience planet = target audience segment</div>
        <div><span className="text-yellow-200">●</span> Company planet = owner/legal entity</div>
        <div><span className="text-green-200">●</span> Live ARGUS = temporary API-powered node</div>
      </div>

      <div className="mt-3 border-t border-white/10 pt-3 text-gray-400">
        Edge colors explain relationship type: ownership, product, campaign or audience link.
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
  nodes,
  setSelectedNode,
}: any) {
  if (!selectedNode && !intelligenceAnswer) {
    return (
      <aside className="min-h-[640px] rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_0_42px_rgba(34,211,238,0.08)] backdrop-blur-xl xl:min-h-[780px]">
        <div className="mb-5 rounded-3xl border border-cyan-300/18 bg-cyan-500/8 p-5">
          <div className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
            Command Deck
          </div>

          <h2 className="mb-3 text-3xl font-black">Brand Galaxy</h2>

          <p className="text-sm leading-6 text-gray-300">
            Select a sector, click a planet, or ask Brand Galaxy a question.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/24 p-5">
          <div className="mb-3 text-sm font-semibold text-cyan-200">
            Ready Intelligence Actions
          </div>

          <div className="space-y-3 text-sm text-gray-300">
            <div>✦ Explore brand ecosystems</div>
            <div>✦ Inspect campaign and audience signals</div>
            <div>✦ Compare competitive orbits</div>
            <div>✦ Generate strategic context from graph data</div>
          </div>
        </div>

        {activeScenario && (
          <div className="mt-5 rounded-3xl border border-indigo-400/24 bg-indigo-500/8 p-5">
            <div className="mb-3 text-4xl">{activeScenario.emoji}</div>

            <div className="mb-2 text-sm font-semibold text-indigo-200">
              Active Sector
            </div>

            <div className="mb-2 text-xl font-bold text-white">
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
      <aside className="min-h-[640px] overflow-y-auto rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_0_42px_rgba(34,211,238,0.08)] backdrop-blur-xl xl:min-h-[780px]">
        <div className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-300">
          Ask Brand Galaxy
        </div>

        <h2 className="mb-4 text-3xl font-black">{intelligenceAnswer.title}</h2>

        <div className="mb-6 rounded-3xl border border-cyan-300/24 bg-cyan-500/8 p-5 text-gray-200 leading-7">
          {intelligenceAnswer.summary}
        </div>

        <MiniEntityList
          title="Matched Intelligence Signals"
          items={intelligenceAnswer.matchedNodes.map((node: any) => node.data)}
        />

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/24 p-5">
          <div className="mb-3 font-semibold text-cyan-200">
            Suggested questions
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            {intelligenceAnswer.suggestions.map((suggestion: string) => (
              <div key={suggestion}>✦ {suggestion}</div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  const entity = selectedNode.entity;

  const totalSignals =
    ecosystemProfile.companies.length +
    ecosystemProfile.products.length +
    ecosystemProfile.campaigns.length +
    ecosystemProfile.audiences.length +
    ecosystemProfile.brands.length;

  const campaignMomentum = Math.min(
    100,
    ecosystemProfile.campaigns.length * 28 +
      ecosystemProfile.audiences.length * 14 +
      ecosystemProfile.products.length * 10
  );

  const audienceAffinity = Math.min(
    100,
    ecosystemProfile.audiences.length * 34 +
      ecosystemProfile.campaigns.length * 12
  );

  const ecosystemHealth = Math.min(
    100,
    ecosystemProfile.score +
      ecosystemProfile.companies.length * 4 +
      ecosystemProfile.products.length * 4
  );

  const signalDensityLabel =
    totalSignals >= 8
      ? "High-density ecosystem"
      : totalSignals >= 4
      ? "Developing ecosystem"
      : totalSignals > 0
      ? "Early signal ecosystem"
      : "No ecosystem signals";

  const strategicOpportunities = [
    ecosystemProfile.campaigns.length === 0
      ? "Add campaign signals to improve strategic momentum."
      : "Campaign layer is active and can support positioning analysis.",
    ecosystemProfile.audiences.length === 0
      ? "Audience coverage is weak. Add audience segments for better targeting intelligence."
      : "Audience layer is connected and supports targeting analysis.",
    ecosystemProfile.products.length === 0
      ? "Product-level coverage is missing. Add products to strengthen the ecosystem."
      : "Product signals improve ecosystem strength and brand context.",
  ];

  return (
    <aside className="min-h-[640px] overflow-y-auto rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_0_42px_rgba(34,211,238,0.08)] backdrop-blur-xl xl:min-h-[780px]">
      <div className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-300">
        {selectedNode.entityType} signal
      </div>

      <h2 className="mb-5 text-3xl font-black">{entity?.name || "Unknown"}</h2>

      <div className="mb-5">
  <button
    onClick={() =>
      window.open(
        `/entity-search?entity=${encodeURIComponent(
          entity?.name || ""
        )}`,
        "_blank"
      )
    }
    className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
  >
    Open Full Brand Intelligence →
  </button>
</div>

      <div className="mb-5 rounded-3xl border border-cyan-300/24 bg-cyan-500/8 p-5 shadow-[0_0_28px_rgba(34,211,238,0.08)]">
        <div className="mb-3 text-sm font-semibold text-cyan-200">
          Galaxy Intelligence Score
        </div>

        <div className="mb-2 text-6xl font-black text-white">
          {ecosystemProfile.score}
        </div>

        <div className="mb-4 text-sm text-gray-300">
          Signal density:
          <span className="ml-2 font-semibold text-cyan-200">
            {ecosystemProfile.intensity}
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-violet-400 transition-all duration-700"
            style={{ width: `${Math.min(100, ecosystemProfile.score)}%` }}
          />
        </div>

        <div className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-400">
          {signalDensityLabel}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3">
        <div className="rounded-3xl border border-white/10 bg-black/24 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-fuchsia-200">
              Campaign Momentum
            </div>
            <div className="text-sm font-black text-white">
              {campaignMomentum}
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-fuchsia-400 transition-all duration-700"
              style={{ width: `${campaignMomentum}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/24 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-amber-200">
              Audience Affinity
            </div>
            <div className="text-sm font-black text-white">
              {audienceAffinity}
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-300 transition-all duration-700"
              style={{ width: `${audienceAffinity}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/24 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-emerald-200">
              Ecosystem Health
            </div>
            <div className="text-sm font-black text-white">
              {ecosystemHealth}
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-300 transition-all duration-700"
              style={{ width: `${ecosystemHealth}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-3xl border border-white/10 bg-black/24 p-5 shadow-[0_0_24px_rgba(255,255,255,0.03)]">
        <div className="mb-3 text-sm font-semibold text-cyan-200">
          AI Strategic Galaxy Summary
        </div>

        <div className="text-sm leading-7 text-gray-200">{aiSummary}</div>
      </div>

    </aside>
  );
}

function SelectedEntityDeepDive({
  selectedNode,
  ecosystemProfile,
  relationships,
  nodeLookup,
  setSelectedDeepDiveItem,
}: any) {
  if (!selectedNode) return null;

  const strategicOpportunities = [
    ecosystemProfile.campaigns.length === 0
      ? "Add campaign signals to improve strategic momentum."
      : "Campaign layer is active and can support positioning analysis.",
    ecosystemProfile.audiences.length === 0
      ? "Audience coverage is weak. Add audience segments for better targeting intelligence."
      : "Audience layer is connected and supports targeting analysis.",
    ecosystemProfile.products.length === 0
      ? "Product-level coverage is missing. Add products to strengthen the ecosystem."
      : "Product signals improve ecosystem strength and brand context.",
  ];

  const openDeepDiveItem = (item: any) => {
  setSelectedDeepDiveItem(item);
};
  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_0_42px_rgba(34,211,238,0.08)] backdrop-blur-xl">
      <div className="mb-5">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-200">
          Full Relationship Intelligence
        </div>
        <h2 className="mt-2 text-3xl font-black text-white">
          {selectedNode.entity?.name || "Selected Entity"} Deep Dive
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-400">
          Detailed relationship, explainability, heatmap and ecosystem signals for the selected galaxy object.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RelationshipInsightPanel
            selectedNode={selectedNode}
            relationships={relationships}
            nodeLookup={nodeLookup}
          />
        </div>

        <div>
          <RelationshipHeatmap
            selectedNode={selectedNode}
            relationships={relationships}
            nodeLookup={nodeLookup}
          />
        </div>
      </div>

      <ExplainabilityLayer
        selectedNode={selectedNode}
        relationships={relationships}
        nodeLookup={nodeLookup}
      />

      <div className="mb-5 rounded-3xl border border-violet-300/20 bg-violet-500/8 p-5">
        <div className="mb-3 text-sm font-semibold text-violet-200">
          Strategic Opportunities
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {strategicOpportunities.map((opportunity) => (
            <div
              key={opportunity}
              className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-gray-300"
            >
              ✦ {opportunity}
            </div>
          ))}
        </div>
      </div>

      <CompetitiveOverlapPanel
  selectedNode={selectedNode}
  relationships={relationships}
  nodeLookup={nodeLookup}
  ecosystemProfile={ecosystemProfile}
/>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
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
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
  <MiniEntityList
    title="Company Planets"
    items={ecosystemProfile.companies}
    onSelect={openDeepDiveItem}
  />

  <MiniEntityList
    title="Product Moons"
    items={ecosystemProfile.products}
    onSelect={openDeepDiveItem}
  />

  <MiniEntityList
    title="Campaign Planets"
    items={ecosystemProfile.campaigns}
    onSelect={openDeepDiveItem}
  />

  <MiniEntityList
    title="Audience Planets"
    items={ecosystemProfile.audiences}
    onSelect={openDeepDiveItem}
  />

  <MiniEntityList
    title="Related Brand Stars"
    items={ecosystemProfile.brands}
    onSelect={openDeepDiveItem}
  />
</div>
    </section>
  );
}

export default function RelationshipExplorer() {
  const [selectedDeepDiveItem, setSelectedDeepDiveItem] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [nodeLookup, setNodeLookup] = useState<Record<string, any>>({});
  const [argusAds, setArgusAds] = useState<any[]>([]);
  const [argusGraphStatus, setArgusGraphStatus] = useState("Loading ARGUS live layer...");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [focusedBrandNodeId, setFocusedBrandNodeId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [questionQuery, setQuestionQuery] = useState("");
  const [intelligenceAnswer, setIntelligenceAnswer] =
    useState<IntelligenceAnswer | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [relationshipFilter, setRelationshipFilter] =
    useState<RelationshipFilter>("all");
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

      let argusItems: any[] = [];

      try {
        const argusResponse = await fetch("/api/argus/ads?limit=50", {
          cache: "no-store",
        });

        if (argusResponse.ok) {
          const argusData = await argusResponse.json();
          argusItems = argusData.items || [];
          setArgusAds(argusItems);
          setArgusGraphStatus(`ARGUS live layer active · ${argusItems.length} ads loaded`);
        } else {
          setArgusGraphStatus(`ARGUS live layer unavailable · ${argusResponse.status}`);
        }
      } catch (error) {
        console.error(error);
        setArgusGraphStatus("ARGUS live layer unavailable");
      }

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

      const mergedGraph = mergeArgusIntoGraph(
        graphNodes,
        relationshipsData || [],
        argusItems
      );

      const mergedLookup: Record<string, any> = {};

      mergedGraph.nodes.forEach((node: any) => {
        mergedLookup[node.data.nodeId] = node;
      });

      setNodes(mergedGraph.nodes);
      setRelationships(mergedGraph.relationships);
      setNodeLookup(mergedLookup);
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
        ) &&
        (relationshipFilter === "all" ||
          getRelationshipCategory(rel.relationship_type) === relationshipFilter)
      );
    }).length;
  }, [relationships, focusedBrandNodeId, relationshipFilter]);

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
          ) &&
          (relationshipFilter === "all" ||
            getRelationshipCategory(rel.relationship_type) === relationshipFilter)
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
    relationshipFilter,
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

      <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white sm:px-6 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(15,23,42,0.38),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-28 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10">
          <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-cyan-300/24 bg-cyan-500/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200 backdrop-blur-xl">
                Brand Galaxy Map
              </div>

              <h1 className="mb-3 text-5xl font-black tracking-tight text-white sm:text-6xl">
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

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            <button
              onClick={() => {
                setActiveScenarioId(null);
                setSelectedNode(null);
                setFocusedBrandNodeId(null);
                setIntelligenceAnswer(null);
              }}
              className={`rounded-3xl border p-5 text-left transition duration-300 hover:-translate-y-0.5 backdrop-blur-xl ${
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
                className={`rounded-3xl border p-5 text-left transition duration-300 hover:-translate-y-0.5 backdrop-blur-xl ${
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


          <div className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-500/10 p-5 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-cyan-200">
                  ARGUS Live Graph Layer
                </div>
                <div className="text-xs text-gray-500">
                  Live ARGUS ads are merged into the galaxy without duplicating existing brands.
                </div>
              </div>

              <div className="rounded-full border border-green-300/20 bg-green-500/10 px-3 py-1 text-xs text-green-100">
                {argusGraphStatus}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-3xl font-black text-cyan-100">
                  {argusAds.length}
                </div>
                <div className="mt-1 text-xs text-gray-400">Live ARGUS ads</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-3xl font-black text-fuchsia-100">
                  {nodes.filter((node) => node.data.liveArgus).length}
                </div>
                <div className="mt-1 text-xs text-gray-400">Live graph nodes</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-3xl font-black text-emerald-100">
                  {relationships.filter((rel: any) => rel.is_live_argus).length}
                </div>
                <div className="mt-1 text-xs text-gray-400">Live graph links</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-sm leading-6 text-gray-300">
                  Existing brands are reused. Example: ARGUS product
                  <span className="font-semibold text-white"> Wrangler</span>{" "}
                  attaches to existing
                  <span className="font-semibold text-white"> Jeep</span>.
                </div>
              </div>
            </div>
          </div>

          <CrossSectorIntelligence
            activeScenario={activeScenario}
            nodes={nodes}
            relationships={relationships}
          />

          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-cyan-200">
                  Relationship Filters
                </div>
                <div className="text-xs text-gray-500">
                  Filter the galaxy orbit by relationship type without changing the underlying data.
                </div>
              </div>

              <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Active: {relationshipFilter}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Signals" },
                { key: "competitors", label: "Competitors" },
                { key: "products", label: "Products" },
                { key: "campaigns", label: "Campaigns" },
                { key: "audiences", label: "Audiences" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setRelationshipFilter(filter.key as RelationshipFilter)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition duration-300 ${
                    relationshipFilter === filter.key
                      ? "border-cyan-300/40 bg-cyan-500/15 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.1)]"
                      : "border-white/10 bg-black/25 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
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
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-500/16 px-5 font-semibold text-cyan-100 transition duration-300 hover:bg-cyan-500/24 disabled:opacity-40"
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
                    className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-gray-300 transition duration-300 hover:border-cyan-300/40 hover:text-cyan-100"
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
                    className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/[0.07]"
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

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_440px]">
            <div className="relative h-[680px] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_0_45px_rgba(34,211,238,0.08)] sm:h-[900px] xl:h-[850px]">
              <div
                className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-64"
                style={{
                  backgroundImage: `url(${GALAXY_BACKGROUND})`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 z-0 bg-slate-950/26" />
              <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,rgba(2,6,23,0.18)_58%,rgba(2,6,23,0.62)_100%)]" />

              <GraphLegend />

              <ReactFlow
                minZoom={0.15}
                maxZoom={1.8}
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
  nodes={nodes}
  setSelectedNode={setSelectedNode}
/>
          </div>

          <SelectedEntityDeepDive
  selectedNode={selectedNode}
  ecosystemProfile={selectedEcosystemProfile}
  relationships={relationships}
  nodeLookup={nodeLookup}
  nodes={nodes}
  setSelectedNode={setSelectedNode}
  setSelectedDeepDiveItem={setSelectedDeepDiveItem}
/>
        </div>
</main>
{selectedDeepDiveItem && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
    <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-cyan-300/20 bg-slate-950 p-6 shadow-[0_0_60px_rgba(34,211,238,0.18)]">
      <div className="mb-3 text-xs uppercase tracking-[0.25em] text-cyan-300">
        {selectedDeepDiveItem.entityType === "coverage" ? "Coverage" : selectedDeepDiveItem.entityType} Intelligence
      </div>

      <h2 className="mb-4 text-3xl font-black text-white">
        {selectedDeepDiveItem.entity?.name || "Unknown"}
      </h2>

      <p className="mb-5 text-sm leading-7 text-gray-300">
        {selectedDeepDiveItem.entityType === "product" &&
          "This product is connected to the selected brand ecosystem and contributes to product-level intelligence."}

        {selectedDeepDiveItem.entityType === "campaign" &&
          "This campaign is connected to the selected brand and contributes to campaign momentum and advertising intelligence."}

        {selectedDeepDiveItem.entityType === "brand" &&
          "This related brand star shares ecosystem overlap with the selected brand."}

        {selectedDeepDiveItem.entityType === "audience" &&
          "This audience signal contributes to targeting, affinity and market context."}

        {selectedDeepDiveItem.entityType === "company" &&
          "This company signal represents ownership or strategic corporate relationship."}

        {selectedDeepDiveItem.entityType === "coverage" &&
          "This intelligence panel has no direct mapped signals yet, but it is fully clickable and ready to explain coverage, missing links and recommended enrichment."}
      </p>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4">
    <div className="text-xs uppercase tracking-[0.18em] text-cyan-200">
      Intelligence Role
    </div>
    <div className="mt-2 text-sm font-bold text-white">
      {selectedDeepDiveItem.entityType === "company" && "Ownership Anchor"}
      {selectedDeepDiveItem.entityType === "product" && "Product Signal"}
      {selectedDeepDiveItem.entityType === "campaign" && "Campaign Driver"}
      {selectedDeepDiveItem.entityType === "brand" && "Competitive Brand Star"}
      {selectedDeepDiveItem.entityType === "audience" && "Audience Context"}
      {selectedDeepDiveItem.entityType === "coverage" && "Coverage Gap"}
    </div>
  </div>

  <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-4">
    <div className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">
      Signal Strength
    </div>
    <div className="mt-2 text-sm font-bold text-white">
      {selectedDeepDiveItem.entityType === "coverage" ? "Ready" : selectedDeepDiveItem.entityType === "company" ? "High" : "Active"}
    </div>
  </div>

  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
    <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">
      Demo Value
    </div>
    <div className="mt-2 text-sm font-bold text-white">
      Explains graph context
    </div>
  </div>
</div>

<div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-5">
  <div className="mb-3 text-sm font-semibold text-cyan-200">
    Why this matters
  </div>

  <div className="text-sm leading-7 text-gray-300">
    {selectedDeepDiveItem.entityType === "company" &&
      `${selectedDeepDiveItem.entity?.name} acts as the corporate layer behind the selected brand ecosystem. It helps explain ownership, advertiser structure and strategic business context.`}

    {selectedDeepDiveItem.entityType === "product" &&
      `${selectedDeepDiveItem.entity?.name} is a product-level signal connected to the selected brand. Product signals help reveal what the brand is promoting, positioning or competing around.`}

    {selectedDeepDiveItem.entityType === "campaign" &&
      `${selectedDeepDiveItem.entity?.name} represents campaign activity connected to the selected brand. Campaign signals show current market messaging, promotion strategy and advertising momentum.`}

    {selectedDeepDiveItem.entityType === "brand" &&
      `${selectedDeepDiveItem.entity?.name} appears as a related brand star in the same ecosystem. This suggests possible competitive, category, audience or market overlap.`}

    {selectedDeepDiveItem.entityType === "audience" &&
      `${selectedDeepDiveItem.entity?.name} is an audience/context signal connected to the brand ecosystem. It supports targeting intelligence and audience affinity analysis.`}

    {selectedDeepDiveItem.entityType === "coverage" &&
      `${selectedDeepDiveItem.entity?.name} currently has no direct mapped records for this selected entity. This is useful during demo review because it clearly shows where additional campaigns, audiences, companies or brand relationships can be enriched next.`}
  </div>
</div>

<div className="mb-5 rounded-2xl border border-indigo-300/20 bg-indigo-500/10 p-5">
  <div className="mb-3 text-sm font-semibold text-indigo-200">
    Suggested analysis
  </div>

  <div className="space-y-2 text-sm text-gray-300">
    <div>✦ Compare this signal against related brands in the orbit.</div>
    <div>✦ Check whether it strengthens product, campaign or audience coverage.</div>
    <div>✦ Use it as supporting evidence in the final strategy explanation.</div>
  </div>
</div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase text-gray-500">Type</div>
          <div className="font-bold text-white">{selectedDeepDiveItem.entityType}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase text-gray-500">Source</div>
          <div className="font-bold text-white">
            {selectedDeepDiveItem.entity?.source || "Brand Galaxy"}
          </div>
        </div>
      </div>

      <button
        onClick={() => setSelectedDeepDiveItem(null)}
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