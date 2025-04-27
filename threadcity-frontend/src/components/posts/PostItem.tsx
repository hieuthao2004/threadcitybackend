import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, truncateText } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import socketService from '../../services/socket.service';
import { EVENTS } from '../../utils/constants';

interface PostItemProps {
  post: any;
  onLikeToggle?: () => void;
  showFullContent?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  onLikeToggle,
  showFullContent = false 
}) => {
  const { currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
  const isAuthor = currentUser && currentUser.id === post.authorId;
  const contentToShow = showFullContent ? post.content : truncateText(post.content, 150);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLikeToggle) {
      onLikeToggle();
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-post/${post.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setIsDeleting(true);
        
        // Emit socket event for deleting post
        socketService.emit(EVENTS.POST_DELETED, {
          postId: post.id,
          userId: currentUser?.id
        });
        
        // Navigate to home page if on post detail page
        if (showFullContent) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`post-item ${isDeleting ? 'deleting' : ''}`}>
      <div className="post-header">
        <div className="post-user-info">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt={post.authorUsername} className="user-avatar" />
          ) : (
            <div className="default-avatar">
              {post.authorUsername?.charAt(0).toUpperCase()}
            </div>
          )}
          <Link to={`/profile/${post.authorUsername}`} className="username">
            {post.authorUsername}
          </Link>
        </div>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      
      <Link to={`/post/${post.id}`} className="post-link">
        <h2 className="post-title">{post.title}</h2>
        <div className="post-content">{contentToShow}</div>
        
        {!showFullContent && post.content.length > 150 && (
          <span className="read-more">Read more...</span>
        )}
        
        {post.imageUrl && (
          <div className="post-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}
      </Link>
      
      <div className="post-footer">
        <div className="post-stats">
          <button 
            className={`like-button ${post.isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={!currentUser}
          >
            <span className="like-icon">❤</span>
            <span className="like-count">{post.likesCount || 0}</span>
          </button>
          
          <Link to={`/post/${post.id}`} className="comments-link">
            <span className="comment-icon">💬</span>
            <span className="comment-count">{post.commentsCount || 0}</span>
          </Link>
        </div>
        
        {isAuthor && (
          <div className="post-actions">
            <button 
              className="edit-button" 
              onClick={handleEdit}
              disabled={isDeleting}
            >
              Edit
            </button>
            <button 
              className="delete-button" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostItem;