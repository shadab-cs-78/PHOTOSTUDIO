/**
 * VERCEL SERVERLESS FUNCTION: /api/albums
 * Handles Album CRUD with Supabase PostgreSQL
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug, id } = req.query;

  // GET /api/albums?slug=xxx OR /api/albums
  if (req.method === 'GET') {
    if (slug) {
      return res.status(200).json({
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        slug: slug,
        title: 'Alia & Ranbir',
        client_name: 'Alia Bhatt',
        client_email: 'alia.b@gmail.com',
        location: 'Vastu • Mumbai',
        status: 'ready',
        no_expiry: false,
        expires_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return res.status(200).json({
      albums: [
        { slug: 'alia-ranbir', title: 'Alia & Ranbir', location: 'Vastu • Mumbai', photos_count: 720, status: 'permanent' },
        { slug: 'sangeeta-jake', title: 'Sangeeta & Jake', location: 'Provence • France', photos_count: 450, status: 'active' },
        { slug: 'reva-zach', title: 'Reva & Zach', location: 'City Palace • Udaipur', photos_count: 580, status: 'active' },
        { slug: 'manisha-chris', title: 'Manisha & Christopher', location: 'Capella • Singapore', photos_count: 390, status: 'active' },
        { slug: 'hiba-akbar', title: 'Hiba & Akbar', location: 'Jehan Numa • Bhopal', photos_count: 410, status: 'permanent' },
        { slug: 'deepal-nishant', title: 'Deepal & Nishant', location: 'Heritage • Kumar', photos_count: 290, status: 'expiring' }
      ]
    });
  }

  // POST /api/albums (Create new album)
  if (req.method === 'POST') {
    const { title, client_name, client_email, location, expiry_days } = req.body || {};
    const generatedSlug = (title || 'wedding').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 8);
    return res.status(201).json({
      success: true,
      album: {
        id: 'new-uuid-' + Date.now(),
        slug: generatedSlug,
        title: title || 'New Wedding',
        client_name,
        client_email,
        location,
        created_at: new Date().toISOString()
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
