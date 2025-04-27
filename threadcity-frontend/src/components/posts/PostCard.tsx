// components/posts/PostCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, truncateText } from '../../utils/helpers';
import Avatar from '../common/Avatar';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: Date;
    authorId: string;
    authorUsername: string;
    authorAvatar?: string;
    likesCount: number;
    commentsCount: number;
    isLiked?: boolean;
  };
  onLikeToggle?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLikeToggle }) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLikeToggle) onLikeToggle();
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.authorUsername}`} className="author-link">
          {post.authorAvatar ? (
            <Avatar src={post.authorAvatar} alt={post.authorUsername} size={40} />
          ) : (
            <div className="default-avatar">
              {post.authorUsername.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="author-name">{post.authorUsername}</span>
        </Link>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      
      <Link to={`/post/${post.id}`} className="post-content-link">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-excerpt">{truncateText(post.content, 150)}</p>
        
        {post.imageUrl && (
          <div className="post-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}
      </Link>
      
      <div className="post-footer">
        <button 
          className={`like-button ${post.isLiked ? 'liked' : ''}`}
          onClick={handleLikeClick}
        >
          {post.isLiked ? 'Liked' : 'Like'} • {post.likesCount}
        </button>
        <Link to={`/post/${post.id}`} className="comments-link">
          Comments • {post.commentsCount}
        </Link>
      </div>
    </div>
  );
};

export default PostCard;