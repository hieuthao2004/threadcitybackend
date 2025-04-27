import apiClient from './api.service';
import socketService from './socket.service';
import { API_ROUTES, EVENTS } from '../utils/constants';
import { Post, CreatePostInput, UpdatePostInput } from '../types/post.types';

class PostService {
  async getAllPosts(page: number = 1, limit: number = 10): Promise<{
    posts: Post[];
    hasMore: boolean;
  }> {
    try {
      const response = await apiClient.get(
        `${API_ROUTES.POSTS.BASE}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch posts');
    }
  }

  async getPostById(postId: string): Promise<Post> {
    try {
      const response = await apiClient.get(`${API_ROUTES.POSTS.BASE}/${postId}`);
      return response.data.post;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch post');
    }
  }

  async createPost(postData: CreatePostInput): Promise<Post> {
    try {
      const response = await apiClient.post(API_ROUTES.POSTS.BASE, postData);
      return response.data.post;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create post');
    }
  }

  async updatePost(postId: string, postData: UpdatePostInput): Promise<Post> {
    try {
      const response = await apiClient.put(
        `${API_ROUTES.POSTS.BASE}/${postId}`,
        postData
      );
      return response.data.post;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update post');
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await apiClient.delete(`${API_ROUTES.POSTS.BASE}/${postId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete post');
    }
  }

  async likePost(postId: string): Promise<void> {
    try {
      await apiClient.post(`${API_ROUTES.POSTS.BASE}/${postId}/like`);
      socketService.emit(EVENTS.LIKE_POST, { postId });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to like post');
    }
  }

  async unlikePost(postId: string): Promise<void> {
    try {
      await apiClient.delete(`${API_ROUTES.POSTS.BASE}/${postId}/like`);
      socketService.emit(EVENTS.UNLIKE_POST, { postId });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unlike post');
    }
  }

  async getComments(postId: string, page: number = 1): Promise<{
    comments: any[];
    hasMore: boolean;
  }> {
    try {
      const response = await apiClient.get(
        `${API_ROUTES.POSTS.COMMENTS(postId)}?page=${page}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
  }

  async addComment(postId: string, content: string): Promise<any> {
    try {
      const response = await apiClient.post(API_ROUTES.POSTS.COMMENTS(postId), {
        content
      });
      return response.data.comment;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add comment');
    }
  }
}

export default new PostService();