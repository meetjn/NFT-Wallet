import { NextResponse } from "next/server";

const mockTransactions: Record<string, any[]> = {
  "crypto-index": [
    { type: "buy", amount: 500, date: "2024-01-15" },
    { type: "sell", amount: 200, date: "2024-01-20" },
  ],
  "defi-index": [
    { type: "buy", amount: 700, date: "2024-02-10" },
  ],
};

export async function GET(request: Request, context: { params: { fundId: string } }) {
  const { params } = context;
  const { fundId } = params;

  const transactions = mockTransactions[fundId] || [];
  return NextResponse.json(transactions);
}
