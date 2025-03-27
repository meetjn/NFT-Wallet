// app/api/index-fund/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/index-fund/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const funds = await db.collection('indexFunds')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Ensure we're sending a proper JSON response
    return new NextResponse(JSON.stringify({ 
      success: true, 
      funds: funds 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('Database error:', error);
    
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Failed to fetch index funds',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.description || !body.tokens) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const newFund = {
      name: body.name,
      description: body.description,
      tokens: body.tokens,
      createdAt: new Date(),
      type: 'custom'
    };

    const result = await db.collection('indexFunds').insertOne(newFund);

    return new NextResponse(JSON.stringify({
      success: true,
      fundId: result.insertedId,
      fund: newFund
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('Error creating fund:', error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Failed to create index fund',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}