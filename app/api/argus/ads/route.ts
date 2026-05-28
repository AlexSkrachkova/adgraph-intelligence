import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.ARGUS_API_KEY;
  const baseUrl =
    process.env.ARGUS_API_BASE ||
    "https://argus.rest/api/public";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ARGUS_API_KEY" },
      { status: 500 }
    );
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

  if (brand) {
    url.searchParams.set("brand", brand);
  }

  if (category) {
    url.searchParams.set("category", category);
  }

  if (q) {
    url.searchParams.set("q", q);
  }

  const response = await fetch(url.toString(), {
    headers: {
      "X-API-Key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
  return NextResponse.json({
    items: [],
    total: 0,
    upstreamError: `ARGUS API request failed: ${response.status}`,
  });
}

  const data = await response.json();

  return NextResponse.json(data);
}