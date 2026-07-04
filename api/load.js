const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'stance-dashboard';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection('report-builder');

    // Find the latest record for this email
    const doc = await collection.find({ email })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    if (!doc) {
      return res.status(404).json({ error: 'No report found for this email' });
    }

    res.status(200).json(doc);
  } catch (error) {
    console.error('MongoDB Load Error:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
};
