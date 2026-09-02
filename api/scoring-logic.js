//  * GET /api/scoring-logic              → list all scoring logic documents
//  * GET /api/scoring-logic?schemaId=X   → get scoring logic for a specific assessment schema
//  * GET /api/scoring-logic?id=X         → get by scoring logic document ID
//  * POST /api/scoring-logic             → upsert a scoring logic document (auth required)
//  * DELETE /api/scoring-logic?id=X      → delete a scoring logic document (auth required)


const { getDb } = require('./_db');
const { requireAuth } = require('./_auth');

const COLLECTION = 'report-scoring-logic';

module.exports = async (req, res) => {
  const db = await getDb();
  const collection = db.collection(COLLECTION);

  // ─── GET (public) ───────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { id, schemaId } = req.query;
    try {
      if (id) {
        const doc = await collection.findOne({ id });
        if (!doc) return res.status(404).json({ error: 'Scoring logic not found' });
        return res.status(200).json(doc);
      }
      if (schemaId) {
        const doc = await collection.findOne({ schemaId });
        if (!doc) return res.status(404).json({ error: 'Scoring logic not found for schema: ' + schemaId });
        return res.status(200).json(doc);
      }
      // No filter — return all
      const docs = await collection.find({}).toArray();
      return res.status(200).json(docs);
    } catch (error) {
      console.error('MongoDB Scoring Logic Load Error:', error);
      return res.status(500).json({ error: 'Failed to load scoring logic', detail: error.message });
    }
  }

  // ─── POST (auth required) ──────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!data.id) return res.status(400).json({ error: 'Scoring logic must have an "id" field' });
      if (!data.schemaId) return res.status(400).json({ error: 'Scoring logic must have a "schemaId" linking to a report-schema' });
      await collection.replaceOne({ id: data.id }, data, { upsert: true });
      return res.status(200).json({ success: true, id: data.id });
    } catch (error) {
      console.error('MongoDB Scoring Logic Save Error:', error);
      return res.status(500).json({ error: 'Failed to save scoring logic', detail: error.message });
    }
  }

  // ─── DELETE (auth required) ─────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!requireAuth(req, res)) return;
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: '"id" query param is required' });
    try {
      const result = await collection.deleteOne({ id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Scoring logic not found' });
      return res.status(200).json({ success: true, deleted: id });
    } catch (error) {
      console.error('MongoDB Scoring Logic Delete Error:', error);
      return res.status(500).json({ error: 'Failed to delete scoring logic', detail: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
