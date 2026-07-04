const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'stance-dashboard';

let cachedClient = null;

async function getDb() {
  if (cachedClient) return cachedClient.db(dbName);
  const client = new MongoClient(uri, { maxPoolSize: 10 });
  await client.connect();
  cachedClient = client;
  return client.db(dbName);
}

module.exports = { getDb };
