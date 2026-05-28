import { NextResponse } from "next/server";

const fallbackItems = [
  {
    id: "fallback-jeep-wrangler",
    brand_name: "Jeep",
    advertiser_name: "Jeep",
    promotion_name: "Wrangler Go Anywhere Campaign",
    products_text: "Wrangler, Grand Cherokee, Gladiator",
    primary_category: "Automotive",
    subcategory: "SUV",
    iab_full_path: "Automotive → SUVs",
    iab_tier_1: "Automotive",
    confidence: 0.91,
    duration_ms: 30000,
    risk_labels: [],
  },
  {
    id: "fallback-thor",
    brand_name: "Thor",
    advertiser_name: "Thor Industries",
    promotion_name: "Adventure Vehicle Campaign",
    products_text: "RV, Motorhome",
    primary_category: "Automotive",
    subcategory: "Recreational Vehicles",
    iab_full_path: "Automotive → Recreational Vehicles",
    iab_tier_1: "Automotive",
    confidence: 0.88,
    duration_ms: 30000,
    risk_labels: [],
  },
];

export async function GET(request: Request) {
  const apiKey = process.env.ARGUS_API_KEY;
  const baseUrl =
    process.env.ARGUS_API_BASE || "https://argus.rest/api/public";

  if (!apiKey) {
    return NextResponse.json({
      items: fallbackItems,
      total: fallbackItems.length,
      upstreamError: "Missing ARGUS_API_KEY. Showing fallback monitoring data.",
    });
  }

  const { searchParams } = new URL(request.url);

  const limit = searchParams.get("limit") || "20";
  const offset = searchParams.get("offset") || "0";
  const brand = searchParams.get("brand");
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const url = new URL(`${baseUrl}/ads`);
  url.searchParams.set("limit", limit);
  url.searchParams.set("offset", offset);

  if (brand) url.searchParams.set("brand", brand);
  if (category) url.searchParams.set("category", category);
  if (q) url.searchParams.set("q", q);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({
        items: fallbackItems,
        total: fallbackItems.length,
        upstreamError: `ARGUS API request failed: ${response.status}. Showing fallback monitoring data.`,
      });
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      items: fallbackItems,
      total: fallbackItems.length,
      upstreamError: "ARGUS API unavailable. Showing fallback monitoring data.",
    });
  }
}