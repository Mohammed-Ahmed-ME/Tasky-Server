import express from 'express';
import crypto from 'crypto';
import { sendEmail, sendVerificationEmail, sendPasswordResetEmail } from '../Config/Maile.js';

const email = express.Router();

// Generate random verification code
const generateVerificationCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

// Generate random reset token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Send verification email route
email.post('/send-verification', async (req, res) => {
    try {
        const { email: userEmail } = req.body;
        
        if (!userEmail) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const verificationCode = generateVerificationCode();
        
        // TODO: Save verification code to database with expiration time
        // await saveVerificationCode(userEmail, verificationCode, 10); // 10 minutes
        
        await sendVerificationEmail(userEmail, verificationCode);
        
        res.status(200).json({
            message: 'Verification email sent successfully',
            // Don't send the actual code in production
            code: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ error: 'Failed to send verification email' });
    }
});

// Send password reset email route
email.post('/send-password-reset', async (req, res) => {
    try {
        const { email: userEmail } = req.body;
        
        if (!userEmail) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // TODO: Check if user exists in database
        // const user = await getUserByEmail(userEmail);
        // if (!user) {
        //     return res.status(404).json({ error: 'User not found' });
        // }
        
        const resetToken = generateResetToken();
        
        // TODO: Save reset token to database with expiration time
        // await saveResetToken(userEmail, resetToken, 60); // 1 hour
        
        await sendPasswordResetEmail(userEmail, resetToken);
        
        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ error: 'Failed to send password reset email' });
    }
});

// Verify email code route
email.post('/verify-email', async (req, res) => {
    try {
        const { email: userEmail, code } = req.body;
        
        if (!userEmail || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }
        
        // TODO: Check verification code from database
        // const isValid = await verifyCode(userEmail, code);
        // if (!isValid) {
        //     return res.status(400).json({ error: 'Invalid or expired verification code' });
        // }
        
        // TODO: Mark email as verified
        // await markEmailAsVerified(userEmail);
        
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
});

// Generic email sending route
email.post('/send-email', async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;
        
        if (!to || !subject || !text) {
            return res.status(400).json({ error: 'To, subject, and text are required' });
        }
        
        await sendEmail(to, subject, text, html);
        
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

export default email;