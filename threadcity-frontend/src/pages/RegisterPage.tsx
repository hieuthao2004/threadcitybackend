import React, { useState } from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  const [message, setMessage] = useState('');

  const handleRegisterSuccess = (msg) => {
    setMessage(msg);
  };

  return (
    <div>
      <h1>Register</h1>
      {message && <div className="alert">{message}</div>}
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </div>
  );
};

export default RegisterPage;