import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    profilePicture?: string;
  };
}

interface CommentListProps {
  comments: Comment[];
  postId: string;
  onDelete?: (commentId: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  postId,
  onDelete 
}) => {
  const { currentUser } = useAuth();

  if (comments.length === 0) {
    return <div className="no-comments">No comments yet</div>;
  }

  return (
    <div className="comment-list">
      {comments.map(comment => (
        <div key={comment.id} className="comment-item">
          <div className="comment-avatar">
            <Link to={`/profile/${comment.author.username}`}>
              {comment.author.profilePicture ? (
                <Avatar 
                  src={comment.author.profilePicture} 
                  alt={comment.author.username}
                  size={40} 
                />
              ) : (
                <div className="default-avatar">
                  {comment.author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          </div>
          
          <div className="comment-content">
            <div className="comment-header">
              <Link 
                to={`/profile/${comment.author.username}`}
                className="comment-author"
              >
                {comment.author.username}
              </Link>
              <span className="comment-date">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            
            <p className="comment-text">{comment.content}</p>
            
            {currentUser && currentUser.id === comment.author.id && onDelete && (
              <button 
                onClick={() => onDelete(comment.id)}
                className="delete-comment"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;