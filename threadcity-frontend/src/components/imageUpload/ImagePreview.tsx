import React from 'react';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, onRemove }) => {
  return (
    <div className="image-preview">
      <img src={imageUrl} alt="Preview" className="preview-image" />
      
      <button 
        type="button"
        onClick={onRemove}
        className="remove-button"
        aria-label="Remove image"
      >
        &times;
      </button>
    </div>
  );
};

export default ImagePreview;