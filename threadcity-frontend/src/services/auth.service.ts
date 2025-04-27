import apiClient from './api.service';
import { API_ROUTES } from '../utils/constants';
import { User } from '../types/user.types';
import { LoginCredentials, RegisterCredentials, ResetPasswordCredentials } from '../types/auth.types';

class AuthService {
  async login(username: string, password: string): Promise<any> {
    try {
      const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, { username, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  }

  async register(userData: RegisterCredentials): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(API_ROUTES.AUTH.REGISTER, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ROUTES.AUTH.LOGOUT);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }

  async getUserProfile(): Promise<User> {
    try {
      const response = await apiClient.get(API_ROUTES.AUTH.PROFILE);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }

  async updateProfile(userData: any): Promise<User> {
    try {
      const response = await apiClient.put(API_ROUTES.AUTH.PROFILE, userData);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<any> {
    try {
      const response = await apiClient.put(`${API_ROUTES.AUTH.PROFILE}/password`, { 
        currentPassword, 
        newPassword 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update password');
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await apiClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    try {
      const response = await apiClient.post(API_ROUTES.AUTH.RESET_PASSWORD, { 
        token, 
        newPassword 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }

  async verifyResetToken(token: string): Promise<any> {
    try {
      const response = await apiClient.get(`${API_ROUTES.AUTH.VERIFY_RESET_TOKEN}?token=${token}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Invalid or expired token');
    }
  }
}

export default new AuthService();