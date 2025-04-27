// components/posts/PostDetail.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';
import CommentList from '../post/CommentList';
import CommentForm from '../post/CommentForm';
import Avatar from '../common/Avatar';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import socketService from '../../services/socket.service';
import { EVENTS } from '../../utils/constants';

interface PostDetailProps {
  post: any;
  onLikeToggle: () => void;
  onDelete: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onLikeToggle, onDelete }) => {
  const { currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isAuthor = currentUser && currentUser.id === post.authorId;

  useEffect(() => {
    // Join the post room for real-time comments
    socketService.joinRoom(`post:${post.id}`);
    
    // Listen for new comments
    socketService.on('comment_created', handleNewComment);
    socketService.on('comment_updated', handleUpdatedComment);
    socketService.on('comment_deleted', handleDeletedComment);
    
    return () => {
      // Leave the room and remove listeners
      socketService.leaveRoom(`post:${post.id}`);
      socketService.off('comment_created');
      socketService.off('comment_updated');
      socketService.off('comment_deleted');
    };
  }, [post.id]);

  useEffect(() => {
    loadComments();
  }, [post.id]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch comments from API
      const response = await fetch(`/api/posts/${post.id}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments);
      } else {
        setError(data.message || 'Failed to load comments');
      }
    } catch (err) {
      setError('An error occurred while loading comments');
    } finally {
      setLoading(false);
    }
  };

  const handleNewComment = (comment: any) => {
    setComments(prev => [comment, ...prev]);
  };

  const handleUpdatedComment = (updatedComment: any) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === updatedComment.id ? { ...comment, ...updatedComment } : comment
      )
    );
  };

  const handleDeletedComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const handleEdit = () => {
    navigate(`/edit-post/${post.id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Emit socket event for deleting post
      socketService.emit(EVENTS.POST_DELETED, {
        postId: post.id,
        userId: currentUser?.id
      });
      
      // Call the provided onDelete callback
      onDelete();
    } catch (error) {
      console.error('Error deleting post:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className={`post-detail ${isDeleting ? 'deleting' : ''}`}>
      <div className="post-header">
        <div className="post-user">
          <Link to={`/profile/${post.authorUsername}`} className="user-link">
            {post.authorAvatar ? (
              <Avatar src={post.authorAvatar} alt={post.authorUsername} size={40} />
            ) : (
              <div className="default-avatar">
                {post.authorUsername.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="username">{post.authorUsername}</span>
          </Link>
        </div>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      
      <h2 className="post-title">{post.title}</h2>
      
      <div className="post-content">{post.content}</div>
      
      {post.imageUrl && (
        <div className="post-image">
          <img src={post.imageUrl} alt={post.title} />
        </div>
      )}
      
      <div className="post-actions">
        <button 
          className={`like-button ${post.isLiked ? 'liked' : ''}`}
          onClick={onLikeToggle}
          disabled={!currentUser}
        >
          {post.isLiked ? 'Unlike' : 'Like'} • {post.likesCount}
        </button>
        
        {isAuthor && (
          <div className="author-actions">
            <button onClick={handleEdit} className="edit-button">
              Edit
            </button>
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
          </div>
        )}
      </div>
      
      <div className="comments-section">
        <h3>Comments ({post.commentsCount})</h3>
        
        {currentUser && <CommentForm postId={post.id} />}
        
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <CommentList comments={comments} postId={post.id} />
        )}
      </div>
    </div>
  );
};

export default PostDetail;