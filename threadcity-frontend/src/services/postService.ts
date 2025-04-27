import axios from 'axios';

const API_URL = '/api/posts';

export const fetchPosts = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching posts');
    }
};

export const createPost = async (postData) => {
    try {
        const response = await axios.post(API_URL, postData);
        return response.data;
    } catch (error) {
        throw new Error('Error creating post');
    }
};

export const updatePost = async (postId, postData) => {
    try {
        const response = await axios.put(`${API_URL}/${postId}`, postData);
        return response.data;
    } catch (error) {
        throw new Error('Error updating post');
    }
};

export const deletePost = async (postId) => {
    try {
        const response = await axios.delete(`${API_URL}/${postId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error deleting post');
    }
};