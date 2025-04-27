// components/profile/AvatarUpload.tsx
import React, { useState } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import ErrorMessage from '../common/ErrorMessage';

interface AvatarUploadProps {
  currentAvatar?: string;
  username: string;
  onAvatarUpdated: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  username,
  onAvatarUpdated
}) => {
  const { 
    handleAvatarUpload, 
    uploadedImageUrl, 
    isUploading, 
    uploadError 
  } = useImageUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Show local preview
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload image
    handleAvatarUpload(file);
  };

  // When upload is complete, notify parent component
  React.useEffect(() => {
    if (uploadedImageUrl) {
      onAvatarUpdated(uploadedImageUrl);
    }
  }, [uploadedImageUrl, onAvatarUpdated]);

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {(previewUrl || currentAvatar) ? (
          <img 
            src={previewUrl || currentAvatar} 
            alt={`${username}'s avatar`} 
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            {username.charAt(0).toUpperCase()}
          </div>
        )}
        
        {isUploading && (
          <div className="upload-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      
      <div className="upload-controls">
        <input
          type="file"
          id="avatar-input"
          onChange={handleImageSelect}
          accept="image/*"
          className="file-input"
          disabled={isUploading}
        />
        <label htmlFor="avatar-input" className="upload-button">
          {currentAvatar ? 'Change Photo' : 'Upload Photo'}
        </label>
        
        {uploadError && <ErrorMessage message={uploadError} />}
      </div>
    </div>
  );
};

export default AvatarUpload;