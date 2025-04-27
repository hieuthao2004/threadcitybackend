// components/posts/EditPost.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useImageUpload } from '../../hooks/useImageUpload';
import ErrorMessage from '../common/ErrorMessage';
import ImagePreview from '../imageUpload/ImagePreview';
import ImageUploader from '../imageUpload/ImageUploader';
import postService from '../../services/post.service';
import socketService from '../../services/socket.service';
import { EVENTS } from '../../utils/constants';

interface EditPostProps {
  postId: string;
}

const EditPost: React.FC<EditPostProps> = ({ postId }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
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
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const post = await postService.getPostById(postId);
        
        // Check if user is the author
        if (post.authorId !== currentUser.id) {
          navigate('/');
          return;
        }
        
        setTitle(post.title);
        setContent(post.content);
        
        if (post.imageUrl) {
          setExistingImageUrl(post.imageUrl);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, currentUser, navigate]);

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
      setSaving(true);
      setError(null);
      
      const postData = {
        title,
        content,
        imageUrl: uploadedImageUrl || existingImageUrl || undefined
      };
      
      const updatedPost = await postService.updatePost(postId, postData);
      
      // Emit socket event for real-time updates
      socketService.emit(EVENTS.POST_UPDATED, {
        postId,
        userId: currentUser?.id,
        content: updatedPost.content
      });
      
      // Navigate to the updated post
      navigate(`/post/${updatedPost.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
      setSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Reset existing image when uploading new one
    setExistingImageUrl(null);
    handlePostImageUpload(files[0]);
  };

  const handleRemoveImage = () => {
    setExistingImageUrl(null);
    resetUploadState();
  };

  const handleCancel = () => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  return (
    <div className="edit-post">
      <h2>Edit Post</h2>
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            disabled={saving}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content..."
            rows={10}
            disabled={saving}
            required
          ></textarea>
        </div>
        
        <div className="form-group image-upload-section">
          <label>Image (Optional)</label>
          
          {uploadedImageUrl ? (
            <ImagePreview
              imageUrl={uploadedImageUrl}
              onRemove={() => resetUploadState()}
            />
          ) : existingImageUrl ? (
            <ImagePreview
              imageUrl={existingImageUrl}
              onRemove={handleRemoveImage}
            />
          ) : (
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
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            className="btn-primary"
            disabled={saving || isUploading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;