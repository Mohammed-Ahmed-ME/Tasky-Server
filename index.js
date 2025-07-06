// server.js
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import Connect from "./Config/MongoDB.js";
import user from './routes/User.js';
import task from './routes/Task.js';

// Load environment variables
dotenv.config();

const app = express();

// Environment variables with defaults
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
    skipSuccessfulRequests: true,
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: '1.0.0',
        database: 'Connected', // You can add actual DB health check here
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to Tasky API',
        version: '1.0.0',
        environment: NODE_ENV,
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            tasks: '/api/tasks',
        },
        documentation: '/api/docs', // Future endpoint for API docs
    });
});

// API Routes
app.use('/Api/Auth/User', authLimiter, user);
app.use('/APi/Tasks', task);

// 404 handler - must be before error handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            status: 404,
            path: req.originalUrl,
            method: req.method,
        },
    });
});

// Global error handler - must be last
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    const statusCode = err.statusCode || 500;
    const message = NODE_ENV === 'production'
        ? 'Something went wrong!'
        : err.message;

    res.status(statusCode).json({
        error: {
            message,
            status: statusCode,
            timestamp: new Date().toISOString(),
            ...(NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down gracefully`);

    // Close database connection
    try {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
    }

    // Exit process
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
    try {
        await Connect().then(() => {
            app.listen(PORT, () => {console.log(`
🚀 Tasky Server is running!
📍 Environment: ${NODE_ENV}
🌐 Port: ${PORT}
🔗 Health Check: http://localhost:${PORT}/health
🛡️ Security: Helmet, CORS, Rate Limiting enabled
📊 Logging: Morgan (${NODE_ENV === 'production' ? 'combined' : 'dev'})
🔐 Auth Routes: /api/auth
📋 Task Routes: /api/tasks`);
            });
        })

    } catch (error) {
        console.error('❌ Failed to start server');
        process.exit(1);
    }
};

startServer();

export default app;