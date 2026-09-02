/**
 * Local dev server for report-builder (no Vercel login required).
 * Serves export/export + routes /api/* to the serverless handlers.
 *
 * Usage: npm run dev
 */
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3006;
const STATIC_ROOT = path.join(__dirname, 'export', 'export');

const apiHandlers = {
  '/api/save': () => require('./api/save'),
  '/api/load': () => require('./api/load'),
  '/api/pdf': () => require('./api/pdf'),
  '/api/schema': () => require('./api/schema'),
  '/api/scoring-logic': () => require('./api/scoring-logic'),
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' || Buffer.isBuffer(body) ? 'text/plain' : 'application/json',
    ...headers,
  });
  res.end(payload);
}

function wrapRes(res) {
  return {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      const code = this.statusCode || 200;
      send(res, code, data);
    },
    send(data) {
      const code = this.statusCode || 200;
      send(res, code, data);
    },
    setHeader(k, v) {
      res.setHeader(k, v);
    },
    end(...args) {
      res.end(...args);
    },
    writeHead(...args) {
      res.writeHead(...args);
    },
    statusCode: 200,
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return undefined;
  const ct = req.headers['content-type'] || '';
  if (ct.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

function serveStatic(reqPath, res) {
  let rel = decodeURIComponent(reqPath.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const filePath = path.normalize(path.join(STATIC_ROOT, rel));
  if (!filePath.startsWith(STATIC_ROOT)) {
    send(res, 403, { error: 'Forbidden' });
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    send(res, 404, { error: 'Not found' });
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    const pathname = url.pathname;

    const loader = apiHandlers[pathname];
    if (loader) {
      const handler = loader();
      const query = Object.fromEntries(url.searchParams.entries());
      const body = ['POST', 'PUT', 'PATCH'].includes(req.method || '')
        ? await readBody(req)
        : undefined;
      const vercelReq = Object.assign(req, { query, body });
      const vercelRes = wrapRes(res);
      await handler(vercelReq, vercelRes);
      return;
    }

    serveStatic(pathname, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) send(res, 500, { error: 'Server error', detail: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`\nReport Builder local: http://localhost:${PORT}`);
  console.log(`Open that URL in the browser (not the .html file).\n`);
  if (!process.env.AUTH_SECRET) console.warn('WARNING: AUTH_SECRET is missing in .env');
  if (!process.env.MONGO_URI) console.warn('WARNING: MONGO_URI is missing in .env');
});
