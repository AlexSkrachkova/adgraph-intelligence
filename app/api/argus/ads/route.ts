import { NextResponse } from "next/server";

const fallbackItems = [
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