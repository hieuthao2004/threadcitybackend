import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import NotificationsPage from './pages/NotificationsPage';
import Loader from './components/common/Loader';

const AppRoutes: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={!currentUser ? <ForgotPasswordPage /> : <Navigate to="/" replace />} />
      <Route path="/reset-password/:token" element={!currentUser ? <ResetPasswordPage /> : <Navigate to="/" replace />} />
      <Route path="/post/:postId" element={<PostDetailPage />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/edit-post/:postId" element={<PostDetailPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
      
      {/* Catch all - 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;