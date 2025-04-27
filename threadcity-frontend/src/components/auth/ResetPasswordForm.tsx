import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api'; // Adjust the import path as necessary

function ResetPasswordForm() {
  const { resetToken } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [username, setUsername] = useState('');

  // Verify token when component loads
  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      try {
        const response = await api.post('/verify-reset-token', { resetToken });
        const data = response.data;

        if (data.success) {
          setIsVerified(true);
          setUsername(data.username);
        } else {
          setMessage(data.message || 'Invalid or expired reset link');
        }
      } catch (error) {
        setMessage('Failed to verify reset token');
      } finally {
        setIsLoading(false);
      }
    };

    if (resetToken) {
      verifyToken();
    }
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/reset-password', {
        resetToken,
        newPassword,
      });
      const data = response.data;

      if (data.success) {
        setMessage('Password reset successful! You can now login with your new password.');
      } else {
        setMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isVerified) {
    return (
      <div>
        <h2>Invalid Reset Link</h2>
        <p>{message || 'This password reset link is invalid or has expired.'}</p>
        <a href="/forgot-password">Request a new password reset</a>
      </div>
    );
  }

  return (
    <div>
      <h2>Reset Your Password</h2>
      <p>Hi {username}, please enter your new password below.</p>

      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordForm;