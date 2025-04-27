import express from 'express';
import UsersModel from '../../models/UsersModel.js';
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

// Step 1: Request password reset (provide email)
router.post('/forgot_password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }
        
        // Find user by email using the model method
        const user = await usersModel.findUserByEmail(email);
        
        if (!user) {
            // For security reasons, don't reveal if email exists or not
            return res.status(200).json({ 
                success: true, 
                message: 'If your email is registered, you will receive reset instructions' 
            });
        }
        
        // Generate reset token using the model method
        const resetToken = await usersModel.createPasswordResetToken(user.id);
        
        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetURL = `${frontendUrl}/reset-password/${resetToken}`;
        
        // Send email
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
            message: 'If your email is registered, you will receive reset instructions' 
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
router.post('/verify_reset_token', async (req, res) => {
    try {
        const { resetToken } = req.body;
        
        if (!resetToken) {
            return res.status(400).json({ 
                success: false, 
                message: 'Reset token is required' 
            });
        }
        
        // Use the model method to verify the token
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
router.post('/reset_password', async (req, res) => {
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
        
        // Verify token is valid and not expired using model method
        const user = await usersModel.verifyPasswordResetToken(resetToken);
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset token' 
            });
        }
        
        // Reset the password using model method
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