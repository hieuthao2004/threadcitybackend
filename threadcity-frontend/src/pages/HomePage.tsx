import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostList from '../components/posts/PostList';
import CreatePost from '../components/posts/CreatePost';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { posts, loading, error, loadMorePosts, hasMore, refreshPosts } = usePosts();

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>ThreadCity</h1>
        <p>Share your thoughts with the world</p>
      </div>
      
      {currentUser && (
        <div className="create-post-section">
          <CreatePost onPostCreated={refreshPosts} />
        </div>
      )}
      
      <div className="posts-section">
        <h2>Recent Posts</h2>
        
        {loading && posts.length === 0 ? (
          <Loader />
        ) : error && posts.length === 0 ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            <PostList posts={posts} />
            
            {hasMore && (
              <button 
                className="load-more-btn"
                onClick={loadMorePosts}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
      
      {!currentUser && (
        <div className="sign-up-prompt">
          <h3>Join ThreadCity Today</h3>
          <p>Sign up to post, comment, and connect with others.</p>
          <div className="auth-buttons">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/register" className="btn-secondary">Create Account</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;