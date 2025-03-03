const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function test() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);
    
    // Test write
    const result = await db.collection('indexFunds').insertOne({
      name: 'Test Fund',
      description: 'Test fund for connection verification',
      tokens: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Test document inserted:', result.insertedId);

    // Test read
    const fund = await db.collection('indexFunds').findOne({ _id: result.insertedId });
    console.log('Test document retrieved:', fund);

    // Clean up
    await db.collection('indexFunds').deleteOne({ _id: result.insertedId });
    console.log('Test document cleaned up');

    console.log('MongoDB connection test completed successfully');
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

test(); 