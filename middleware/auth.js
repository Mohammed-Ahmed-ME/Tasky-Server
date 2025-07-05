import jwt from 'jsonwebtoken';
import passport from 'passport';

// JWT Authentication middleware
export const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({
                error: 'Authentication error',
                message: 'Internal server error during authentication',
            });
        }

        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token',
            });
        }

        req.user = user;
        next();
    })(req, res, next);
};

// Optional JWT Authentication middleware (doesn't fail if no token)
export const authenticateJWTOptional = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: 'Authentication error',
                message: 'Internal server error during authentication',
            });
        }

        // Set user if found, but don't fail if not
        if (user) {
            req.user = user;
        }

        next();
    })(req, res, next);
};

// Role-based authorization middleware
export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        // If no roles specified, just check if user is authenticated
        if (roles.length === 0) {
            return next();
        }

        // Check if user has required role
        const userRole = req.user.role || 'user';
        if (!roles.includes(userRole)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions',
            });
        }

        next();
    };
};

// Check if user owns the resource
export const checkOwnership = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

        if (!resourceUserId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Resource user ID not provided',
            });
        }

        if (parseInt(resourceUserId) !== req.user.id) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only access your own resources',
            });
        }

        next();
    };
};

// Validate JWT token manually (for special cases)
export const validateToken = (token) => {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
        );
        return { isValid: true, decoded };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
};

// Extract token from request headers
export const extractToken = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
};

// Middleware to log authentication attempts
export const logAuthAttempt = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] Auth attempt from ${ip} - ${userAgent}`);

    next();
};

// Middleware to check if user is active/verified
export const checkUserStatus = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
        });
    }

    // Check if user is active
    if (req.user.status === 'inactive') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Account is inactive',
        });
    }

    // Check if user is verified (if email verification is required)
    if (req.user.emailVerified === false) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Email verification required',
        });
    }

    next();
};

// Combined authentication and authorization middleware
export const requireAuth = (roles = []) => {
    return [
        authenticateJWT,
        checkUserStatus,
        authorize(roles),
    ];
};

export default {
    authenticateJWT,
    authenticateJWTOptional,
    authorize,
    checkOwnership,
    validateToken,
    extractToken,
    logAuthAttempt,
    checkUserStatus,
    requireAuth,
};