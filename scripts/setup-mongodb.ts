const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function setup() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);

    // Check if collection exists before creating
    const collections = await db.listCollections({ name: 'indexFunds' }).toArray();
    
    if (collections.length === 0) {
      // Create collection without options
      await db.createCollection('indexFunds');
      console.log('Collection "indexFunds" created successfully');
    } else {
      console.log('Collection "indexFunds" already exists');
    }

    // Create indexes
    await db.collection('indexFunds').createIndexes([
      { key: { name: 1 }, name: 'name_index' },
      { key: { createdAt: -1 }, name: 'creation_date_index' },
      { key: { 'tokens.symbol': 1 }, name: 'token_symbol_index' }
    ]);

    console.log('Indexes created successfully');
    console.log('MongoDB setup completed successfully');

  } catch (error) {
    console.error('Error setting up MongoDB:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed');
    }
  }
}

setup(); 