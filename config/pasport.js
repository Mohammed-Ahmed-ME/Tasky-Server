import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Mock user database (replace with your actual database)
const users = [
    {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password" hashed
    },
];

// Local Strategy for username/password login
passport.use(new LocalStrategy(
    {
        usernameField: 'email', // Use email instead of username
        passwordField: 'password',
    },
    async (email, password, done) => {
        try {
            // Find user by email (replace with database query)
            const user = users.find(u => u.email === email);

            if (!user) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            // Return user without password
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;

            return done(null, userWithoutPassword);
        } catch (error) {
            return done(error);
        }
    }
));

// JWT Strategy for protected routes
passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    },
    async (payload, done) => {
        try {
            // Find user by ID (replace with database query)
            const user = users.find(u => u.id === payload.id);

            if (!user) {
                return done(null, false);
            }

            // Return user without password
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;

            return done(null, userWithoutPassword);
        } catch (error) {
            return done(error);
        }
    }
));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        // Find user by ID (replace with database query)
        const user = users.find(u => u.id === id);

        if (!user) {
            return done(null, false);
        }

        // Return user without password
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;

        done(null, userWithoutPassword);
    } catch (error) {
        done(error);
    }
});

export default passport;