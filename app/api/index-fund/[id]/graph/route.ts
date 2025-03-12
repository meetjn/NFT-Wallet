import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/index-fund/mongodb";
import axios from "axios";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // ✅ Ensure params are awaited
    const { id } = context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid fund ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // 🔹 Fetch fund details
    const fund = await db.collection("indexFunds").findOne({ _id: new ObjectId(id) });

    if (!fund) {
      return NextResponse.json({ success: false, error: "Fund not found" }, { status: 404 });
    }

    // ✅ Ensure tokens exist and are in the correct format
    const tokens = fund.tokens.map((token: any) => token.symbol.toUpperCase());
    if (tokens.length === 0) {
      return NextResponse.json({ success: false, error: "No tokens in fund" }, { status: 400 });
    }

    const timeframe = request.nextUrl.searchParams.get("timeframe") || "1d";

    // 🔹 Fetch historical prices for each token from Binance API
    const priceRequests = tokens.map((token) => fetchHistoricalData(token, timeframe));
    const historicalData = await Promise.all(priceRequests);

    // 🔹 Aggregate prices (sum or average)
    const aggregatedData = aggregatePrices(historicalData);

    return NextResponse.json({ success: true, historicalData: aggregatedData }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching fund graph data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch graph data", details: error.message },
      { status: 500 }
    );
  }
}

// ✅ Fetch OHLC historical price data from Binance API
async function fetchHistoricalData(token: string, timeframe: string) {
  try {
    const symbol = `${token}USDT`; // Format for Binance API

    // ✅ Fetch OHLCV (Open, High, Low, Close, Volume) data
    const response = await axios.get("https://api.binance.com/api/v3/klines", {
      params: { symbol, interval: timeframe, limit: 100 }, // Adjust limit as needed
    });

    return response.data.map((item: any) => ({
      time: item[0] / 1000 as UTCTimestamp, // Convert ms to sec
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
      symbol: token,
    }));
  } catch (error) {
    console.error(`❌ Error fetching ${token} price:`, error);
    return [];
  }
}

// ✅ Aggregate prices by averaging OHLC values for multiple tokens
function aggregatePrices(data: any[][]) {
  const aggregatedData: { time: number; open: number; high: number; low: number; close: number }[] = [];

  data[0]?.forEach((_, index) => {
    let openSum = 0, highSum = 0, lowSum = 0, closeSum = 0;
    let time = 0;
    let count = 0;

    data.forEach((tokenData) => {
      if (tokenData[index]) {
        openSum += tokenData[index].open;
        highSum += tokenData[index].high;
        lowSum += tokenData[index].low;
        closeSum += tokenData[index].close;
        time = tokenData[index].time;
        count++;
      }
    });

    if (count > 0) {
      aggregatedData.push({
        time,
        open: openSum / count,
        high: highSum / count,
        low: lowSum / count,
        close: closeSum / count,
      });
    }
  });

  return aggregatedData;
}
