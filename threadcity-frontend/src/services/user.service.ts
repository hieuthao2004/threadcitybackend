import apiClient from './api.service';
import { API_ROUTES } from '../utils/constants';
import { User } from '../types/user.types';

class UserService {
  async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await apiClient.get(`${API_ROUTES.USERS.BASE}/${userId}`);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }

  async getUserByUsername(username: string): Promise<User> {
    try {
      const response = await apiClient.get(API_ROUTES.USERS.PROFILE(username));
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

  async updateAvatar(imageUrl: string): Promise<User> {
    try {
      const response = await apiClient.put(`${API_ROUTES.AUTH.PROFILE}/avatar`, {
        imageUrl
      });
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile picture');
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.put(`${API_ROUTES.AUTH.PROFILE}/password`, {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update password');
    }
  }

  async getUserPosts(username: string, page: number = 1, limit: number = 10): Promise<{
    posts: any[];
    hasMore: boolean;
  }> {
    try {
      const response = await apiClient.get(
        `${API_ROUTES.USERS.POSTS(username)}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }

  async getFollowers(username: string, page: number = 1): Promise<{
    users: User[];
    hasMore: boolean;
  }> {
    try {
      const response = await apiClient.get(
        `${API_ROUTES.USERS.FOLLOWERS(username)}?page=${page}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch followers');
    }
  }

  async getFollowing(username: string, page: number = 1): Promise<{
    users: User[];
    hasMore: boolean;
  }> {
    try {
      const response = await apiClient.get(
        `${API_ROUTES.USERS.FOLLOWING(username)}?page=${page}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch following');
    }
  }
}

export default new UserService();