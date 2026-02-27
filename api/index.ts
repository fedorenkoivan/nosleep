import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import Express app directly from back-end (will be compiled by Vercel)
// @ts-ignore
import app from '../back-end/server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[Vercel API] Request:', req.method, req.url);
    
    // Remove /api prefix from URL for Express
    const originalUrl = req.url;
    if (req.url?.startsWith('/api')) {
      req.url = req.url.substring(4);
      console.log('[Vercel API] URL rewrite:', originalUrl, '->', req.url);
    }
    
    console.log('[Vercel API] Forwarding to Express:', req.method, req.url);
    
    // Forward request to Express
    // @ts-ignore - Vercel Request/Response are compatible with Express
    return app(req, res);
    
  } catch (error) {
    console.error('[Vercel API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
