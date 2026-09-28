/**
 * PHOTOVAULT - Local Zero-Dependency Development Server
 * Runs out of the box with `node local-server.js` (No external npm install required!)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // API Routes simulation
  if (pathname.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (pathname === '/api/stats') {
      return res.end(JSON.stringify({
        total_albums: 6,
        total_photos: 2840,
        storage: { total_quota_gb: 50.0, used_gb: 12.9, free_gb: 37.1 }
      }));
    }
    return res.end(JSON.stringify({ success: true, message: 'Local API OK' }));
  }

  // Rewrite /a/:slug to /a/index.html?slug=:slug
  if (pathname.startsWith('/a/') && pathname !== '/a/' && pathname !== '/a/index.html') {
    const slug = pathname.replace('/a/', '').split('/')[0];
    pathname = '/a/index.html';
  }

  // Default to index.html for root
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try appending .html
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end(`<h2>404 - Page Not Found</h2><p><a href="/">Return to Home</a></p>`);
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`✨ PHOTOVAULT — Wedding Photo Delivery Portal running!`);
  console.log(`🌐 Public Index:       http://localhost:${PORT}`);
  console.log(`📷 Client Gallery:     http://localhost:${PORT}/a/alia-ranbir`);
  console.log(`👑 Admin Dashboard:    http://localhost:${PORT}/admin/dashboard.html`);
  console.log(`=============================================================\n`);
});
