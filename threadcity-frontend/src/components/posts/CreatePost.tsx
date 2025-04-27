import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import socketService from '../../services/socket.service';
import { EVENTS } from '../../utils/constants';
import postService from '../../services/post.service';

const CreatePost: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setContent('');
    setError(null);
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a quick post without title
      const createdPost = await postService.createPost({
        title: content.split(' ').slice(0, 5).join(' ') + '...',
        content,
      });
      
      // Emit socket event for real-time updates
      socketService.emit(EVENTS.POST_CREATED, {
        postId: createdPost.id,
        userId: currentUser?.id,
        username: currentUser?.username
      });
      
      // Reset form
      setContent('');
      setIsExpanded(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToCreatePage = () => {
    navigate('/create-post');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="create-post">
      <div className="create-post-header">
        {currentUser?.profilePicture ? (
          <img 
            src={currentUser.profilePicture} 
            alt={currentUser.username} 
            className="user-avatar" 
          />
        ) : (
          <div className="default-avatar">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div 
          className="create-post-input"
          onClick={handleFocus}
        >
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            disabled={isLoading}
          ></textarea>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {isExpanded && (
        <div className="create-post-actions">
          <button 
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button 
            className="btn-secondary"
            onClick={navigateToCreatePage}
            disabled={isLoading}
          >
            Advanced
          </button>
          
          <button 
            className="btn-primary"
            onClick={handleCreatePost}
            disabled={isLoading}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatePost;