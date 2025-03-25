// app/api/index-fund/[id]/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const id = params.id;

    // Validate the id
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid fund ID format' },
        { status: 400 }
      );
    }

    // Fetch historical data from your database
    const historyCollection = db.collection('fund_history');
    const history = await historyCollection
      .find({ fundId: new ObjectId(id) })
      .sort({ timestamp: 1 })
      .toArray();

    // If no history is found, return an empty array
    if (!history || history.length === 0) {
      return NextResponse.json({ history: [] });
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching fund history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fund history' },
      { status: 500 }
    );
  }
}