import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type RawAd = {
  id?: string;
  brand_name?: string;
  brand?: string;
  advertiser_name?: string;
  advertiser?: string;
  parent_company?: string;
  promotion_name?: string;
  campaign_name?: string;
  title?: string;
  products_text?: string;
  product?: string;
  product_name?: string;
  primary_category?: string;
  category?: string;
  subcategory?: string;
  iab_full_path?: string;
  iab_selected_category?: string;
  iab_tier_1?: string;
  iab_tier_2?: string;
  iab_tier_3?: string;
  confidence?: number;
  duration_ms?: number;
  duration?: number;
  duration_seconds?: number;
  risk_labels?: string[];
  source?: string;
  ingested_at?: string;
};

type BrandProfile = {
  canonicalName: string;
  logoEmoji: string;
  slogan: string;
  website: string;
  company: string;
  aliases: string[];
  category: string;
  history: string;
  subsidiaries: string[];
};

type EnrichedAd = RawAd & {
  canonical_brand: string;
  canonical_products: string[];
  canonical_campaign: string;
  brand_profile: BrandProfile;
  audiences: string[];
  competitors: string[];
  entity_key: string;
  source_system: string;
  intelligence_quality: {
    hasBrand: boolean;
    hasProducts: boolean;
    hasCampaign: boolean;
    hasIab: boolean;
    confidenceLabel: "High" | "Medium" | "Low" | "Unknown";
  };
};

const BRAND_REGISTRY: Record<string, BrandProfile> = {
  jeep: {
    canonicalName: "Jeep",
    logoEmoji: "🚙",
    slogan: "Go Anywhere. Do Anything.",
    website: "https://www.jeep.com",
    company: "Stellantis",
    aliases: ["JEEP", "Jeep®", "Jeep Wrangler", "Wrangler by Jeep"],
    category: "Automotive",
    history:
      "Jeep is an automotive brand associated with SUVs, off-road vehicles and adventure positioning. It is part of Stellantis.",
    subsidiaries: [],
  },
  bmw: {
    canonicalName: "BMW",
    logoEmoji: "🚘",
    slogan: "The Ultimate Driving Machine",
    website: "https://www.bmw.com",
    company: "BMW Group",
    aliases: ["Bayerische Motoren Werke", "BMW Group"],
    category: "Automotive",
    history:
      "BMW is a premium automotive brand focused on performance, luxury and technology-led mobility.",
    subsidiaries: ["MINI", "Rolls-Royce Motor Cars"],
  },
  ford: {
    canonicalName: "Ford",
    logoEmoji: "🛻",
    slogan: "Built Ford Tough",
    website: "https://www.ford.com",
    company: "Ford Motor Company",
    aliases: ["Ford Motor", "Ford Motor Company"],
    category: "Automotive",
    history:
      "Ford is a mass-market automotive brand with strong pickup, SUV and performance vehicle positioning.",
    subsidiaries: ["Lincoln"],
  },
  netflix: {
    canonicalName: "Netflix",
    logoEmoji: "🎬",
    slogan: "Watch anywhere. Cancel anytime.",
    website: "https://www.netflix.com",
    company: "Netflix",
    aliases: ["Netflix Premium", "Netflix Mobile"],
    category: "Streaming",
    history:
      "Netflix is a global streaming entertainment platform focused on subscription video and original content.",
    subsidiaries: [],
  },
  spotify: {
    canonicalName: "Spotify",
    logoEmoji: "🎧",
    slogan: "Music for everyone",
    website: "https://www.spotify.com",
    company: "Spotify",
    aliases: ["Spotify Premium", "Spotify Audiobooks"],
    category: "Streaming",
    history:
      "Spotify is an audio streaming platform focused on music, podcasts and audiobooks.",
    subsidiaries: [],
  },
  mcdonalds: {
    canonicalName: "McDonald's",
    logoEmoji: "🍟",
    slogan: "I'm lovin' it",
    website: "https://www.mcdonalds.com",
    company: "McDonald's",
    aliases: ["McDonalds", "McDonald's Restaurants", "McD"],
    category: "Fast Food",
    history:
      "McDonald's is a global quick-service restaurant brand with burger, fries, breakfast and value-led campaigns.",
    subsidiaries: [],
  },
  burgerking: {
    canonicalName: "Burger King",
    logoEmoji: "🍔",
    slogan: "Have it your way",
    website: "https://www.bk.com",
    company: "Restaurant Brands International",
    aliases: ["BK", "Burger King Restaurants"],
    category: "Fast Food",
    history:
      "Burger King is a quick-service restaurant brand known for flame-grilled burger positioning.",
    subsidiaries: [],
  },
  nike: {
    canonicalName: "Nike",
    logoEmoji: "👟",
    slogan: "Just Do It",
    website: "https://www.nike.com",
    company: "Nike",
    aliases: ["Nike Inc", "Nike Air"],
    category: "Fashion",
    history:
      "Nike is a sportswear and footwear brand focused on performance, culture and athlete-led campaigns.",
    subsidiaries: ["Jordan"],
  },
  adidas: {
    canonicalName: "Adidas",
    logoEmoji: "🏃",
    slogan: "Impossible Is Nothing",
    website: "https://www.adidas.com",
    company: "Adidas",
    aliases: ["adidas", "Adidas Originals"],
    category: "Fashion",
    history:
      "Adidas is a global sportswear brand focused on footwear, apparel and sports culture.",
    subsidiaries: [],
  },
  apple: {
    canonicalName: "Apple",
    logoEmoji: "📱",
    slogan: "Think different",
    website: "https://www.apple.com",
    company: "Apple",
    aliases: ["Apple Inc", "iPhone", "MacBook"],
    category: "Technology",
    history:
      "Apple is a consumer technology brand focused on hardware, software, services and premium ecosystem positioning.",
    subsidiaries: ["Beats"],
  },
  samsung: {
    canonicalName: "Samsung",
    logoEmoji: "📲",
    slogan: "Do What You Can't",
    website: "https://www.samsung.com",
    company: "Samsung",
    aliases: ["Samsung Galaxy", "Galaxy AI"],
    category: "Technology",
    history:
      "Samsung is a technology brand focused on mobile devices, consumer electronics and connected ecosystems.",
    subsidiaries: [],
  },
  libertymutual: {
    canonicalName: "Liberty Mutual",
    logoEmoji: "🗽",
    slogan: "Only pay for what you need",
    website: "https://www.libertymutual.com",
    company: "Liberty Mutual Insurance",
    aliases: ["Liberty Mutual Insurance", "Liberty Mutual"],
    category: "Insurance",
    history:
      "Liberty Mutual is an insurance brand focused on auto, home and personal insurance advertising.",
    subsidiaries: [],
  },
  progressive: {
    canonicalName: "Progressive",
    logoEmoji: "🛡️",
    slogan: "Name your price",
    website: "https://www.progressive.com",
    company: "Progressive",
    aliases: ["Progressive Insurance", "Progressive Casualty"],
    category: "Insurance",
    history:
      "Progressive is an insurance brand focused on auto, home and direct-response insurance advertising.",
    subsidiaries: [],
  },
};

const CATEGORY_TO_IAB: Record<string, { path: string; tier1: string; tier2?: string }> = {
  automotive: { path: "Automotive", tier1: "Automotive" },
  suv: { path: "Automotive → SUVs", tier1: "Automotive", tier2: "SUVs" },
  trucks: { path: "Automotive → Trucks", tier1: "Automotive", tier2: "Trucks" },
  "electric vehicles": {
    path: "Automotive → Electric Vehicles",
    tier1: "Automotive",
    tier2: "Electric Vehicles",
  },
  streaming: {
    path: "Entertainment → Streaming",
    tier1: "Entertainment",
    tier2: "Streaming",
  },
  entertainment: {
    path: "Entertainment → Streaming",
    tier1: "Entertainment",
    tier2: "Streaming",
  },
  "fast food": {
    path: "Food & Drink → Fast Food",
    tier1: "Food & Drink",
    tier2: "Fast Food",
  },
  restaurants: {
    path: "Food & Drink → Restaurants",
    tier1: "Food & Drink",
    tier2: "Restaurants",
  },
  fashion: { path: "Fashion → Sportswear", tier1: "Fashion", tier2: "Sportswear" },
  sportswear: { path: "Fashion → Sportswear", tier1: "Fashion", tier2: "Sportswear" },
  technology: {
    path: "Technology → Consumer Electronics",
    tier1: "Technology",
    tier2: "Consumer Electronics",
  },
  insurance: {
    path: "Finance → Insurance",
    tier1: "Finance",
    tier2: "Insurance",
  },
};

const COMPETITOR_GROUPS = [
  ["Jeep", "BMW", "Ford"],
  ["Netflix", "Spotify"],
  ["McDonald's", "Burger King"],
  ["Nike", "Adidas"],
  ["Apple", "Samsung"],
  ["Liberty Mutual", "Progressive"],
];

const fallbackItems: RawAd[] = [
  {
    id: "jeep-1",
    brand_name: "Jeep",
    advertiser_name: "Stellantis",
    promotion_name: "Wrangler Go Anywhere Campaign",
    products_text: "Wrangler, Grand Cherokee, Gladiator",
    primary_category: "Automotive",
    subcategory: "SUV",
    iab_full_path: "Automotive → SUVs",
    iab_tier_1: "Automotive",
    confidence: 0.91,
    duration_ms: 30000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "bmw-1",
    brand_name: "BMW",
    advertiser_name: "BMW Group",
    promotion_name: "Ultimate Electric Driving",
    products_text: "i4, iX, M3",
    primary_category: "Automotive",
    subcategory: "Electric Vehicles",
    iab_full_path: "Automotive → Electric Vehicles",
    iab_tier_1: "Automotive",
    confidence: 0.94,
    duration_ms: 30000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "ford-1",
    brand_name: "Ford",
    advertiser_name: "Ford Motor Company",
    promotion_name: "Built Ford Tough",
    products_text: "F-150, Bronco, Mustang",
    primary_category: "Automotive",
    subcategory: "Trucks",
    iab_full_path: "Automotive → Trucks",
    iab_tier_1: "Automotive",
    confidence: 0.89,
    duration_ms: 30000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "netflix-1",
    brand_name: "Netflix",
    advertiser_name: "Netflix",
    promotion_name: "Watch Anywhere",
    products_text: "Netflix Premium, Netflix Mobile",
    primary_category: "Streaming",
    subcategory: "Entertainment",
    iab_full_path: "Entertainment → Streaming",
    iab_tier_1: "Entertainment",
    confidence: 0.96,
    duration_ms: 15000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "spotify-1",
    brand_name: "Spotify",
    advertiser_name: "Spotify",
    promotion_name: "Music For Every Mood",
    products_text: "Spotify Premium, Audiobooks",
    primary_category: "Streaming",
    subcategory: "Music Streaming",
    iab_full_path: "Entertainment → Audio Streaming",
    iab_tier_1: "Entertainment",
    confidence: 0.92,
    duration_ms: 20000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "mcd-1",
    brand_name: "McDonald's",
    advertiser_name: "McDonald's",
    promotion_name: "Late Night Cravings",
    products_text: "Big Mac, McFlurry, Chicken McNuggets",
    primary_category: "Fast Food",
    subcategory: "Restaurants",
    iab_full_path: "Food & Drink → Fast Food",
    iab_tier_1: "Food & Drink",
    confidence: 0.95,
    duration_ms: 30000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "burgerking-1",
    brand_name: "Burger King",
    advertiser_name: "Restaurant Brands International",
    promotion_name: "Flame Grilled Deals",
    products_text: "Whopper, Chicken Fries",
    primary_category: "Fast Food",
    subcategory: "Restaurants",
    iab_full_path: "Food & Drink → Fast Food",
    iab_tier_1: "Food & Drink",
    confidence: 0.91,
    duration_ms: 30000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "nike-1",
    brand_name: "Nike",
    advertiser_name: "Nike",
    promotion_name: "Run The Future",
    products_text: "Air Max, Pegasus, Vaporfly",
    primary_category: "Fashion",
    subcategory: "Sportswear",
    iab_full_path: "Fashion → Sportswear",
    iab_tier_1: "Fashion",
    confidence: 0.9,
    duration_ms: 30000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "adidas-1",
    brand_name: "Adidas",
    advertiser_name: "Adidas",
    promotion_name: "Impossible Is Nothing",
    products_text: "Ultraboost, Samba",
    primary_category: "Fashion",
    subcategory: "Sportswear",
    iab_full_path: "Fashion → Sportswear",
    iab_tier_1: "Fashion",
    confidence: 0.89,
    duration_ms: 30000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "apple-1",
    brand_name: "Apple",
    advertiser_name: "Apple",
    promotion_name: "Shot on iPhone",
    products_text: "iPhone 16 Pro, MacBook Air",
    primary_category: "Technology",
    subcategory: "Consumer Electronics",
    iab_full_path: "Technology → Consumer Electronics",
    iab_tier_1: "Technology",
    confidence: 0.97,
    duration_ms: 30000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "samsung-1",
    brand_name: "Samsung",
    advertiser_name: "Samsung",
    promotion_name: "Galaxy AI",
    products_text: "Galaxy S25, Galaxy Fold",
    primary_category: "Technology",
    subcategory: "Mobile Devices",
    iab_full_path: "Technology → Mobile Devices",
    iab_tier_1: "Technology",
    confidence: 0.94,
    duration_ms: 30000,
    risk_labels: [],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "liberty-mutual-1",
    brand_name: "Liberty Mutual Insurance",
    advertiser_name: "Liberty Mutual",
    promotion_name: "Only Pay For What You Need",
    products_text: "Auto Insurance, Home Insurance",
    primary_category: "Insurance",
    subcategory: "Direct Response",
    iab_full_path: "Finance → Insurance",
    iab_tier_1: "Finance",
    confidence: 0.93,
    duration_ms: 30000,
    risk_labels: ["Direct response"],
    source: "Fallback Intelligence Dataset",
  },
  {
    id: "progressive-1",
    brand_name: "Progressive Insurance",
    advertiser_name: "Progressive",
    promotion_name: "Compare And Save",
    products_text: "Auto Insurance, Home Insurance, Bundle Insurance",
    primary_category: "Insurance",
    subcategory: "Direct Response",
    iab_full_path: "Finance → Insurance",
    iab_tier_1: "Finance",
    confidence: 0.92,
    duration_ms: 30000,
    risk_labels: ["Direct response"],
    source: "Fallback Intelligence Dataset",
  },
];

function normalizeKey(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[’'®™]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function titleCase(value: string) {
  return (value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getBrandProfile(rawBrand: string, advertiser?: string): BrandProfile {
  const candidate = rawBrand || advertiser || "Unknown Brand";
  const candidateKey = normalizeKey(candidate);

  const directMatch = BRAND_REGISTRY[candidateKey];

  if (directMatch) return directMatch;

  const aliasMatch = Object.values(BRAND_REGISTRY).find((profile) =>
    profile.aliases.some((alias) => normalizeKey(alias) === candidateKey)
  );

  if (aliasMatch) return aliasMatch;

  const partialMatch = Object.values(BRAND_REGISTRY).find((profile) => {
    const canonicalKey = normalizeKey(profile.canonicalName);
    return (
      candidateKey.includes(canonicalKey) ||
      canonicalKey.includes(candidateKey)
    );
  });

  if (partialMatch) return partialMatch;

  const fallbackName = titleCase(candidate);

  return {
    canonicalName: fallbackName,
    logoEmoji: "🪐",
    slogan: "Brand intelligence pending",
    website: "",
    company: advertiser || fallbackName,
    aliases: [candidate].filter(Boolean),
    category: "Unclassified",
    history:
      "Brand profile is not enriched yet. This entity was detected from the incoming advertising dataset.",
    subsidiaries: [],
  };
}

function splitProducts(value: string, brandName: string) {
  const brandKey = normalizeKey(brandName);

  return (value || "")
    .split(/[,|;/]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((product) => {
      const words = product
        .replace(/[®™]/g, "")
        .replace(new RegExp(`^${brandName}\\s+`, "i"), "")
        .trim();

      const productKey = normalizeKey(words);

      if (brandKey && productKey.startsWith(brandKey)) {
        return words.replace(new RegExp(`^${brandName}`, "i"), "").trim();
      }

      return words;
    })
    .filter(Boolean);
}

function inferIab(ad: RawAd, profile: BrandProfile) {
  if (ad.iab_full_path || ad.iab_tier_1) {
    return {
      iab_full_path: ad.iab_full_path || ad.iab_tier_1,
      iab_tier_1: ad.iab_tier_1 || ad.iab_full_path?.split("→")[0]?.trim(),
      iab_tier_2: ad.iab_tier_2,
      iab_tier_3: ad.iab_tier_3,
    };
  }

  const candidates = [
    ad.primary_category,
    ad.category,
    ad.subcategory,
    profile.category,
  ]
    .filter(Boolean)
    .map((item) => normalizeKey(String(item)));

  const matchedKey = Object.keys(CATEGORY_TO_IAB).find((key) =>
    candidates.some((candidate) => candidate.includes(normalizeKey(key)))
  );

  if (!matchedKey) {
    return {
      iab_full_path: "Unclassified / pending IAB mapping",
      iab_tier_1: "Unclassified",
      iab_tier_2: undefined,
      iab_tier_3: undefined,
    };
  }

  const mapped = CATEGORY_TO_IAB[matchedKey];

  return {
    iab_full_path: mapped.path,
    iab_tier_1: mapped.tier1,
    iab_tier_2: mapped.tier2,
    iab_tier_3: undefined,
  };
}

function inferAudiences(ad: RawAd, profile: BrandProfile) {
  const category = normalizeKey(
    [ad.primary_category, ad.subcategory, profile.category].filter(Boolean).join(" ")
  );

  const audiences = new Set<string>();

  if (category.includes("automotive") || category.includes("suv") || category.includes("truck")) {
    audiences.add("Auto Intenders");
    audiences.add("Adventure / Utility Buyers");
  }

  if (category.includes("electric")) {
    audiences.add("EV Consideration Audience");
  }

  if (category.includes("streaming") || category.includes("entertainment")) {
    audiences.add("Streaming Entertainment Audience");
    audiences.add("Cord-Cutter Audience");
  }

  if (category.includes("food") || category.includes("restaurant") || category.includes("fastfood")) {
    audiences.add("Family Dining Audience");
    audiences.add("Value Meal Audience");
  }

  if (category.includes("fashion") || category.includes("sportswear")) {
    audiences.add("Sportswear Lifestyle Audience");
    audiences.add("Gen Z Fashion Audience");
  }

  if (category.includes("technology") || category.includes("mobile")) {
    audiences.add("Tech Enthusiast Audience");
    audiences.add("Premium Device Audience");
  }

  if (category.includes("insurance") || category.includes("finance")) {
    audiences.add("Insurance Shoppers");
    audiences.add("Direct Response Audience");
  }

  if (audiences.size === 0) {
    audiences.add("General Advertising Audience");
  }

  return Array.from(audiences);
}

function inferCompetitors(brand: string) {
  const group = COMPETITOR_GROUPS.find((items) => items.includes(brand));
  return group ? group.filter((item) => item !== brand) : [];
}

function getConfidenceLabel(confidence?: number): "High" | "Medium" | "Low" | "Unknown" {
  if (typeof confidence !== "number") return "Unknown";
  if (confidence >= 0.85) return "High";
  if (confidence >= 0.65) return "Medium";
  return "Low";
}

function enrichAd(ad: RawAd, sourceSystem = "ARGUS Public API"): EnrichedAd {
  const profile = getBrandProfile(
    ad.brand_name || ad.brand || "",
    ad.advertiser_name || ad.advertiser || ""
  );

  const iab = inferIab(ad, profile);
  const canonicalProducts = splitProducts(
    ad.products_text || ad.product || ad.product_name || "",
    profile.canonicalName
  );

  const canonicalCampaign =
    ad.promotion_name ||
    ad.campaign_name ||
    ad.title ||
    `${profile.canonicalName} Advertising Signal`;

  const enriched: EnrichedAd = {
    ...ad,
    brand_name: profile.canonicalName,
    advertiser_name:
      ad.advertiser_name || ad.advertiser || profile.company || profile.canonicalName,
    promotion_name: canonicalCampaign,
    products_text: canonicalProducts.join(", "),
    primary_category: ad.primary_category || profile.category,
    iab_full_path: iab.iab_full_path,
    iab_tier_1: iab.iab_tier_1,
    iab_tier_2: iab.iab_tier_2,
    iab_tier_3: iab.iab_tier_3,
    canonical_brand: profile.canonicalName,
    canonical_products: canonicalProducts,
    canonical_campaign: canonicalCampaign,
    brand_profile: profile,
    audiences: inferAudiences(ad, profile),
    competitors: inferCompetitors(profile.canonicalName),
    entity_key: `${normalizeKey(profile.canonicalName)}:${normalizeKey(canonicalCampaign)}`,
    source_system: sourceSystem,
    intelligence_quality: {
      hasBrand: Boolean(profile.canonicalName),
      hasProducts: canonicalProducts.length > 0,
      hasCampaign: Boolean(canonicalCampaign),
      hasIab:
        Boolean(iab.iab_full_path) &&
        !String(iab.iab_full_path).includes("Unclassified"),
      confidenceLabel: getConfidenceLabel(ad.confidence),
    },
  };

  return enriched;
}

function dedupeAds(items: RawAd[]) {
  const map = new Map<string, EnrichedAd>();

  items.forEach((item) => {
    const sourceSystem = item.source || "ARGUS Public API";
    const enriched = enrichAd(item, sourceSystem);
    const productKey = enriched.canonical_products
      .map((product) => normalizeKey(product))
      .join("-");
    const key = `${normalizeKey(enriched.canonical_brand)}:${normalizeKey(
      enriched.canonical_campaign
    )}:${productKey}`;

    const existing = map.get(key);

    if (!existing) {
      map.set(key, enriched);
      return;
    }

    map.set(key, {
      ...existing,
      confidence: Math.max(existing.confidence || 0, enriched.confidence || 0),
      risk_labels: Array.from(
        new Set([...(existing.risk_labels || []), ...(enriched.risk_labels || [])])
      ),
      audiences: Array.from(new Set([...existing.audiences, ...enriched.audiences])),
      competitors: Array.from(
        new Set([...existing.competitors, ...enriched.competitors])
      ),
    });
  });

  return Array.from(map.values());
}

function buildStats(items: EnrichedAd[]) {
  const byBrand = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const riskLabels = new Set<string>();

  items.forEach((item) => {
    byBrand.set(item.canonical_brand, (byBrand.get(item.canonical_brand) || 0) + 1);

    const category =
      item.primary_category || item.iab_tier_1 || item.brand_profile.category || "Unclassified";

    byCategory.set(category, (byCategory.get(category) || 0) + 1);

    (item.risk_labels || []).forEach((label) => riskLabels.add(label));
  });

  const sortCounts = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

  return {
    total_ads: items.length,
    by_brand: sortCounts(byBrand),
    by_category: sortCounts(byCategory),
    risk_labels: Array.from(riskLabels).sort(),
  };
}

function applyFilters(items: EnrichedAd[], request: Request) {
  const { searchParams } = new URL(request.url);

  const limit = Number(searchParams.get("limit") || "20");
  const offset = Number(searchParams.get("offset") || "0");
  const brand = searchParams.get("brand");
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const filtered = items.filter((item) => {
    const haystack = [
      item.canonical_brand,
      item.advertiser_name,
      item.canonical_campaign,
      item.products_text,
      item.primary_category,
      item.subcategory,
      item.iab_full_path,
      item.audiences.join(" "),
      item.competitors.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (brand && normalizeKey(item.canonical_brand) !== normalizeKey(brand)) {
      return false;
    }

    if (
      category &&
      !normalizeKey(
        `${item.primary_category || ""} ${item.subcategory || ""} ${
          item.iab_full_path || ""
        }`
      ).includes(normalizeKey(category))
    ) {
      return false;
    }

    if (q && !haystack.includes(q.toLowerCase())) {
      return false;
    }

    return true;
  });

  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}

async function fetchArgusItems(request: Request): Promise<RawAd[]> {
  const apiKey = process.env.ARGUS_API_KEY;
  const baseUrl = process.env.ARGUS_API_BASE || "https://argus.rest/api/public";

  if (!apiKey) {
    throw new Error("Missing ARGUS_API_KEY");
  }

  const { searchParams } = new URL(request.url);

  const url = new URL(`${baseUrl}/ads`);
  url.searchParams.set("limit", searchParams.get("limit") || "50");
  url.searchParams.set("offset", searchParams.get("offset") || "0");

  const brand = searchParams.get("brand");
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  if (brand) url.searchParams.set("brand", brand);
  if (category) url.searchParams.set("category", category);
  if (q) url.searchParams.set("q", q);

  const response = await fetch(url.toString(), {
    headers: {
      "X-API-Key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ARGUS API request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.items || [];
}


async function fetchImportedItems(request: Request): Promise<RawAd[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return [];
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || "50");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const [
      campaignsResult,
      brandsResult,
      productsResult,
      audiencesResult,
      companiesResult,
      relationshipsResult,
    ] = await Promise.all([
      supabase.from("campaigns").select("*").limit(Math.max(limit, 50)),
      supabase.from("brands").select("*").limit(500),
      supabase.from("products").select("*").limit(500),
      supabase.from("audiences").select("*").limit(500),
      supabase.from("companies").select("*").limit(500),
      supabase.from("entity_relationships").select("*").limit(2000),
    ]);

    if (campaignsResult.error || relationshipsResult.error) {
      return [];
    }

    const campaigns = campaignsResult.data || [];
    const brands = brandsResult.data || [];
    const products = productsResult.data || [];
    const audiences = audiencesResult.data || [];
    const companies = companiesResult.data || [];
    const relationships = relationshipsResult.data || [];

    const brandById = new Map(brands.map((item: any) => [String(item.id), item]));
    const productById = new Map(products.map((item: any) => [String(item.id), item]));
    const audienceById = new Map(audiences.map((item: any) => [String(item.id), item]));
    const companyById = new Map(companies.map((item: any) => [String(item.id), item]));

    function findBrandForCampaign(campaignId: string) {
      const rel = relationships.find(
        (item: any) =>
          item.relationship_type === "runs_campaign" &&
          item.source_type === "brand" &&
          item.target_type === "campaign" &&
          String(item.target_id) === campaignId
      );

      return rel ? brandById.get(String(rel.source_id)) : null;
    }

    function findCompanyForBrand(brandId?: string) {
      if (!brandId) return null;

      const rel = relationships.find(
        (item: any) =>
          item.relationship_type === "owned_by" &&
          item.source_type === "brand" &&
          item.target_type === "company" &&
          String(item.source_id) === brandId
      );

      return rel ? companyById.get(String(rel.target_id)) : null;
    }

    function findProductsForCampaign(campaignId: string, brandId?: string) {
      const campaignProductIds = relationships
        .filter(
          (item: any) =>
            item.relationship_type === "promotes" &&
            item.source_type === "campaign" &&
            item.target_type === "product" &&
            String(item.source_id) === campaignId
        )
        .map((item: any) => String(item.target_id));

      const brandProductIds = brandId
        ? relationships
            .filter(
              (item: any) =>
                item.relationship_type === "has_product" &&
                item.source_type === "brand" &&
                item.target_type === "product" &&
                String(item.source_id) === brandId
            )
            .map((item: any) => String(item.target_id))
        : [];

      return Array.from(new Set([...campaignProductIds, ...brandProductIds]))
        .map((id) => productById.get(id))
        .filter(Boolean);
    }

    function findAudiencesForCampaign(campaignId: string, brandId?: string) {
      const campaignAudienceIds = relationships
        .filter(
          (item: any) =>
            item.relationship_type === "targets" &&
            item.source_type === "campaign" &&
            item.target_type === "audience" &&
            String(item.source_id) === campaignId
        )
        .map((item: any) => String(item.target_id));

      const brandAudienceIds = brandId
        ? relationships
            .filter(
              (item: any) =>
                item.relationship_type === "targets" &&
                item.source_type === "brand" &&
                item.target_type === "audience" &&
                String(item.source_id) === brandId
            )
            .map((item: any) => String(item.target_id))
        : [];

      return Array.from(new Set([...campaignAudienceIds, ...brandAudienceIds]))
        .map((id) => audienceById.get(id))
        .filter(Boolean);
    }

    return campaigns.map((campaign: any) => {
      const campaignId = String(campaign.id);
      const brand = findBrandForCampaign(campaignId);
      const brandId = brand?.id ? String(brand.id) : undefined;
      const company = findCompanyForBrand(brandId);
      const linkedProducts = findProductsForCampaign(campaignId, brandId);
      const linkedAudiences = findAudiencesForCampaign(campaignId, brandId);

      const primaryCategory =
        brand?.iab_tier_1 ||
        linkedProducts[0]?.category ||
        linkedProducts[0]?.product_type ||
        campaign.objective ||
        "Imported Intelligence";

      const iabFullPath = [brand?.iab_tier_1, brand?.iab_tier_2, brand?.iab_tier_3]
        .filter(Boolean)
        .join(" → ");

      return {
        id: `csv-${campaignId}`,
        brand_name: brand?.name || campaign.name || "Imported Brand",
        advertiser_name: company?.name || brand?.ownership || brand?.name || "Imported Company",
        parent_company: company?.name || undefined,
        promotion_name: campaign.name || "Imported Campaign Signal",
        campaign_name: campaign.name || "Imported Campaign Signal",
        title: campaign.name || "Imported Campaign Signal",
        products_text: linkedProducts.map((item: any) => item.name).join(", "),
        primary_category: primaryCategory,
        category: primaryCategory,
        subcategory: linkedProducts[0]?.product_type || undefined,
        iab_full_path: iabFullPath || brand?.iab_tier_1 || "Imported Intelligence",
        iab_tier_1: brand?.iab_tier_1 || primaryCategory,
        iab_tier_2: brand?.iab_tier_2 || undefined,
        iab_tier_3: brand?.iab_tier_3 || undefined,
        confidence: 0.86,
        duration_ms: 30000,
        risk_labels: ["CSV import", "Nielsen/H-Tech signal"],
        source: "Supabase CSV Import",
        ingested_at: campaign.created_at || new Date().toISOString(),
        product: linkedProducts.map((item: any) => item.name).join(", "),
        product_name: linkedProducts[0]?.name || undefined,
        audiences: linkedAudiences.map((item: any) => item.name),
      } as RawAd;
    });
  } catch (error) {
    console.error("Imported monitoring signals unavailable", error);
    return [];
  }
}

export async function GET(request: Request) {
  const importedItems = await fetchImportedItems(request);

  try {
    const argusItems = await fetchArgusItems(request);
    const enrichedItems = dedupeAds([...argusItems, ...importedItems]);
    const filtered = applyFilters(enrichedItems, request);

    return NextResponse.json({
      ...filtered,
      stats: buildStats(enrichedItems),
      source: "ARGUS Public API + Supabase CSV Imports",
      fallback: false,
      importedCount: importedItems.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    const fallbackEnriched = dedupeAds([...fallbackItems, ...importedItems]);
    const filtered = applyFilters(fallbackEnriched, request);

    return NextResponse.json({
      ...filtered,
      stats: buildStats(fallbackEnriched),
      source: "Fallback Intelligence Dataset + Supabase CSV Imports",
      fallback: true,
      importedCount: importedItems.length,
      upstreamError:
        error?.message || "ARGUS API unavailable. Showing fallback monitoring data.",
      generatedAt: new Date().toISOString(),
    });
  }
}
