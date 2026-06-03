import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type BrandInput = {
  id: string;
  name: string;
  website?: string | null;
  logo_url?: string | null;
};

type BrandPayload = {
  website: string;
  logo_url: string;
  slogan?: string;
  description?: string;
  aliases?: string[];
  ownership?: string;
  subsidiaries?: string[];
};

const BRAND_DOMAIN_MAP: Record<string, BrandPayload> = {
  adidas: {
    website: "https://www.adidas.com",
    logo_url: "",
    slogan: "Impossible is nothing.",
    description: "Adidas is a global sportswear and lifestyle brand.",
    ownership: "Adidas AG",
    aliases: ["Adidas AG"],
    subsidiaries: [],
  },
  apple: {
    website: "https://www.apple.com",
    logo_url: "",
    slogan: "Think Different.",
    description: "Apple is a consumer technology company with hardware, software and services brands.",
    ownership: "Apple Inc.",
    aliases: ["Apple Inc.", "iPhone", "Apple TV"],
    subsidiaries: ["iPhone", "iPad", "Mac", "Apple TV"],
  },
  arbys: {
    website: "https://www.arbys.com",
    logo_url: "",
    slogan: "We Have The Meats.",
    description: "Arby's is a quick-service restaurant brand.",
    ownership: "Inspire Brands",
    aliases: ["Arby's"],
    subsidiaries: [],
  },
  bmw: {
    website: "https://www.bmw.com",
    logo_url: "",
    slogan: "The Ultimate Driving Machine.",
    description: "BMW is a premium automotive brand.",
    ownership: "BMW Group",
    aliases: ["Bayerische Motoren Werke"],
    subsidiaries: [],
  },
  burgerking: {
    website: "https://www.bk.com",
    logo_url: "",
    slogan: "Have it your way.",
    description: "Burger King is a quick-service restaurant brand.",
    ownership: "Restaurant Brands International",
    aliases: ["BK"],
    subsidiaries: [],
  },
  carshield: {
    website: "https://carshield.com",
    logo_url: "",
    slogan: "Protect your vehicle budget.",
    description: "CarShield is an automotive services advertiser focused on vehicle protection plans.",
    ownership: "CarShield",
    aliases: ["Car Shield"],
    subsidiaries: [],
  },
  chanel: {
    website: "https://www.chanel.com",
    logo_url: "",
    slogan: "",
    description: "Chanel is a luxury fashion, beauty and fragrance brand.",
    ownership: "Chanel Limited",
    aliases: ["Chanel"],
    subsidiaries: [],
  },
  cocacola: {
    website: "https://www.coca-cola.com",
    logo_url: "",
    slogan: "Taste the Feeling.",
    description: "Coca-Cola is a global beverage brand.",
    ownership: "The Coca-Cola Company",
    aliases: ["Coke", "Coca Cola", "Coca-Cola Zero", "Coca-Cola Zero Sugar"],
    subsidiaries: ["Coca-Cola Zero Sugar", "Diet Coke"],
  },
  disney: {
    website: "https://www.disney.com",
    logo_url: "",
    slogan: "",
    description: "Disney is an entertainment and media brand.",
    ownership: "The Walt Disney Company",
    aliases: ["Disney+", "Disney Plus"],
    subsidiaries: ["Disney+", "Hulu"],
  },
  ford: {
    website: "https://www.ford.com",
    logo_url: "",
    slogan: "Built Ford Tough.",
    description: "Ford is an automotive brand.",
    ownership: "Ford Motor Company",
    aliases: ["Ford Motor Company", "F-150", "Bronco", "Mustang"],
    subsidiaries: ["F-150", "Bronco", "Mustang"],
  },
  hulu: {
    website: "https://www.hulu.com",
    logo_url: "",
    slogan: "",
    description: "Hulu is a streaming entertainment platform.",
    ownership: "The Walt Disney Company",
    aliases: ["Hulu"],
    subsidiaries: [],
  },
  jeep: {
    website: "https://www.jeep.com",
    logo_url: "",
    slogan: "Go Anywhere. Do Anything.",
    description: "Jeep is an automotive brand known for SUV and off-road vehicles.",
    ownership: "Stellantis",
    aliases: ["Jeep Wrangler", "Wrangler", "Jeep Compass", "Grand Cherokee"],
    subsidiaries: ["Wrangler", "Compass", "Grand Cherokee"],
  },
  kfc: {
    website: "https://www.kfc.com",
    logo_url: "",
    slogan: "It's finger lickin' good.",
    description: "KFC is a fried-chicken quick-service restaurant brand.",
    ownership: "Yum! Brands",
    aliases: ["Kentucky Fried Chicken"],
    subsidiaries: [],
  },
  libertymutual: {
    website: "https://www.libertymutual.com",
    logo_url: "",
    slogan: "Only pay for what you need.",
    description: "Liberty Mutual is an insurance advertiser and financial services brand.",
    ownership: "Liberty Mutual Group",
    aliases: ["Liberty Mutual"],
    subsidiaries: [],
  },
  mcdonalds: {
    website: "https://www.mcdonalds.com",
    logo_url: "",
    slogan: "I'm lovin' it.",
    description: "McDonald's is a global quick-service restaurant brand.",
    ownership: "McDonald's Corporation",
    aliases: ["McDonalds"],
    subsidiaries: [],
  },
  mercedesbenz: {
    website: "https://www.mercedes-benz.com",
    logo_url: "",
    slogan: "The best or nothing.",
    description: "Mercedes-Benz is a premium automotive brand.",
    ownership: "Mercedes-Benz Group",
    aliases: ["Mercedes Benz", "Mercedes"],
    subsidiaries: [],
  },
  netflix: {
    website: "https://www.netflix.com",
    logo_url: "",
    slogan: "See what's next.",
    description: "Netflix is a streaming entertainment platform.",
    ownership: "Netflix, Inc.",
    aliases: ["Netflix Premium"],
    subsidiaries: [],
  },
  nike: {
    website: "https://www.nike.com",
    logo_url: "",
    slogan: "Just Do It.",
    description: "Nike is a sportswear and lifestyle brand.",
    ownership: "Nike, Inc.",
    aliases: ["Nike"],
    subsidiaries: [],
  },
  nintendo: {
    website: "https://www.nintendo.com",
    logo_url: "",
    slogan: "There's no play like it.",
    description: "Nintendo is a gaming company and console brand.",
    ownership: "Nintendo Co., Ltd.",
    aliases: ["Nintendo Switch", "Switch OLED", "Switch Lite"],
    subsidiaries: ["Nintendo Switch"],
  },
  paramountplus: {
    website: "https://www.paramountplus.com",
    logo_url: "",
    slogan: "",
    description: "Paramount Plus is a streaming entertainment service.",
    ownership: "Paramount Global",
    aliases: ["Paramount+", "Paramount Plus"],
    subsidiaries: [],
  },
  pepsi: {
    website: "https://www.pepsi.com",
    logo_url: "",
    slogan: "That's What I Like.",
    description: "Pepsi is a global beverage brand.",
    ownership: "PepsiCo",
    aliases: ["Pepsi Zero Sugar"],
    subsidiaries: ["Pepsi Zero Sugar"],
  },
  playstation: {
    website: "https://www.playstation.com",
    logo_url: "",
    slogan: "Play has no limits.",
    description: "PlayStation is a gaming and console brand.",
    ownership: "Sony Interactive Entertainment",
    aliases: ["PS5", "PS4", "PlayStation Plus"],
    subsidiaries: ["PlayStation 5", "PlayStation Plus"],
  },
  progressive: {
    website: "https://www.progressive.com",
    logo_url: "",
    slogan: "Name your price.",
    description: "Progressive is an insurance advertiser.",
    ownership: "Progressive Corporation",
    aliases: ["Progressive"],
    subsidiaries: [],
  },
  puma: {
    website: "https://us.puma.com",
    logo_url: "",
    slogan: "Forever Faster.",
    description: "Puma is a sportswear and lifestyle brand.",
    ownership: "Puma SE",
    aliases: ["Puma"],
    subsidiaries: [],
  },
  samsung: {
    website: "https://www.samsung.com",
    logo_url: "",
    slogan: "Do what you can't.",
    description: "Samsung is a consumer electronics and mobile technology brand.",
    ownership: "Samsung Electronics",
    aliases: ["Samsung Galaxy", "Galaxy", "Galaxy S25", "Galaxy Watch"],
    subsidiaries: ["Galaxy", "Galaxy S", "Galaxy Watch"],
  },
  spotify: {
    website: "https://www.spotify.com",
    logo_url: "",
    slogan: "Music for everyone.",
    description: "Spotify is an audio streaming platform.",
    ownership: "Spotify Technology S.A.",
    aliases: ["Spotify Premium"],
    subsidiaries: [],
  },
  toyota: {
    website: "https://www.toyota.com",
    logo_url: "",
    slogan: "Let's Go Places.",
    description: "Toyota is an automotive brand.",
    ownership: "Toyota Motor Corporation",
    aliases: ["Toyota"],
    subsidiaries: [],
  },
  xbox: {
    website: "https://www.xbox.com",
    logo_url: "",
    slogan: "Power your dreams.",
    description: "Xbox is a gaming and console brand.",
    ownership: "Microsoft",
    aliases: ["Xbox Game Pass", "Game Pass"],
    subsidiaries: ["Xbox Game Pass"],
  },
  youtube: {
    website: "https://www.youtube.com",
    logo_url: "",
    slogan: "Broadcast yourself.",
    description: "YouTube is a video and streaming platform.",
    ownership: "Google",
    aliases: ["YouTube Premium"],
    subsidiaries: ["YouTube Premium"],
  },
  marcospizza: {
  website: "https://www.marcos.com",
  logo_url: "",
  slogan: "",
  description: "Marco's Pizza is a quick-service pizza restaurant brand.",
  ownership: "Marco's Franchising, LLC",
  aliases: ["Marco's Pizza", "Marcos Pizza", "Marco’s Pizza"],
  subsidiaries: [],
},
gruns: {
  website: "https://www.gruns.co",
  logo_url: "",
  slogan: "",
  description: "Gruns is a consumer wellness brand.",
  ownership: "Gruns",
  aliases: ["Grüns", "Gruns"],
  subsidiaries: [],
},
};

function normalizeKey(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[®™©]/g, "")
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/\b(the|brand|company|inc|llc|ltd|corp|corporation|group|insurance)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function getDomainFromWebsite(website: string) {
  if (!website) return "";

  try {
    const withProtocol = website.startsWith("http") ? website : `https://${website}`;
    return new URL(withProtocol).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function buildLogoUrl(website: string) {
  const domain = getDomainFromWebsite(website);
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function findKnownBrand(name: string): BrandPayload | null {
  const key = normalizeKey(name);
  if (BRAND_DOMAIN_MAP[key]) return BRAND_DOMAIN_MAP[key];

  const found = Object.entries(BRAND_DOMAIN_MAP).find(([brandKey, value]) => {
    const aliases = value.aliases || [];
    const aliasMatch = aliases.some((alias) => {
      const aliasKey = normalizeKey(alias);
      return key === aliasKey || key.includes(aliasKey) || aliasKey.includes(key);
    });

    return key === brandKey || key.includes(brandKey) || brandKey.includes(key) || aliasMatch;
  });

  return found?.[1] || null;
}

function buildLikelyWebsite(name: string) {
  const key = normalizeKey(name);
  if (!key || key.length < 3) return "";
  return `https://www.${key}.com`;
}

function mergePayload(brand: BrandInput): BrandPayload {
  const known = findKnownBrand(brand.name);
  const website = brand.website || known?.website || buildLikelyWebsite(brand.name);
const logo_url = known?.logo_url || buildLogoUrl(website) || brand.logo_url || "";

  return {
    website,
    logo_url,
    slogan: known?.slogan || "",
    description:
      known?.description ||
      `${brand.name} is a brand entity enriched by AdGraph Intelligence for logo, website and profile context.`,
    aliases: known?.aliases || [],
    ownership: known?.ownership || "",
    subsidiaries: known?.subsidiaries || [],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brands: BrandInput[] = Array.isArray(body?.brands) ? body.brands : [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Missing Supabase server credentials. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local / Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const enriched: Array<{
      id: string;
      name: string;
      website: string;
      logo_url: string;
      slogan: string;
      description: string;
      aliases: string[];
      ownership: string;
      subsidiaries: string[];
    }> = [];

    const processed: string[] = [];
    const errors: string[] = [];
    let updated = 0;
    let skipped = 0;

    for (const brand of brands.slice(0, 100)) {
      processed.push(brand.name || "Unnamed brand");

      if (!brand.id || !brand.name) {
        skipped += 1;
        errors.push(`Skipped invalid brand: ${brand.name || "missing name"}`);
        continue;
      }

      const payload = mergePayload(brand);

      const updatePayload: Record<string, any> = {
        website: payload.website,
        logo_url: payload.logo_url,
        slogan: payload.slogan,
        description: payload.description,
        aliases: payload.aliases,
        ownership: payload.ownership,
        subsidiaries: payload.subsidiaries,
      };

      const { error } = await supabase
        .from("brands")
        .update(updatePayload)
        .eq("id", brand.id);

      if (error) {
        skipped += 1;
        errors.push(`${brand.name}: ${error.message}`);
        continue;
      }

      updated += 1;

      enriched.push({
        id: brand.id,
        name: brand.name,
        website: payload.website,
        logo_url: payload.logo_url,
        slogan: payload.slogan || "",
        description: payload.description || "",
        aliases: payload.aliases || [],
        ownership: payload.ownership || "",
        subsidiaries: payload.subsidiaries || [],
      });
    }

    return NextResponse.json({
      updated,
      skipped,
      enriched,
      processed,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Brand enrichment failed" },
      { status: 500 }
    );
  }
}
