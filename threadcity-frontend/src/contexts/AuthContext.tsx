import React, { createContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/auth.service';
import { User } from '../types/user.types';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<User>;
  register: (userData: RegisterCredentials) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  verifyResetToken: (token: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    currentUser: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const user = await authService.getUserProfile();
          setState(prev => ({ ...prev, currentUser: user }));
        }
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authService.login(username, password);
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      setState(prev => ({ ...prev, currentUser: response.user, loading: false }));
      return response.user;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  const register = async (userData: RegisterCredentials): Promise<any> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authService.register(userData);
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await authService.logout();
      localStorage.removeItem('token');
      setState({ currentUser: null, loading: false, error: null });
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  const updateUser = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const verifyResetToken = async (token: string): Promise<any> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authService.verifyResetToken(token);
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<any> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authService.resetPassword(token, newPassword);
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  const forgotPassword = async (email: string): Promise<any> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authService.forgotPassword(email);
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...state, 
        login,
        register,
        logout,
        updateUser,
        verifyResetToken,
        resetPassword,
        forgotPassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};