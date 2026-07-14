const { getDb } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, sessionId } = req.query;
  if (!email && !sessionId) {
    return res.status(400).json({ error: 'Email or sessionId is required' });
  }

  try {
    const db = await getDb();
    const query = sessionId ? { sessionId } : { email };
    const doc = await db.collection('report-data')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    if (!doc) return res.status(404).json({ error: 'No report found' });
    res.status(200).json(doc);
  } catch (error) {
    console.error('MongoDB Load Error:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
};
