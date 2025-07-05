import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Validation middleware
const validateRegistration = [
    body('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Mock users array (replace with database)
const users = [
    {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password" hashed
        createdAt: new Date().toISOString(),
    },
];

// Register endpoint
router.post('/register', authLimiter, validateRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array(),
            });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists with this email or username',
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);

        // Generate JWT token
        const token = generateToken(newUser);

        // Remove password from response
        const userResponse = { ...newUser };
        delete userResponse.password;

        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse,
            token,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
});

// Login endpoint
router.post('/login', authLimiter, validateLogin, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
        });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({
                error: 'Internal server error',
            });
        }

        if (!user) {
            return res.status(401).json({
                error: info.message || 'Invalid credentials',
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            user,
            token,
        });
    })(req, res, next);
});

// Logout endpoint
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                error: 'Error logging out',
            });
        }
        res.json({
            message: 'Logout successful',
        });
    });
});

// Get current user endpoint
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        user: req.user,
    });
});

// Refresh token endpoint
router.post('/refresh', passport.authenticate('jwt', { session: false }), (req, res) => {
    const token = generateToken(req.user);

    res.json({
        message: 'Token refreshed successfully',
        token,
    });
});

// Change password endpoint
router.put('/change-password',
    passport.authenticate('jwt', { session: false }),
    [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array(),
                });
            }

            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            // Find user with password
            const user = users.find(u => u.id === userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    error: 'Current password is incorrect',
                });
            }

            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update user password
            user.password = hashedNewPassword;

            res.json({
                message: 'Password changed successfully',
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                error: 'Internal server error',
            });
        }
    }
);

export default router;