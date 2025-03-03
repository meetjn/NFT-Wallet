import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://rohitsharma123ios:rohit123@index-fund-cluster.qhsmq.mongodb.net/?retryWrites=true&w=majority";
const dbName = "index-fund-cluster";

const standardFunds = [
  {
    name: "Top 5 Market Cap Index",
    description: "Tracks the performance of the top 5 cryptocurrencies by market capitalization",
    type: "standard",
    tokens: [
      { symbol: "BTC", weight: 0.40, name: "Bitcoin" },
      { symbol: "ETH", weight: 0.30, name: "Ethereum" },
      { symbol: "BNB", weight: 0.15, name: "Binance Coin" },
      { symbol: "SOL", weight: 0.10, name: "Solana" },
      { symbol: "ADA", weight: 0.05, name: "Cardano" }
    ],
    createdAt: new Date(),
    category: "Large Cap",
    riskLevel: "Moderate"
  },
  {
    name: "DeFi Blue Chips",
    description: "A curated index of established DeFi protocols and platforms",
    type: "standard",
    tokens: [
      { symbol: "UNI", weight: 0.25, name: "Uniswap" },
      { symbol: "AAVE", weight: 0.25, name: "Aave" },
      { symbol: "LINK", weight: 0.20, name: "Chainlink" },
      { symbol: "MKR", weight: 0.15, name: "Maker" },
      { symbol: "SNX", weight: 0.15, name: "Synthetix" }
    ],
    createdAt: new Date(),
    category: "DeFi",
    riskLevel: "High"
  },
  {
    name: "Layer 1 Protocol Index",
    description: "Exposure to major Layer 1 blockchain protocols",
    type: "standard",
    tokens: [
      { symbol: "ETH", weight: 0.35, name: "Ethereum" },
      { symbol: "SOL", weight: 0.20, name: "Solana" },
      { symbol: "ADA", weight: 0.15, name: "Cardano" },
      { symbol: "AVAX", weight: 0.15, name: "Avalanche" },
      { symbol: "DOT", weight: 0.15, name: "Polkadot" }
    ],
    createdAt: new Date(),
    category: "Infrastructure",
    riskLevel: "Moderate"
  },
  {
    name: "Web3 Gaming Index",
    description: "A collection of leading gaming and metaverse tokens",
    type: "standard",
    tokens: [
      { symbol: "AXS", weight: 0.30, name: "Axie Infinity" },
      { symbol: "MANA", weight: 0.25, name: "Decentraland" },
      { symbol: "SAND", weight: 0.25, name: "The Sandbox" },
      { symbol: "ENJ", weight: 0.20, name: "Enjin Coin" }
    ],
    createdAt: new Date(),
    category: "Gaming",
    riskLevel: "High"
  },
  {
    name: "Innovation Leaders",
    description: "Emerging blockchain technologies and innovative protocols",
    type: "standard",
    tokens: [
      { symbol: "DOT", weight: 0.25, name: "Polkadot" },
      { symbol: "ATOM", weight: 0.25, name: "Cosmos" },
      { symbol: "ALGO", weight: 0.25, name: "Algorand" },
      { symbol: "NEAR", weight: 0.25, name: "NEAR Protocol" }
    ],
    createdAt: new Date(),
    category: "Innovation",
    riskLevel: "High"
  }
];

async function seedDatabase() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    
    // Clear existing standard funds
    console.log('Clearing existing standard funds...');
    await db.collection('indexFunds').deleteMany({ type: 'standard' });
    
    // Insert new standard funds
    console.log('Inserting new standard funds...');
    const result = await db.collection('indexFunds').insertMany(standardFunds);
    
    console.log(`Successfully inserted ${result.insertedCount} standard funds`);
    
    // Verify the insertion
    const insertedFunds = await db.collection('indexFunds').find({ type: 'standard' }).toArray();
    console.log('Inserted funds:', insertedFunds);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed');
    }
  }
}

// Run the seeding function
seedDatabase().catch(console.error); 