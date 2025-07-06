import express from 'express';
import User from '../Module/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authToken } from "../middleware/auth.js";

const user = express.Router();

// JWT secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// Login route
user.post('/Login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            message: 'Login successful',
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register route
user.post('/Register', async (req, res) => {
    try {
        const { name, email, password, gender } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Basic email validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        // Create new user (password will be hashed by pre-save middleware)
        const newUser = new User({
            name,
            email,
            password:hashedPassword, // Will be hashed by your pre-save middleware
            gender
        });

        const savedUser = await newUser.save();

        // Generate JWT token
        const token = generateToken(savedUser._id);

        // Remove password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: 'Registration successful',
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user profile
user.get('/Profile', authToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile fetched successfully',
            user: user
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
user.put('/Update-User', authToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Remove fields that shouldn't be updated
        delete updates.password; // Password should not be updated directly
        delete updates._id; // Prevent updating _id
        delete updates.createdAt; // Prevent updating creation date
        delete updates.updatedAt; // This will be handled automatically

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update password
user.put('/Update-Password', authToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Get user with password
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user account
user.delete('/Delete-User', authToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password is required to delete account' });
        }

        // Get user with password to verify
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password before deletion
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: 'User account deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout route (optional - mainly for client-side token removal)
user.post('/Logout', authToken, async (req, res) => {
    try {
        // In a stateless JWT system, logout is typically handled client-side
        // You could implement a token blacklist here if needed
        res.status(200).json({
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default user;