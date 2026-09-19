const { getDb } = require('./_db');
const { randomUUID } = require('crypto');
const { requireAuth } = require('./_auth');

function isLocalhost(host) {
  const value = String(host || '').toLowerCase();
  return value === 'localhost' || value.startsWith('localhost:') ||
    value === '127.0.0.1' || value.startsWith('127.0.0.1:') ||
    value === '[::1]' || value.startsWith('[::1]:');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAuth(req, res)) return;

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const host = req.headers['x-forwarded-host'] || req.headers.host;

    // The hosted PDF service runs outside this machine and cannot access a
    // developer's private localhost server. The browser uses window.print()
    // for local report-builder sessions instead.
    if (isLocalhost(host)) {
      return res.status(409).json({
        error: 'Local PDF export uses the browser print dialog',
        code: 'LOCAL_PRINT_REQUIRED',
      });
    }

    const sessionId = randomUUID();
    const db = await getDb();
    await db.collection('report-data').insertOne({
      ...data,
      sessionId,
      createdAt: new Date().toISOString(),
    });

    const reportUrl = `https://${host}/STANCE%20Assessment%20Report%20Builder.dc.html?autoload=${sessionId}`;

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
