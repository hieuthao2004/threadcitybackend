import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../common/ErrorMessage';
import { validateUsername, validateEmail, validatePassword, validateConfirmPassword } from '../../utils/validators';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, loading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) {
      setError(confirmPasswordError);
      return;
    }
    
    try {
      setError(null);
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  if (isSubmitted) {
    return (
      <div className="register-form">
        <h2>Registration Successful</h2>
        <div className="success-message">
          <p>Your account has been created successfully!</p>
          <p>Please check your email to verify your account before logging in.</p>
        </div>
        <div className="auth-links">
          <Link to="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-form">
      <h2>Create an Account</h2>
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            disabled={loading}
          />
          <small>Password must be at least 8 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-links">
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;