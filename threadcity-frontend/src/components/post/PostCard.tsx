import React from 'react';
import { Post } from '@/types/post.types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <span>Posted by {post.author}</span>
      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
    </div>
  );
};

export default PostCard;