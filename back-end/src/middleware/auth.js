import { verifyToken } from '../services/authService.js';
/**
 * Middleware to verify JWT token from Authorization header
 */
export async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = await verifyToken(token);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    }
    catch (error) {
        res.status(401).json({
            error: 'Invalid or expired token',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
/**
 * Optional auth middleware - doesn't fail if no token provided
 */
export async function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = await verifyToken(token);
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
        }
        next();
    }
    catch (error) {
        // Ignore errors in optional auth
        next();
    }
}
