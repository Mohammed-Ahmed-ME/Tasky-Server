import nodemailer from 'nodemailer'
require('dotenv').config();

// Method 1: Using App Password (Recommended for personal use)
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Your Gmail address
            pass: process.env.GMAIL_APP_PASSWORD // Your App Password
        }
    });
};

// Method 2: Using OAuth2 (More secure for production)
const createOAuthTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_USER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: process.env.GMAIL_ACCESS_TOKEN
        }
    });
};

// Simple email sending function
const sendEmail = async (to, subject, text, html = null) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Your Name" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html || text
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Verification email function
const sendVerificationEmail = async (userEmail, verificationCode) => {
    const subject = 'Email Verification Code';
    const text = `Your verification code is: ${verificationCode}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">
                    ${verificationCode}
                </h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

// Password reset email function
const sendPasswordResetEmail = async (userEmail, resetToken) => {
    const resetUrl = `https://yourdomain.com/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const text = `Click the following link to reset your password: ${resetUrl}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="background-color: #007bff; color: white; padding: 15px 25px;
                          text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Reset Password
                </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

// Example usage
const main = async () => {
    try {
        // Send verification email
        await sendVerificationEmail('user@example.com', '12345');

        // Send password reset email
        await sendPasswordResetEmail('user@example.com', 'reset-token-123');

        // Send custom email
        await sendEmail(
            'recipient@example.com',
            'Welcome to Our App',
            'Thank you for signing up!',
            '<h1>Welcome!</h1><p>Thank you for signing up for our app.</p>'
        );

    } catch (error) {
        console.error('Failed to send email:', error);
    }
};

// Export functions for use in other files
module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
};

// Uncomment to test
// main();