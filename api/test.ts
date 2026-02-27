import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.json({ 
    status: 'ok',
    message: 'Simple test works!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
}
