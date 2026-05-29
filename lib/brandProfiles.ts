"use client";

export type BrandProfileInput = {
  name?: string;
  description?: string;
  website?: string;
  slogan?: string;
  company?: string;
  owner?: string;
  ownership?: string;
  aliases?: string[];
  subsidiaries?: string[];
  products?: string[];
  campaigns?: string[];
  audiences?: string[];
  iabFootprint?: string[];
  categories?: string[];
  sources?: string[];
  riskLabels?: string[];
  signals?: any[];
  logoEmoji?: string;
  country?: string;
  industry?: string;
  iab_tier_1?: string;
  iab_tier_2?: string;
  iab_tier_3?: string;
  iab_full_path?: string;
};

export type BrandIntelligenceProfile = {
  name: string;
  logoEmoji: string;
  slogan: string;
  website: string;
  company: string;
  aliases: string[];
  subsidiaries: string[];
  products: string[];
  campaigns: string[];
  audiences: string[];
  iabFootprint: string[];
  categories: string[];
  sources: string[];
  riskLabels: string[];
  signals: any[];
  signalCount: number;
  classifiedCount: number;
  history: string;
  ownership: string;
};

export function normalizeBrandKey(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[®™©]/g, "")
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/\b(the|brand|company|inc|llc|ltd|corp|corporation|group)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function dedupeText(values: any[]) {
  return Array.from(
    new Set(
      values
        .flat()
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  );
}

export const BRAND_PROFILE_REGISTRY: Record<string, Partial<BrandIntelligenceProfile>> = {
  jeep: {
    name: "Jeep",
    logoEmoji: "🚙",
    slogan: "Go Anywhere. Do Anything.",
    website: "https://www.jeep.com",
    company: "Stellantis",
    ownership: "Jeep is part of Stellantis. Historically, the brand moved through Willys-Overland, Kaiser Jeep, AMC, Chrysler, FCA and then Stellantis.",
    aliases: ["Jeep", "Jeep Brand", "Stellantis Jeep"],
    subsidiaries: ["Wrangler", "Grand Cherokee", "Gladiator", "Cherokee"],
    history: "Jeep is an American SUV and off-road vehicle brand known for utility, adventure and four-wheel-drive positioning. Its current commercial ecosystem is strongly tied to SUV product families and adventure-led campaigns.",
  },
  carshield: {
    name: "Car Shield",
    logoEmoji: "🛡️",
    slogan: "Protect your vehicle budget.",
    website: "https://carshield.com",
    company: "CarShield",
    ownership: "Ownership and corporate structure should be verified before external reporting.",
    aliases: ["CarShield", "Car Shield", "CarShield.com"],
    subsidiaries: [],
    history: "CarShield is tracked here as an automotive services advertiser. Imported monitoring signals commonly map it to vehicle protection and direct response advertising.",
  },
  libertymutual: {
    name: "Liberty Mutual",
    logoEmoji: "🗽",
    slogan: "Only pay for what you need.",
    website: "https://www.libertymutual.com",
    company: "Liberty Mutual Insurance",
    ownership: "Liberty Mutual is a mutual insurance group. Detailed subsidiary and ownership history should be verified for formal reporting.",
    aliases: ["Liberty Mutual", "Liberty Mutual Insurance"],
    subsidiaries: ["Safeco"],
    history: "Liberty Mutual is a major insurance advertiser with strong direct-response and brand-building campaign activity.",
  },
  progressive: {
    name: "Progressive",
    logoEmoji: "🏷️",
    slogan: "Name your price.",
    website: "https://www.progressive.com",
    company: "Progressive Corporation",
    ownership: "Progressive operates as The Progressive Corporation. Subsidiaries and underwriting entities should be verified before external reporting.",
    aliases: ["Progressive", "Progressive Insurance"],
    subsidiaries: [],
    history: "Progressive is an insurance advertiser known for recurring creative characters and high-frequency campaign activity.",
  },
  netflix: {
    name: "Netflix",
    logoEmoji: "🎬",
    slogan: "See what's next.",
    website: "https://www.netflix.com",
    company: "Netflix, Inc.",
    ownership: "Netflix is operated by Netflix, Inc.",
    aliases: ["Netflix"],
    subsidiaries: [],
    history: "Netflix is a streaming entertainment brand. In the platform, it anchors streaming-category audience and campaign analysis.",
  },
  youtube: {
    name: "YouTube",
    logoEmoji: "▶️",
    slogan: "Broadcast yourself.",
    website: "https://www.youtube.com",
    company: "Google / Alphabet",
    ownership: "YouTube is owned by Google, which is part of Alphabet.",
    aliases: ["YouTube", "Google YouTube"],
    subsidiaries: ["YouTube Music", "YouTube TV"],
    history: "YouTube is a video and streaming platform used here as a streaming/media ecosystem brand.",
  },
  spotify: {
    name: "Spotify",
    logoEmoji: "🎧",
    slogan: "Music for everyone.",
    website: "https://www.spotify.com",
    company: "Spotify Technology S.A.",
    ownership: "Spotify operates under Spotify Technology S.A.",
    aliases: ["Spotify"],
    subsidiaries: [],
    history: "Spotify is an audio streaming platform. It supports streaming and entertainment audience clustering in Brand Galaxy.",
  },
  mcdonalds: {
    name: "McDonald's",
    logoEmoji: "🍟",
    slogan: "I'm lovin' it.",
    website: "https://www.mcdonalds.com",
    company: "McDonald's Corporation",
    ownership: "McDonald's is operated by McDonald's Corporation and its franchise system.",
    aliases: ["McDonald's", "McDonalds", "MCD"],
    subsidiaries: [],
    history: "McDonald's is a global quick-service restaurant brand and a key Fast Food scenario anchor.",
  },
  burgerking: {
    name: "Burger King",
    logoEmoji: "🍔",
    slogan: "Have it your way.",
    website: "https://www.bk.com",
    company: "Restaurant Brands International",
    ownership: "Burger King is part of Restaurant Brands International.",
    aliases: ["Burger King", "BK"],
    subsidiaries: [],
    history: "Burger King is a global quick-service restaurant brand tracked for competitive fast-food relationship mapping.",
  },
  kfc: {
    name: "KFC",
    logoEmoji: "🍗",
    slogan: "It's finger lickin' good.",
    website: "https://www.kfc.com",
    company: "Yum! Brands",
    ownership: "KFC is part of Yum! Brands.",
    aliases: ["KFC", "Kentucky Fried Chicken"],
    subsidiaries: [],
    history: "KFC is a fried-chicken quick-service restaurant brand used in fast-food scenario mapping.",
  },
  nike: {
    name: "Nike",
    logoEmoji: "👟",
    slogan: "Just Do It.",
    website: "https://www.nike.com",
    company: "Nike, Inc.",
    ownership: "Nike is operated by Nike, Inc.",
    aliases: ["Nike"],
    subsidiaries: ["Jordan", "Converse"],
    history: "Nike is a sportswear and lifestyle brand used as a Fashion and athletics ecosystem anchor.",
  },
  adidas: {
    name: "Adidas",
    logoEmoji: "👟",
    slogan: "Impossible is nothing.",
    website: "https://www.adidas.com",
    company: "Adidas AG",
    ownership: "Adidas is operated by Adidas AG.",
    aliases: ["Adidas"],
    subsidiaries: [],
    history: "Adidas is a global sportswear brand and competitor in the Fashion scenario.",
  },
  apple: {
    name: "Apple",
    logoEmoji: "🍎",
    slogan: "Think Different.",
    website: "https://www.apple.com",
    company: "Apple Inc.",
    ownership: "Apple is operated by Apple Inc.",
    aliases: ["Apple", "Apple Inc."],
    subsidiaries: ["iPhone", "iPad", "Mac", "Apple TV+"],
    history: "Apple is a consumer technology brand used for mobile and consumer electronics ecosystem mapping.",
  },
  samsung: {
    name: "Samsung",
    logoEmoji: "📱",
    slogan: "Do what you can't.",
    website: "https://www.samsung.com",
    company: "Samsung Electronics",
    ownership: "Samsung Electronics is part of the Samsung group ecosystem.",
    aliases: ["Samsung", "Samsung Mobile"],
    subsidiaries: ["Galaxy"],
    history: "Samsung is a consumer electronics and mobile technology brand. Samsung Galaxy is treated as a product/satellite, not a brand node.",
  },
  playstation: {
    name: "PlayStation",
    logoEmoji: "🎮",
    slogan: "Play has no limits.",
    website: "https://www.playstation.com",
    company: "Sony Interactive Entertainment",
    ownership: "PlayStation is operated by Sony Interactive Entertainment, part of Sony Group.",
    aliases: ["PlayStation", "Sony PlayStation"],
    subsidiaries: ["PS5", "PlayStation Plus"],
    history: "PlayStation is a console gaming brand and part of the Gaming scenario.",
  },
  xbox: {
    name: "Xbox",
    logoEmoji: "🎮",
    slogan: "Power your dreams.",
    website: "https://www.xbox.com",
    company: "Microsoft",
    ownership: "Xbox is operated by Microsoft Gaming.",
    aliases: ["Xbox", "Microsoft Xbox"],
    subsidiaries: ["Game Pass", "Xbox Series X"],
    history: "Xbox is a console gaming brand and part of the Gaming scenario.",
  },
  nintendo: {
    name: "Nintendo",
    logoEmoji: "🎮",
    slogan: "There's no play like it.",
    website: "https://www.nintendo.com",
    company: "Nintendo Co., Ltd.",
    ownership: "Nintendo operates under Nintendo Co., Ltd.",
    aliases: ["Nintendo"],
    subsidiaries: ["Nintendo Switch"],
    history: "Nintendo is a gaming brand. Nintendo Switch is treated as a product/satellite of Nintendo, not a brand.",
  },
};

export function getRegisteredBrandProfile(name: string) {
  const key = normalizeBrandKey(name);
  if (BRAND_PROFILE_REGISTRY[key]) return BRAND_PROFILE_REGISTRY[key];

  const found = Object.entries(BRAND_PROFILE_REGISTRY).find(([registryKey, profile]) => {
    const profileKeys = [registryKey, profile.name, ...(profile.aliases || [])].map((item) =>
      normalizeBrandKey(item || "")
    );
    return profileKeys.includes(key) || profileKeys.some((item) => key.includes(item) || item.includes(key));
  });

  return found?.[1] || null;
}

export function buildBrandProfile(
  input: BrandProfileInput | string,
  related: Partial<BrandProfileInput> = {}
): BrandIntelligenceProfile {
  const entity = typeof input === "string" ? { name: input } : input || {};
  const name = entity.name || "Unknown Brand";
  const registry = getRegisteredBrandProfile(name) || {};

  const iabFootprint = dedupeText([
    entity.iab_full_path,
    [entity.iab_tier_1, entity.iab_tier_2, entity.iab_tier_3].filter(Boolean).join(" → "),
    ...(entity.iabFootprint || []),
    ...(related.iabFootprint || []),
  ]);

  const categories = dedupeText([
    entity.industry,
    entity.country,
    ...(entity.categories || []),
    ...(related.categories || []),
  ]);

  const signals = related.signals || entity.signals || [];
  const classifiedCount = iabFootprint.filter(
    (item) => item && !String(item).toLowerCase().includes("unclassified")
  ).length;

  return {
    name: registry.name || name,
    logoEmoji: entity.logoEmoji || registry.logoEmoji || "🪐",
    slogan: entity.slogan || registry.slogan || "Brand intelligence profile",
    website: entity.website || registry.website || "",
    company:
      entity.company ||
      entity.owner ||
      registry.company ||
      related.company ||
      "Ownership data pending",
    aliases: dedupeText([
      name,
      ...(entity.aliases || []),
      ...(registry.aliases || []),
      ...(related.aliases || []),
    ]),
    subsidiaries: dedupeText([
      ...(entity.subsidiaries || []),
      ...(registry.subsidiaries || []),
      ...(related.subsidiaries || []),
    ]),
    products: dedupeText([...(entity.products || []), ...(related.products || [])]),
    campaigns: dedupeText([...(entity.campaigns || []), ...(related.campaigns || [])]),
    audiences: dedupeText([...(entity.audiences || []), ...(related.audiences || [])]),
    iabFootprint,
    categories,
    sources: dedupeText([
      ...(entity.sources || []),
      ...(related.sources || []),
      "Supabase",
      signals.length ? "Monitoring feed" : "",
    ]),
    riskLabels: dedupeText([...(entity.riskLabels || []), ...(related.riskLabels || [])]),
    signals,
    signalCount: signals.length,
    classifiedCount,
    history:
      entity.description ||
      registry.history ||
      "History data pending. Add verified brand history, ownership changes, subsidiaries and aliases to make this profile production-grade.",
    ownership:
      entity.ownership ||
      registry.ownership ||
      "Ownership and subsidiary data pending. Add verified company relationships for formal reporting.",
  };
}

export function getBrandDedupeSql() {
  return `-- Preview possible duplicate brands by normalized name
select
  lower(regexp_replace(name, '[^a-zA-Z0-9]+', '', 'g')) as normalized_name,
  count(*) as duplicate_count,
  array_agg(id) as brand_ids,
  array_agg(name) as brand_names
from brands
group by normalized_name
having count(*) > 1
order by duplicate_count desc, normalized_name;

-- Do not auto-delete before reviewing the preview.
-- After review, merge duplicates by updating products/campaigns/relationships to the canonical brand id,
-- then delete only the duplicate brand rows.`;
}
