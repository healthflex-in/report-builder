const { getDb } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const db = await getDb();
    const doc = await db.collection('report-data')
      .find({ email })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    if (!doc) return res.status(404).json({ error: 'No report found for this email' });
    res.status(200).json(doc);
  } catch (error) {
    console.error('MongoDB Load Error:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
};
