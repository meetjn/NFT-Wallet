import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { fundId: string } }) {
  console.log("Processing buy request for:", params.fundId);

  try {
    const { amount } = await request.json();

    if (!params.fundId || !amount || amount <= 0) {
      console.error("Invalid transaction request:", { fundId: params.fundId, amount });
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    return NextResponse.json({
      message: `Successfully bought $${amount} of ${params.fundId}`,
      fundId: params.fundId,
      amount,
    });
  } catch (error) {
    console.error("Error processing buy transaction:", error);
    return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
  }
}
