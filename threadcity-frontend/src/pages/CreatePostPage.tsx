import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useImageUpload } from '../hooks/useImageUpload';
import postService from '../services/post.service';
import socketService from '../services/socket.service';
import { EVENTS } from '../utils/constants';
import ImageUploader from '../components/imageUpload/ImageUploader';
import ImagePreview from '../components/imageUpload/ImagePreview';
import ErrorMessage from '../components/common/ErrorMessage';

const CreatePostPage: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    handlePostImageUpload, 
    uploadedImageUrl, 
    isUploading, 
    uploadError, 
    resetUploadState 
  } = useImageUpload();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim() === '') {
      setError('Title is required');
      return;
    }
    
    if (content.trim() === '') {
      setError('Content is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const postData = {
        title,
        content,
        imageUrl: uploadedImageUrl || undefined
      };
      
      const createdPost = await postService.createPost(postData);
      
      // Emit socket event for real-time updates
      socketService.emit(EVENTS.POST_CREATED, {
        postId: createdPost.id,
        userId: currentUser?.id,
        username: currentUser?.username
      });
      
      // Navigate to the newly created post
      navigate(`/post/${createdPost.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    handlePostImageUpload(files[0]);
  };

  return (
    <div className="create-post-page">
      <div className="container">
        <h1>Create New Post</h1>
        
        {error && <ErrorMessage message={error} />}
        
        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              disabled={loading}
              required
            ></textarea>
          </div>
          
          <div className="form-group image-upload-section">
            <label>Image (Optional)</label>
            
            {uploadedImageUrl && (
              <ImagePreview 
                imageUrl={uploadedImageUrl} 
                onRemove={resetUploadState} 
              />
            )}
            
            {!uploadedImageUrl && (
              <ImageUploader 
                onSelectImage={handleImageSelect} 
                isUploading={isUploading} 
                error={uploadError} 
              />
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || isUploading}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;