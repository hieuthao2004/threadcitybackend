import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { validateEmail } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../common/ErrorMessage';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password">
        <h2>Reset Email Sent</h2>
        <div className="success-message">
          <p>If an account exists with the email {email}, you will receive password reset instructions.</p>
        </div>
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password">
      <h2>Forgot Password</h2>
      <p>Enter your email address below and we'll send you password reset instructions.</p>
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      
      <div className="auth-links">
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;