import apiClient from './api.service';
import socketService from './socket.service';
import { API_ROUTES, EVENTS } from '../utils/constants';

class FollowService {
  async followUser(userId: string, username?: string): Promise<any> {
    try {
      const response = await apiClient.post(`/api/users/${userId}/follow`);
      
      // Emit socket event
      socketService.emit(EVENTS.FOLLOW_USER, { 
        targetId: userId,
        targetUsername: username 
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to follow user');
    }
  }

  async unfollowUser(userId: string): Promise<any> {
    try {
      const response = await apiClient.delete(`/api/users/${userId}/follow`);
      
      // Emit socket event
      socketService.emit(EVENTS.UNFOLLOW_USER, { targetId: userId });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unfollow user');
    }
  }

  async getFollowers(userId: string, page: number = 1): Promise<any> {
    try {
      const response = await apiClient.get(`/api/users/${userId}/followers?page=${page}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch followers');
    }
  }

  async getFollowing(userId: string, page: number = 1): Promise<any> {
    try {
      const response = await apiClient.get(`/api/users/${userId}/following?page=${page}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch following');
    }
  }
}

export default new FollowService();