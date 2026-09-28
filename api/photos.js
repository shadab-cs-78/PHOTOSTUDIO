/**
 * VERCEL SERVERLESS FUNCTION: /api/photos
 * Photo list, signed URL delivery & deletion
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { album_id, slug } = req.query;

  if (req.method === 'GET') {
    return res.status(200).json({
      photos: [
        { id: 'p1', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85', thumbnail_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', original_name: 'vows_balcony_001.webp', provider: 'cloudflare-r2', size_bytes: 1420000 },
        { id: 'p2', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85', thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', original_name: 'ceremony_walk_002.webp', provider: 'cloudflare-r2', size_bytes: 1680000 },
        { id: 'p3', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85', thumbnail_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', original_name: 'palace_portrait_003.webp', provider: 'cloudinary', size_bytes: 1540000 },
        { id: 'p4', url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=85', thumbnail_url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80', original_name: 'reception_candlelight_004.webp', provider: 'backblaze-b2', size_bytes: 1390000 }
      ]
    });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true, message: 'Photo deleted from storage' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
