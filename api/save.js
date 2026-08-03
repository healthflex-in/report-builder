const { DateTime } = require('luxon');
const { getDb } = require('./_db');
const { requireAuth } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAuth(req, res)) return;

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const db = await getDb();
    const createdAt = DateTime.now().setZone('Asia/Kolkata').toString();
    const result = await db.collection('report-data').insertOne({ ...data, createdAt });
    res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('MongoDB Save Error:', error);
    res.status(500).json({ error: 'Failed to save data', detail: error.message });
  }
};
