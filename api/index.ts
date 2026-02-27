import type { VercelRequest, VercelResponse } from '@vercel/node';

// Lazy-loaded Express app instance
let expressApp: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize Express app on first request
    if (!expressApp) {
      console.log('[Vercel API] Loading Express app...');
      const serverModule = await import('./dist/server.js');
      expressApp = serverModule.default;
      console.log('[Vercel API] Express app loaded successfully');
    }
    
    // Remove /api prefix from URL for Express
    if (req.url?.startsWith('/api')) {
      req.url = req.url.substring(4);
    }
    
    // Forward request to Express
    // @ts-ignore - Vercel Request/Response are compatible with Express
    return expressApp(req, res);
    
  } catch (error) {
    console.error('[Vercel API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
