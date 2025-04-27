import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import { validatePassword, validateConfirmPassword } from '../../utils/validators';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
  const { resetPassword, loading, verifyResetToken } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      
      try {
        const response = await verifyResetToken(token);
        if (response.success && response.username) {
          setUsername(response.username);
        } else {
          setError('Invalid or expired reset token. Please request a new one.');
        }
      } catch (err: any) {
        setError(err.message || 'Token verification failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, verifyResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Reset token is missing');
      return;
    }
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError(null);
      await resetPassword(token, newPassword);
      setIsSubmitted(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  if (isVerifying) {
    return <Loader />;
  }

  if (error && !username) {
    return (
      <div className="reset-password">
        <h2>Reset Password Error</h2>
        <ErrorMessage message={error} />
        <div className="auth-links">
          <a href="/forgot-password">Request a new password reset</a>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password">
      <h2>Reset Your Password</h2>
      
      {username && <p>Hi {username}, please enter your new password below.</p>}
      
      {isSubmitted ? (
        <div className="success-message">
          <p>Password reset successful!</p>
          <p>You will be redirected to the login page shortly.</p>
        </div>
      ) : (
        <>
          {error && <ErrorMessage message={error} />}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </div>
export default ResetPassword;