import React from 'react';

interface ImageUploaderProps {
  onSelectImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  error?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onSelectImage, 
  isUploading, 
  error 
}) => {
  return (
    <div className="image-uploader">
      <label className="upload-label">
        <input 
          type="file" 
          accept="image/*"
          onChange={onSelectImage}
          disabled={isUploading}
          className="file-input"
        />
        <div className="upload-button">
          {isUploading ? 'Uploading...' : 'Choose Image'}
        </div>
      </label>
      
      {error && <div className="upload-error">{error}</div>}
      
      <div className="upload-instruction">
        <p>Max file size: 5MB</p>
        <p>Supported formats: JPEG, PNG, GIF</p>
      </div>
    </div>
  );
};

export default ImageUploader;