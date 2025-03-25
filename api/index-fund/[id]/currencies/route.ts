import { NextResponse } from "next/server";

const BINANCE_API_URL = "https://api.binance.com/api/v3/ticker/price";

export async function GET(request: Request, { params }: { params: { fundId: string } }) {
  console.log("🚀 API received fundId:", params.fundId); // Debugging log

  if (!params.fundId) {
    console.error("❌ Error: Fund ID is missing");
    return NextResponse.json({ error: "Invalid fund ID" }, { status: 400 });
  }

  const fundData: Record<string, any> = {
    "crypto-index": {
      name: "Crypto Index",
      assets: ["BTCUSDT", "ETHUSDT", "BNBUSDT"],
    },
    "defi-index": {
      name: "DeFi Index",
      assets: ["UNIUSDT", "AAVEUSDT", "MKRUSDT"],
    },
  };

  const fund = fundData[params.fundId];

  if (!fund) {
    console.error("❌ Error: Fund ID not found in data:", params.fundId);
    return NextResponse.json({ error: "Invalid fund ID" }, { status: 404 });
  }

  try {
    const livePrices = await Promise.all(
      fund.assets.map(async (symbol) => {
        try {
          const response = await fetch(`${BINANCE_API_URL}?symbol=${symbol}`);
          if (!response.ok) {
            console.error(`⚠️ Failed to fetch ${symbol} price:`, response.status);
            return { symbol, price: null }; // Return null price if fetch fails
          }
          const data = await response.json();
          return { symbol, price: parseFloat(data.price) };
        } catch (error) {
          console.error(`❌ Error fetching ${symbol} data:`, error);
          return { symbol, price: null }; // Return null in case of error
        }
      })
    );

    return NextResponse.json({
      name: fund.name,
      assets: livePrices.filter((asset) => asset.price !== null), // Remove null prices
    });
  } catch (error) {
    console.error("❌ Error fetching live prices:", error);
    return NextResponse.json({ error: "Failed to fetch live prices" }, { status: 500 });
  }
}
