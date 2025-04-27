import axios from 'axios';

const API_URL = '/api';

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const register = async (username, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, { username, email, password });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const resetPassword = async (resetToken, newPassword) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, { resetToken, newPassword });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};