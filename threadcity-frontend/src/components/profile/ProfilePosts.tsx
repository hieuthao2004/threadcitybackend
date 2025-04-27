// components/profile/ProfilePosts.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PostItem from '../posts/PostItem';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import userService from '../../services/user.service';
import { Post } from '../../types/post.types';

const ProfilePosts: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  useEffect(() => {
    if (!username) return;
    
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getUserPosts(username, 1, 10);
        setPosts(response.posts);
        setHasMore(response.hasMore);
        setPage(1);
      } catch (err: any) {
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [username]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !username) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await userService.getUserPosts(username, nextPage, 10);
      setPosts(prev => [...prev, ...response.posts]);
      setHasMore(response.hasMore);
      setPage(nextPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading && posts.length === 0) {
    return <Loader />;
  }

  if (error && posts.length === 0) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="profile-posts">
      <h3>Posts</h3>
      
      {posts.length === 0 ? (
        <div className="no-posts">No posts yet</div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map(post => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
          
          {hasMore && (
            <button 
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePosts;