import { NextResponse } from 'next/server';
import clientPromise from '@/lib/index-fund/mongodb';

export async function GET() {
  try {
    // Attempt to connect to MongoDB
    const client = await clientPromise;
    console.log('MongoDB Connection Test: Connected successfully');

    // Test database access
    const db = client.db(process.env.MONGODB_DB);
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections);

    // Test reading from indexFunds collection
    const testQuery = await db.collection('indexFunds').find({}).limit(1).toArray();
    console.log('Test query result:', testQuery);

    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Successfully connected to MongoDB',
      dbName: process.env.MONGODB_DB,
      collections: collections.map(col => col.name),
      testQuery: testQuery
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('MongoDB Connection Test Error:', error);
    
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Failed to connect to MongoDB',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 