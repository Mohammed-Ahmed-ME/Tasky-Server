import express from 'express'
import { sendEmail, sendVerificationEmail, sendPasswordResetEmail } from'../Config/Maile'
const Maile = express.Maile();

// Generate random verification code
const generateVerificationCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

// Generate random reset token
const generateResetToken = () => {
    return require('crypto').randomBytes(32).toString('hex');
};

// Send verification email route
Maile.post('/send-verification', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const verificationCode = generateVerificationCode();
        
        // Save verification code to database with expiration time
        // await saveVerificationCode(email, verificationCode, 10); // 10 minutes
        
        await sendVerificationEmail(email, verificationCode);
        
        res.json({ 
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
Maile.post('/send-password-reset', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Check if user exists in database
        // const user = await getUserByEmail(email);
        // if (!user) {
        //     return res.status(404).json({ error: 'User not found' });
        // }
        
        const resetToken = generateResetToken();
        
        // Save reset token to database with expiration time
        // await saveResetToken(email, resetToken, 60); // 1 hour
        
        await sendPasswordResetEmail(email, resetToken);
        
        res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ error: 'Failed to send password reset email' });
    }
});

// Verify email code route
Maile.post('/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }
        
        // Check verification code from database
        // const isValid = await verifyCode(email, code);
        // if (!isValid) {
        //     return res.status(400).json({ error: 'Invalid or expired verification code' });
        // }
        
        // Mark email as verified
        // await markEmailAsVerified(email);
        
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
});

// Generic email sending route
Maile.post('/send-email', async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;
        
        if (!to || !subject || !text) {
            return res.status(400).json({ error: 'To, subject, and text are required' });
        }
        
        await sendEmail(to, subject, text, html);
        
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = Maile;