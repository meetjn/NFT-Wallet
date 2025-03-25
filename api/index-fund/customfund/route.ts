// app/api/index-fund/customfund/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/index-fund/mongodb';

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('indexFunds');

    const body = await req.json();

    // Ensure "type" is always "custom" and add a timestamp
    const newFund = {
      ...body,
      type: "custom", // Default type
      createdAt: new Date(), // Timestamp when stored
    };

    const result = await collection.insertOne(newFund);

    if (!result.acknowledged) {
      return NextResponse.json({ error: "Failed to create fund" }, { status: 500 });
    }

    return NextResponse.json({ message: "Fund created successfully", fund: newFund }, { status: 201 });
  } catch (error) {
    console.error("Error creating fund:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
