/**
 * Validates Stance dashboard JWTs for report-builder API routes.
 * Set AUTH_SECRET to the same value used by stance_dashboard (AUTH_SECRET).
 */
const jwt = require('jsonwebtoken');

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

/**
 * Returns the decoded token payload, or sends 401 and returns null.
 */
function requireAuth(req, res) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error('AUTH_SECRET is not configured');
    res.status(500).json({ error: 'Auth not configured' });
    return null;
  }

  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (!decoded || !decoded.sub) {
      res.status(401).json({ error: 'Invalid token' });
      return null;
    }
    return decoded;
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ error: message });
    return null;
  }
}

module.exports = { requireAuth, extractBearerToken };
