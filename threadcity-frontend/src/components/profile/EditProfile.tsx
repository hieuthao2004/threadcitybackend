// components/profile/EditProfile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useImageUpload } from '../../hooks/useImageUpload';
import ErrorMessage from '../common/ErrorMessage';
import userService from '../../services/user.service';

const EditProfile: React.FC = () => {
  const { currentUser, updateUser, loading: authLoading } = useAuth();
  const { 
    handleAvatarUpload, 
    uploadedImageUrl, 
    isUploading, 
    uploadError, 
    resetUploadState 
  } = useImageUpload();
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    email: ''
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username,
        bio: currentUser.bio || '',
        email: currentUser.email
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (uploadedImageUrl) {
      handleUpdateAvatar();
    }
  }, [uploadedImageUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const updatedUser = await userService.updateProfile({
        username: formData.username,
        bio: formData.bio
      });
      
      updateUser(updatedUser);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await userService.updatePassword(currentPassword, newPassword);
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!uploadedImageUrl) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await userService.updateAvatar(uploadedImageUrl);
      updateUser(updatedUser);
      
      resetUploadState();
      setSuccess('Profile picture updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    handleAvatarUpload(files[0]);
  };

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      
      {success && <div className="success-message">{success}</div>}
      {error && <ErrorMessage message={error} />}
      
      <div className="avatar-upload-section">
        <h3>Profile Picture</h3>
        <div className="avatar-container">
          {currentUser?.profilePicture ? (
            <img 
              src={currentUser.profilePicture} 
              alt={currentUser.username} 
              className="profile-avatar"
            />
          ) : (
            <div className="default-avatar large">
              {currentUser?.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <input
          type="file"
          id="avatar"
          onChange={handleImageSelect}
          accept="image/*"
          className="file-input"
        />
        <label htmlFor="avatar" className="file-label">
          {isUploading ? 'Uploading...' : 'Change Picture'}
        </label>
        
        {uploadError && <ErrorMessage message={uploadError} />}
      </div>
      
      <form onSubmit={handleSubmit}>
        <h3>Profile Information</h3>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
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
            disabled={true} // Email cannot be changed
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            disabled={loading}
          ></textarea>
        </div>
        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      
      <form onSubmit={handlePasswordSubmit} className="password-form">
        <h3>Change Password</h3>
        
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
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
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;