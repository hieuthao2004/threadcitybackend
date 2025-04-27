import { EVENTS } from '../events.js';
import UsersModel from '../../models/UsersModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure email transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const forgotPasswordHandler = (io, socket) => {
  const usersModel = new UsersModel();

  // Request password reset
  socket.on(EVENTS.REQUEST_PASSWORD_RESET, async (data) => {
    try {
      const { email } = data;
      
      if (!email) {
        return socket.emit(EVENTS.PASSWORD_RESET_REQUEST, { 
          success: false, 
          message: 'Email is required'
        });
      }
      
      // Find user by email using the model method
      const user = await usersModel.findUserByEmail(email);
      
      if (!user) {
        // For security, don't reveal if email exists or not
        return socket.emit(EVENTS.PASSWORD_RESET_REQUEST, { 
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
      
      socket.emit(EVENTS.PASSWORD_RESET_REQUEST, { 
        success: true, 
        message: 'If your email is registered, you will receive reset instructions'
      });
      
    } catch (error) {
      console.error('Error in password reset request:', error);
      socket.emit(EVENTS.PASSWORD_RESET_REQUEST, { 
        success: false, 
        message: 'An error occurred while processing your request'
      });
    }
  });

  // Verify reset token
  socket.on(EVENTS.VERIFY_RESET_TOKEN, async (data) => {
    try {
      const { token } = data;
      
      if (!token) {
        return socket.emit(EVENTS.TOKEN_VERIFICATION, { 
          success: false, 
          message: 'Reset token is required' 
        });
      }
      
      // Use the model method to verify the token
      const user = await usersModel.verifyPasswordResetToken(token);
      
      if (!user) {
        return socket.emit(EVENTS.TOKEN_VERIFICATION, { 
          success: false, 
          message: 'Invalid or expired reset token' 
        });
      }
      
      socket.emit(EVENTS.TOKEN_VERIFICATION, { 
        success: true, 
        message: 'Token verified successfully',
        username: user.u_username
      });
      
    } catch (error) {
      console.error('Error verifying reset token:', error);
      socket.emit(EVENTS.TOKEN_VERIFICATION, { 
        success: false, 
        message: 'Failed to verify reset token' 
      });
    }
  });

  // Reset password
  socket.on(EVENTS.RESET_PASSWORD, async (data) => {
    try {
      const { token, newPassword } = data;
      
      if (!token || !newPassword) {
        return socket.emit(EVENTS.PASSWORD_RESET, { 
          success: false, 
          message: 'Token and new password are required' 
        });
      }
      
      // Password validation
      if (newPassword.length < 8) {
        return socket.emit(EVENTS.PASSWORD_RESET, { 
          success: false, 
          message: 'Password must be at least 8 characters long' 
        });
      }
      
      // Verify token is valid and not expired using model method
      const user = await usersModel.verifyPasswordResetToken(token);
      
      if (!user) {
        return socket.emit(EVENTS.PASSWORD_RESET, { 
          success: false, 
          message: 'Invalid or expired reset token' 
        });
      }
      
      // Reset the password using model method
      await usersModel.resetPassword(user.id, newPassword);
      
      socket.emit(EVENTS.PASSWORD_RESET, { 
        success: true, 
        message: 'Password has been reset successfully' 
      });
      
    } catch (error) {
      console.error('Error resetting password:', error);
      socket.emit(EVENTS.PASSWORD_RESET, { 
        success: false, 
        message: 'Failed to reset password' 
      });
    }
  });
};

export default forgotPasswordHandler;