import api from './api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  msg: string;
}

// Auth service for handling authentication-related API calls
const AuthService = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/register', data);
    return response.data;
  },

  // Login with existing credentials
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth', data);
    return response.data;
  },

  // Logout current user
  logout: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/logout');
    return response.data;
  },

  // Check if user is authenticated
  checkAuth: async (): Promise<boolean> => {
    try {
      await api.get('/protected');
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default AuthService;