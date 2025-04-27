import React from 'react';
import PostItem from './PostItem';
import postService from '../../services/post.service';

interface PostListProps {
  posts: any[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!posts || posts.length === 0) {
    return <div className="no-posts">No posts found.</div>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostItem 
          key={post.id} 
          post={post} 
          onLikeToggle={() => handleLikeToggle(post.id, post.isLiked)} 
        />
      ))}
    </div>
  );
};

export default PostList;