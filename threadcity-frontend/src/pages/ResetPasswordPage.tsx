import React from 'react';
import { useParams } from 'react-router-dom';
import ResetPassword from '../components/auth/ResetPassword';
import ErrorMessage from '../components/common/ErrorMessage';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="auth-container">
          <h2>Reset Password Error</h2>
          <ErrorMessage message="Invalid reset link. Please request a new password reset." />
          <div className="auth-links">
            <a href="/forgot-password">Go to Forgot Password</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="auth-container">
        <ResetPassword />
      </div>
    </div>
  );
};

export default ResetPasswordPage;