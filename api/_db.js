const dns = require('dns');
const { MongoClient } = require('mongodb');

// Some local networks refuse Node's default SRV lookup (querySrv ECONNREFUSED).
// Prefer public resolvers before connecting to Atlas mongodb+srv:// URIs.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  /* ignore */
}

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'stance-dashboard';

let cachedClient = null;
let connectPromise = null;

async function getDb() {
  if (cachedClient) return cachedClient.db(dbName);
  if (!uri) throw new Error('MONGO_URI is not set');

  if (!connectPromise) {
    connectPromise = (async () => {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 12000,
      });
      await client.connect();
      cachedClient = client;
      return client;
    })().catch((err) => {
      connectPromise = null;
      throw err;
    });
  }

  const client = await connectPromise;
  return client.db(dbName);
}

module.exports = { getDb };
