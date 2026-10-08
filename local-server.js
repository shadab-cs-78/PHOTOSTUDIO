/**
 * PHOTOVAULT - Local Development Server with Full Real Dynamic API & Storage
 * Runs out of the box with `node local-server.js`
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Persistent in-memory / JSON store
const DB_FILE = path.join(__dirname, 'local_db.json');
let db = {
  albums: [
    {
      id: 'alb_demo_1',
      slug: 'alia-ranbir',
      title: 'Alia & Ranbir',
      client_email: 'alia.b@gmail.com',
      location: 'Vastu • Mumbai',
      category: 'wedding',
      guest_pin: '2026',
      status: 'ready',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  photos: {
    'alia-ranbir': [
      { id: 'p1', album_slug: 'alia-ranbir', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85', thumbnail_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', original_name: 'vows_balcony_001.webp', provider: 'cloudinary', size_bytes: 1420000, uploaded_at: new Date().toISOString() },
      { id: 'p2', album_slug: 'alia-ranbir', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85', thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', original_name: 'ceremony_walk_002.webp', provider: 'imagekit', size_bytes: 1680000, uploaded_at: new Date().toISOString() },
      { id: 'p3', album_slug: 'alia-ranbir', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85', thumbnail_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', original_name: 'palace_portrait_003.webp', provider: 'cloudinary', size_bytes: 1540000, uploaded_at: new Date().toISOString() }
    ]
  },
  logs: []
};

// Load saved local DB if exists
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {}
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {}
}

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

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // --------------------------------------------------------------------------
  // REAL DYNAMIC API ROUTING FOR LOCAL SERVER
  // --------------------------------------------------------------------------

  // 1. /api/albums
  if (pathname === '/api/albums' || pathname.startsWith('/api/albums/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const pathSlug = pathname.replace(/^\/api\/albums\/?/, '');
    const slug = pathSlug || parsedUrl.query.slug;

    if (req.method === 'GET') {
      if (slug) {
        const alb = db.albums.find(a => a.slug === slug);
        if (alb) return res.end(JSON.stringify(alb));
        return res.end(JSON.stringify({ error: 'Album not found' }));
      }
      return res.end(JSON.stringify({ albums: db.albums }));
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const { title, client_email, location, category, guest_pin = '2026', expiry_days = 7, storage_strategy = 'auto' } = body;
      const cleanSlug = (title || 'wedding')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 20) + '-' + Math.random().toString(36).substring(2, 6);

      const days = parseInt(expiry_days);
      const expiresAt = (days && days > 0) ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null;

      const newAlbum = {
        id: 'alb_' + Date.now(),
        slug: cleanSlug,
        title: title || 'New Wedding Monograph',
        client_email: client_email || 'client@gmail.com',
        location: location || 'Katni • M.P.',
        category: category || 'wedding',
        guest_pin: guest_pin || '2026',
        storage_strategy: storage_strategy || 'auto',
        status: 'ready',
        created_at: new Date().toISOString(),
        expires_at: expiresAt
      };

      db.albums.unshift(newAlbum);
      saveDb();
      return res.end(JSON.stringify({ success: true, album: newAlbum }));
    }

    if (req.method === 'DELETE') {
      if (slug) {
        db.albums = db.albums.filter(a => a.slug !== slug);
        delete db.photos[slug];
        saveDb();
      }
      return res.end(JSON.stringify({ success: true, message: 'Album deleted' }));
    }
  }

  // 2. /api/photos
  if (pathname === '/api/photos' || pathname.startsWith('/api/photos/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const pathSlug = pathname.replace(/^\/api\/photos\/?/, '');
    const slug = pathSlug || parsedUrl.query.slug;
    const photoId = parsedUrl.query.id;

    if (req.method === 'GET') {
      const photos = db.photos[slug] || [];
      return res.end(JSON.stringify({ photos: photos }));
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const { album_slug, url, thumbnail_url, original_name, provider = 'cloudinary', size_bytes = 0 } = body;

      const newPhoto = {
        id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        album_slug: album_slug,
        url: url,
        thumbnail_url: thumbnail_url || url,
        original_name: original_name || 'photo.webp',
        provider: provider,
        size_bytes: size_bytes,
        uploaded_at: new Date().toISOString()
      };

      if (!db.photos[album_slug]) db.photos[album_slug] = [];
      db.photos[album_slug].unshift(newPhoto);
      saveDb();
      return res.end(JSON.stringify({ success: true, photo: newPhoto }));
    }

    if (req.method === 'DELETE') {
      if (slug && db.photos[slug] && photoId) {
        db.photos[slug] = db.photos[slug].filter(p => p.id !== photoId);
        saveDb();
      }
      return res.end(JSON.stringify({ success: true, message: 'Photo deleted' }));
    }
  }

  // 3. /api/upload
  if (pathname === '/api/upload') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const body = await readBody(req);
    const { image_base64, size_bytes, storage_strategy = 'auto' } = body;
    let provider = 'cloudinary';
    if (storage_strategy === 'imagekit') provider = 'imagekit';
    else if (storage_strategy === 'supabase') provider = 'supabase';
    else if (storage_strategy === 'cloudinary_imagekit') provider = 'cloudinary';

    return res.end(JSON.stringify({
      success: true,
      provider: provider,
      url: image_base64 || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85',
      thumbnail_url: image_base64 || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
      size_bytes: size_bytes || 1200000
    }));
  }

  // 4. /api/stats (Real dynamic storage computation)
  if (pathname === '/api/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.method === 'POST') {
      const log = await readBody(req);
      db.logs.unshift(log);
      saveDb();
      return res.end(JSON.stringify({ success: true }));
    }

    let cldBytes = 0;
    let ikBytes = 0;
    let supaBytes = 0;
    let totalPhotos = 0;

    Object.values(db.photos || {}).forEach(photoList => {
      if (Array.isArray(photoList)) {
        photoList.forEach(p => {
          totalPhotos++;
          const bytes = Number(p.size_bytes) || 1200000;
          if (p.provider === 'imagekit') ikBytes += bytes;
          else if (p.provider === 'supabase' || p.provider === 'supabase-storage') supaBytes += bytes;
          else cldBytes += bytes; // default cloudinary
        });
      }
    });

    const cldGB = cldBytes / (1024 * 1024 * 1024);
    const ikGB = ikBytes / (1024 * 1024 * 1024);
    const supaGB = supaBytes / (1024 * 1024 * 1024);
    const totalGB = cldGB + ikGB + supaGB;

    return res.end(JSON.stringify({
      total_albums: db.albums.length,
      total_photos: totalPhotos,
      storage: {
        total_quota_gb: 46.0,
        used_gb: Number(totalGB.toFixed(3)),
        free_gb: Number((46.0 - totalGB).toFixed(3)),
        cloudinary: {
          limit_gb: 25.0,
          used_bytes: cldBytes,
          used_mb: Number((cldBytes / (1024 * 1024)).toFixed(2)),
          used_gb: Number(cldGB.toFixed(3)),
          percent: Number(((cldGB / 25.0) * 100).toFixed(1))
        },
        imagekit: {
          limit_gb: 20.0,
          used_bytes: ikBytes,
          used_mb: Number((ikBytes / (1024 * 1024)).toFixed(2)),
          used_gb: Number(ikGB.toFixed(3)),
          percent: Number(((ikGB / 20.0) * 100).toFixed(1))
        },
        supabase: {
          limit_gb: 1.0,
          used_bytes: supaBytes,
          used_mb: Number((supaBytes / (1024 * 1024)).toFixed(2)),
          used_gb: Number(supaGB.toFixed(3)),
          percent: Number(((supaGB / 1.0) * 100).toFixed(1))
        }
      },
      logs: db.logs || []
    }));
  }

  // Rewrite /a/:slug to /a/index.html
  if (pathname.startsWith('/a/') && pathname !== '/a/' && pathname !== '/a/index.html') {
    pathname = '/a/index.html';
  }

  // Default to index.html for root
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
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
  console.log(`✨ The Katni Creation — Client Delivery Portal Running!`);
  console.log(`🌐 Client Portal:      http://localhost:${PORT}`);
  console.log(`📷 Client Gallery:     http://localhost:${PORT}/a/alia-ranbir`);
  console.log(`👑 Admin Dashboard:    http://localhost:${PORT}/admin/dashboard.html`);
  console.log(`=============================================================\n`);
});
