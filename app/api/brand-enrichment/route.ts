import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type BrandInput = {
  id: string;
  name: string;
  website?: string;
  logo_url?: string;
};

const BRAND_DOMAIN_MAP: Record<string, { website: string; slogan?: string; description?: string }> = {
  jeep: {
    website: "https://www.jeep.com",
    slogan: "Go Anywhere. Do Anything.",
    description: "Jeep is an automotive brand known for SUV and off-road vehicles.",
  },
  carshield: {
    website: "https://carshield.com",
    slogan: "Protect your vehicle budget.",
    description: "CarShield is an automotive services advertiser focused on vehicle protection plans.",
  },
  libertymutual: {
    website: "https://www.libertymutual.com",
    slogan: "Only pay for what you need.",
    description: "Liberty Mutual is an insurance advertiser and financial services brand.",
  },
  progressive: {
    website: "https://www.progressive.com",
    slogan: "Name your price.",
    description: "Progressive is an insurance advertiser.",
  },
  netflix: {
    website: "https://www.netflix.com",
    slogan: "See what's next.",
    description: "Netflix is a streaming entertainment platform.",
  },
  youtube: {
    website: "https://www.youtube.com",
    slogan: "Broadcast yourself.",
    description: "YouTube is a video and streaming platform.",
  },
  spotify: {
    website: "https://www.spotify.com",
    slogan: "Music for everyone.",
    description: "Spotify is an audio streaming platform.",
  },
  mcdonalds: {
    website: "https://www.mcdonalds.com",
    slogan: "I'm lovin' it.",
    description: "McDonald's is a global quick-service restaurant brand.",
  },
  burgerking: {
    website: "https://www.bk.com",
    slogan: "Have it your way.",
    description: "Burger King is a quick-service restaurant brand.",
  },
  kfc: {
    website: "https://www.kfc.com",
    slogan: "It's finger lickin' good.",
    description: "KFC is a fried-chicken quick-service restaurant brand.",
  },
  nike: {
    website: "https://www.nike.com",
    slogan: "Just Do It.",
    description: "Nike is a sportswear and lifestyle brand.",
  },
  adidas: {
    website: "https://www.adidas.com",
    slogan: "Impossible is nothing.",
    description: "Adidas is a global sportswear brand.",
  },
  puma: {
    website: "https://us.puma.com",
    slogan: "Forever Faster.",
    description: "Puma is a sportswear and lifestyle brand.",
  },
  apple: {
    website: "https://www.apple.com",
    slogan: "Think Different.",
    description: "Apple is a consumer technology brand.",
  },
  samsung: {
    website: "https://www.samsung.com",
    slogan: "Do what you can't.",
    description: "Samsung is a consumer electronics and mobile technology brand.",
  },
  playstation: {
    website: "https://www.playstation.com",
    slogan: "Play has no limits.",
    description: "PlayStation is a gaming and console brand.",
  },
  xbox: {
    website: "https://www.xbox.com",
    slogan: "Power your dreams.",
    description: "Xbox is a gaming and console brand.",
  },
  nintendo: {
    website: "https://www.nintendo.com",
    slogan: "There's no play like it.",
    description: "Nintendo is a gaming company and console brand.",
  },
  toyota: {
    website: "https://www.toyota.com",
    slogan: "Let's Go Places.",
    description: "Toyota is an automotive brand.",
  },
  ford: {
    website: "https://www.ford.com",
    slogan: "Built Ford Tough.",
    description: "Ford is an automotive brand.",
  },
  bmw: {
    website: "https://www.bmw.com",
    slogan: "The Ultimate Driving Machine.",
    description: "BMW is an automotive brand.",
  },
  mercedesbenz: {
    website: "https://www.mercedes-benz.com",
    slogan: "The best or nothing.",
    description: "Mercedes-Benz is a premium automotive brand.",
  },
};

function normalizeKey(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[®™©]/g, "")
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
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

function buildClearbitLogoUrl(website: string) {
  const domain = getDomainFromWebsite(website);
  if (!domain) return "";
  return `https://logo.clearbit.com/${domain}`;
}

function findKnownBrand(name: string) {
  const key = normalizeKey(name);
  if (BRAND_DOMAIN_MAP[key]) return BRAND_DOMAIN_MAP[key];

  const found = Object.entries(BRAND_DOMAIN_MAP).find(([brandKey]) => {
    return key === brandKey || key.includes(brandKey) || brandKey.includes(key);
  });

  return found?.[1] || null;
}

function buildLikelyWebsite(name: string) {
  const key = normalizeKey(name);
  if (!key || key.length < 3) return "";
  return `https://www.${key}.com`;
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
            "Missing Supabase server credentials. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const enriched = [];
    let updated = 0;
    let skipped = 0;

    for (const brand of brands.slice(0, 25)) {
      const known = findKnownBrand(brand.name);
      const website = brand.website || known?.website || buildLikelyWebsite(brand.name);
      const logoUrl = brand.logo_url || buildClearbitLogoUrl(website);

      if (!brand.id || !brand.name || (!website && !logoUrl)) {
        skipped += 1;
        continue;
      }

      const payload: Record<string, any> = {
        website,
        logo_url: logoUrl,
      };

      if (known?.slogan) payload.slogan = known.slogan;
      if (known?.description) payload.description = known.description;

      const { error } = await supabase
        .from("brands")
        .update(payload)
        .eq("id", brand.id);

      if (error) {
        skipped += 1;
        continue;
      }

      updated += 1;
      enriched.push({
        id: brand.id,
        name: brand.name,
        website,
        logo_url: logoUrl,
        slogan: known?.slogan || "",
        description: known?.description || "",
      });
    }

    return NextResponse.json({
      updated,
      skipped,
      enriched,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Brand enrichment failed" },
      { status: 500 }
    );
  }
}
