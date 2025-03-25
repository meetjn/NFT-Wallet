import { NextRequest, NextResponse } from 'next/server';

// we can replace this URL with any other crypto price API
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

async function fetchBinancePrice(symbol: string) {
  const formattedSymbol = symbol.replace('-', '');
  const url = `${BINANCE_API_BASE}/ticker/price?symbol=${formattedSymbol}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch price from Binance');
  }
  
  const data = await response.json();
  return parseFloat(data.price);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pair: string } }
) {
  try {
    const price = await fetchBinancePrice(params.pair);
    
    return NextResponse.json({
      price,
      timestamp: Date.now(),
      pair: params.pair
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
}