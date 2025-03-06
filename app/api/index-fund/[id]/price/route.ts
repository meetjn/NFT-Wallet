// app/api/index-fund/[id]/price/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/index-fund/mongodb';
import axios from 'axios';
import { ObjectId } from 'mongodb';

// Named export for the GET method
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Await params to access its properties
  const { id } = await params; // Get the fund ID from params

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Fetch the fund from the database
    const fund = await db.collection('indexFunds').findOne({ _id: new ObjectId(id) });

    if (!fund) {
      return NextResponse.json({ error: 'Fund not found' }, { status: 404 });
    }

    // Fetch real-time prices for the tokens in the fund
    const prices = await fetchRealTimePrices(fund.tokens.map(token => token.symbol)); // Ensure tokens are valid symbols

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Error fetching fund price:', error);
    return NextResponse.json({ error: 'Failed to fetch fund price', details: error.message }, { status: 500 });
  }
}

// Function to fetch real-time prices from the Binance API
const fetchRealTimePrices = async (tokens: string[]) => {
  try {
    const symbols = tokens.map(token => `${token}USDT`); // Assuming you want prices in USDT

    const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: {
        symbols: JSON.stringify(symbols), // Ensure this is a JSON string array
      },
    });

    const prices = response.data.reduce((acc: any, item: any) => {
      acc[item.symbol.replace('USDT', '')] = parseFloat(item.price);
      return acc;
    }, {});

    return prices;
  } catch (error) {
    console.error('Error fetching real-time prices from Binance:', error);
    throw new Error('Failed to fetch real-time prices');
  }
};