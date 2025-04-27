import axios from 'axios';
import { User } from '../types/user.types';

const API_URL = '/api/users'; // Adjust the endpoint as necessary

export const getUserProfile = async (userId: string): Promise<User> => {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
};

export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await axios.put(`${API_URL}/${userId}`, userData);
    return response.data;
};

export const followUser = async (userId: string): Promise<void> => {
    await axios.post(`${API_URL}/${userId}/follow`);
};

export const unfollowUser = async (userId: string): Promise<void> => {
    await axios.post(`${API_URL}/${userId}/unfollow`);
};