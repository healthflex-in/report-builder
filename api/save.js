const { MongoClient } = require('mongodb');
const { DateTime } = require('luxon');

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = JSON.parse(req.body);
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection('report-data');

    // Set creation date in IST
    const createdAt = DateTime.now().setZone('Asia/Kolkata').toString();

    const doc = {
      ...data,
      createdAt
    };

    const result = await collection.insertOne(doc);

    res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('MongoDB Save Error:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
};
