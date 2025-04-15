import React from 'react';
import { Link } from 'react-router-dom';

// Interface định nghĩa cấu trúc dữ liệu của một bài đăng
export interface PostProps {
  id: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date | string;
  likes?: number;
  replies?: number;
  isLiked?: boolean;
  image?: string;
}

export function PostItem({ 
  id, 
  author, 
  content, 
  timestamp, 
  likes = 0, 
  replies = 0, 
  isLiked = false,
  image
}: PostProps) {
  // Format timestamp to display
  const formatTimestamp = (time: Date | string) => {
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="post-item">
      <div className="post-header">
        <Link to={`/profile/${author.id}`} className="post-author-avatar">
          {author.avatar ? (
            <img src={author.avatar} alt={author.username} />
          ) : (
            <div className="default-avatar">{author.username.charAt(0).toUpperCase()}</div>
          )}
        </Link>
        <div className="post-info">
          <Link to={`/profile/${author.id}`} className="post-author-name">
            {author.username}
          </Link>
          <span className="post-timestamp">{formatTimestamp(timestamp)}</span>
        </div>
        <button className="post-more-options">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
          </svg>
        </button>
      </div>

      <div className="post-content">
        <p>{content}</p>
        {image && (
          <div className="post-image">
            <img src={image} alt="Post attachment" />
          </div>
        )}
      </div>

      <div className="post-actions">
        <button className={`post-action ${isLiked ? 'is-active' : ''}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
          </svg>
          {likes > 0 && <span>{likes}</span>}
        </button>
        <button className="post-action">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
          </svg>
          {replies > 0 && <span>{replies}</span>}
        </button>
        <button className="post-action">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z"></path>
            <path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}