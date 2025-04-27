import React from 'react';
import Login from '../components/auth/Login';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="auth-container">
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;