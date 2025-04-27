import { useState, useEffect } from 'react';
import postService from '../services/post.service';
import { Post } from '../types/post.types';
import socketService from '../services/socket.service';
import { EVENTS } from '../utils/constants';

export function usePosts(initialPosts: Post[] = []) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Load initial posts if not provided
  useEffect(() => {
    if (initialPosts.length === 0) {
      loadPosts();
    }

    // Setup socket listeners for real-time updates
    socketService.on(EVENTS.POST_CREATED, handleNewPost);
    socketService.on(EVENTS.POST_UPDATED, handleUpdatedPost);
    socketService.on(EVENTS.POST_DELETED, handleDeletedPost);
    
    return () => {
      socketService.off(EVENTS.POST_CREATED);
      socketService.off(EVENTS.POST_UPDATED);
      socketService.off(EVENTS.POST_DELETED);
    };
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postService.getAllPosts(1, 10);
      setPosts(response.posts);
      setHasMore(response.hasMore);
      setPage(1);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      
      const nextPage = page + 1;
      const response = await postService.getAllPosts(nextPage, 10);
      
      setPosts(prev => [...prev, ...response.posts]);
      setHasMore(response.hasMore);
      setPage(nextPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load more posts');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
  };

  const handleUpdatedPost = (updatedPost: Partial<Post> & { id: string }) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? { ...post, ...updatedPost } : post
      )
    );
  };

  const handleDeletedPost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  return { posts, loading, error, loadMorePosts, hasMore, refreshPosts: loadPosts };
}