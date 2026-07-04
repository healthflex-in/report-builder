const { getDb } = require('./_db');

module.exports = async (req, res) => {
  const db = await getDb();
  const collection = db.collection('report-schema');

  if (req.method === 'GET') {
    const { id } = req.query;
    try {
      if (id) {
        const doc = await collection.findOne({ id });
        if (!doc) return res.status(404).json({ error: 'Schema not found' });
        return res.status(200).json(doc);
      }
      const docs = await collection.find({}).toArray();
      return res.status(200).json(docs);
    } catch (error) {
      console.error('MongoDB Schema Load Error:', error);
      return res.status(500).json({ error: 'Failed to load schema' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!data.id) return res.status(400).json({ error: 'Schema must have an id' });
      await collection.replaceOne({ id: data.id }, data, { upsert: true });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('MongoDB Schema Save Error:', error);
      return res.status(500).json({ error: 'Failed to save schema' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
