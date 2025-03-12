import { NextResponse } from 'next/server';
import clientPromise from '@/lib/index-fund/mongodb';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation'; // Import notFound [5]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB); // Get DB name from .env

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Invalid fund ID' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const fund = await db.collection('indexFunds').findOne({
      _id: new ObjectId(id),
    });

    if (!fund) {
      notFound(); // Call notFound if fund is not found [5]
    }

    // Convert ObjectId to string for proper JSON serialization
    const fundWithIdString = { ...fund, _id: fund._id.toString() };

    return new NextResponse(
      JSON.stringify({ success: true, fund: fundWithIdString }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching fund:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch index fund',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}




