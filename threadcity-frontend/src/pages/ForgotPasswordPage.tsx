import React from 'react';
import ForgotPassword from '../components/auth/ForgotPassword';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="forgot-password-page">
      <div className="auth-container">
        <ForgotPassword />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;