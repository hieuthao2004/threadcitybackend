import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import postService from '../../services/post.service';
import socketService from '../../services/socket.service';
import { EVENTS } from '../../utils/constants';

interface CommentFormProps {
  postId: string;
  onCommentAdded?: (comment: any) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to comment');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const comment = await postService.addComment(postId, content);
      
      // Clear the form
      setContent('');
      
      // Let parent component know a comment was added
      if (onCommentAdded) {
        onCommentAdded(comment);
      }
      
      // Emit socket event for real-time updates
      socketService.emit(EVENTS.COMMENT_CREATED, {
        postId,
        commentId: comment.id,
        userId: currentUser.id,
        content: comment.content
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading || !currentUser}
        rows={3}
        className="comment-input"
      />
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        type="submit"
        className="submit-button"
        disabled={loading || !content.trim() || !currentUser}
      >
        {loading ? 'Submitting...' : 'Comment'}
      </button>
    </form>
  );
};

export default CommentForm;