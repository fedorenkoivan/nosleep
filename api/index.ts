import type { VercelRequest, VercelResponse } from '@vercel/node';

// Lazy-loaded Express app instance
let expressApp: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[Vercel API] Incoming request:', {
      method: req.method,
      url: req.url,
      headers: req.headers
    });
    
    // Initialize Express app on first request
    if (!expressApp) {
      console.log('[Vercel API] Loading Express app...');
      try {
        const serverModule = await import('./dist/server.js');
        expressApp = serverModule.default;
        console.log('[Vercel API] Express app loaded successfully');
      } catch (loadError) {
        console.error('[Vercel API] Failed to load Express app:', loadError);
        throw loadError;
      }
    }
    
    // Remove /api prefix from URL for Express
    const originalUrl = req.url;
    if (req.url?.startsWith('/api')) {
      req.url = req.url.substring(4);
      console.log('[Vercel API] URL rewrite:', originalUrl, '->', req.url);
    }
    
    console.log('[Vercel API] Forwarding to Express:', req.method, req.url);
    
    // Forward request to Express
    // @ts-ignore - Vercel Request/Response are compatible with Express
    return expressApp(req, res);
    
  } catch (error) {
    console.error('[Vercel API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
