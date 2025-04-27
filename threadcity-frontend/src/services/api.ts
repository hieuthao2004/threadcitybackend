import axios from 'axios';

const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example API calls
export const fetchPosts = async () => {
  const response = await api.get('/posts');
  return response.data;
};

export const fetchPostById = async (postId) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data;
};

export const updatePost = async (postId, postData) => {
  const response = await api.put(`/posts/${postId}`, postData);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};