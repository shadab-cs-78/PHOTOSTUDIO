/**
 * VERCEL SERVERLESS FUNCTION: /api/request-access
 * Fallback access request submissions & approvals
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { album_slug, email, reason } = req.body || {};
    return res.status(201).json({
      success: true,
      message: 'Access request queued for photographer review',
      request_id: 'req_' + Date.now()
    });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      requests: [
        { id: 'r1', email: 'rohit.sharma@gmail.com', album_slug: 'alia-ranbir', reason: "Groom's childhood school friend", status: 'pending', created_at: new Date().toISOString() }
      ]
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
