const { DateTime } = require('luxon');
const { ObjectId } = require('mongodb');
const { getDb } = require('./_db');
const { requireAuth } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAuth(req, res)) return;

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'Report data is required' });
    }

    const { reportId, ...reportData } = data;
    const db = await getDb();
    const now = DateTime.now().setZone('Asia/Kolkata').toString();
    const reports = db.collection('report-data');

    if (reportId) {
      if (!ObjectId.isValid(reportId)) {
        return res.status(400).json({ error: 'Invalid report ID' });
      }

      const result = await reports.updateOne(
        { _id: new ObjectId(reportId) },
        { $set: { ...reportData, updatedAt: now } }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ error: 'Report not found' });
      }

      return res.status(200).json({ success: true, id: String(reportId), updated: true });
    }

    const result = await reports.insertOne({
      ...reportData,
      createdAt: now,
      updatedAt: now,
    });
    return res.status(200).json({ success: true, id: result.insertedId.toString(), created: true });
  } catch (error) {
    console.error('MongoDB Save Error:', error);
    return res.status(500).json({ error: 'Failed to save data', detail: error.message });
  }
};
