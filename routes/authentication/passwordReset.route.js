import express from 'express';
import UsersModel from '../../models/UsersModel.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const usersModel = new UsersModel();

// Configure email transport
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Step 1: Request password reset (provide username and email)
router.post('/forgot-password', async (req, res) => {
    try {
        const { username, email } = req.body;
        
        if (!username || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide both username and email' 
            });
        }
        
        // Find user by username
        const user = await usersModel.findUser(username);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Verify email matches
        if (user.u_email !== email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email does not match our records for this username' 
            });
        }
        
        // Generate reset token
        const resetToken = await usersModel.createPasswordResetToken(user.id);
        
        // Create reset URL - For frontend to access
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        // Send email with reset link
        const mailOptions = {
            from: `ThreadCity <${process.env.EMAIL_USER}>`,
            to: user.u_email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>Hi ${user.u_username},</p>
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <a href="${resetURL}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link is valid for 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>ThreadCity Team</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Password reset link sent to your email' 
        });
        
    } catch (error) {
        console.error('Error in forgot password:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to process password reset request' 
        });
    }
});

// Step 2: Verify the reset token
router.post('/verify-reset-token', async (req, res) => {
    try {
        const { resetToken } = req.body;
        
        if (!resetToken) {
            return res.status(400).json({ 
                success: false, 
                message: 'Reset token is required' 
            });
        }
        
        // Verify token is valid and not expired
        const user = await usersModel.verifyPasswordResetToken(resetToken);
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset token' 
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            message: 'Token verified',
            username: user.u_username
        });
        
    } catch (error) {
        console.error('Error verifying reset token:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to verify reset token' 
        });
    }
});

// Step 3: Reset the password
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        
        if (!resetToken || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Reset token and new password are required' 
            });
        }
        
        // Password validation
        if (newPassword.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 8 characters long' 
            });
        }
        
        // Verify token is valid and not expired
        const user = await usersModel.verifyPasswordResetToken(resetToken);
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset token' 
            });
        }
        
        // Reset the password
        await usersModel.resetPassword(user.id, newPassword);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Password has been reset successfully' 
        });
        
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to reset password' 
        });
    }
});

export default router;