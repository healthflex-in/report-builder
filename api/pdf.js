const { getDb } = require('./_db');
const { randomUUID } = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const sessionId = randomUUID();
    const db = await getDb();
    await db.collection('report-data').insertOne({
      ...data,
      sessionId,
      createdAt: new Date().toISOString(),
    });

    const reportUrl = `https://reports.stance.health?autoload=${sessionId}`;

    const pdfRes = await fetch('https://devapi.stance.health/api/pdf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: reportUrl }),
    });

    if (!pdfRes.ok) {
      const err = await pdfRes.text();
      return res.status(502).json({ error: 'PDF service error', detail: err });
    }

    const { url } = await pdfRes.json();
    res.status(200).json({ url });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', detail: error.message });
  }
};
