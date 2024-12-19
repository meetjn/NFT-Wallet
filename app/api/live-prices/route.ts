// app/api/live-prices/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getLivePrices } from "@/utils/api"; // Import the updated function

export async function GET(req: NextRequest) {
  // Get the query parameters from the URL
  const url = new URL(req.url);
  const pairs = url.searchParams.get("pairs"); // Extract the pairs from the URL query params

  if (!pairs) {
    return NextResponse.json({ error: "No pairs provided" }, { status: 400 });
  }

  const pairsArray = pairs.split(","); // Split the pairs by comma

  // Get the live prices for the provided pairs
  const prices = await getLivePrices(pairsArray);

  return NextResponse.json(prices); // Return the prices in the response
}
