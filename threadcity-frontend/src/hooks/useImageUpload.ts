import { useState } from 'react';
import socketService from '../services/socket.service';
import { EVENTS } from '../utils/constants';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);

  const handleAvatarUpload = (file: File) => {
    if (!file) return;
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('Image must be less than 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      setUploadError('Only JPEG, PNG and GIF images are allowed');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    // Convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      const base64Data = reader.result as string;
      
      // Upload using socket
      socketService.emit(EVENTS.UPLOAD_AVATAR, { 
        image: base64Data,
        fileName: file.name
      });
      
      // Listen for response
      socketService.on('avatar_uploaded', (response) => {
        if (response.success) {
          setUploadedImageUrl(response.url);
          setPublicId(response.publicId);
        } else {
          setUploadError(response.message || 'Failed to upload image');
        }
        setIsUploading(false);
        
        // Remove listener
        socketService.off('avatar_uploaded');
      });
    };
    
    reader.onerror = () => {
      setUploadError('Error reading file');
      setIsUploading(false);
    };
  };

  const handlePostImageUpload = (file: File) => {
    if (!file) return;
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('Image must be less than 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      setUploadError('Only JPEG, PNG and GIF images are allowed');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    // Convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      const base64Data = reader.result as string;
      
      // Upload using socket
      socketService.emit(EVENTS.UPLOAD_POST_IMAGE, { 
        image: base64Data,
        fileName: file.name
      });
      
      // Listen for response
      socketService.on('post_image_uploaded', (response) => {
        if (response.success) {
          setUploadedImageUrl(response.url);
          setPublicId(response.publicId);
        } else {
          setUploadError(response.message || 'Failed to upload image');
        }
        setIsUploading(false);
        
        // Remove listener
        socketService.off('post_image_uploaded');
      });
    };
    
    reader.onerror = () => {
      setUploadError('Error reading file');
      setIsUploading(false);
    };
  };

  const resetUploadState = () => {
    setUploadedImageUrl(null);
    setPublicId(null);
    setUploadError(null);
  };

  return {
    handleAvatarUpload,
    handlePostImageUpload,
    uploadedImageUrl,
    publicId,
    isUploading,
    uploadError,
    resetUploadState
  };
}