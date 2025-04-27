import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import postService from '../services/post.service';
import socketService from '../services/socket.service';
import { EVENTS } from '../utils/constants';
import { Post } from '../types/post.types';
import PostItem from '../components/posts/PostItem';
import CommentList from '../components/post/CommentList';
import CommentForm from '../components/post/CommentForm';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        setError(null);
        const postData = await postService.getPostById(postId);
        setPost(postData);
      } catch (err: any) {
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    
    // Join the post room for real-time updates
    socketService.emit(EVENTS.JOIN_POST, postId);
    
    // Listen for comment events
    socketService.on(EVENTS.COMMENT_CREATED, handleNewComment);
    socketService.on(EVENTS.COMMENT_UPDATED, handleUpdatedComment);
    socketService.on(EVENTS.COMMENT_DELETED, handleDeletedComment);
    
    // Listen for post update/delete events
    socketService.on(EVENTS.POST_UPDATED, handlePostUpdate);
    socketService.on(EVENTS.POST_DELETED, handlePostDelete);
    
    // Listen for like events
    socketService.on(EVENTS.POST_LIKED, handlePostLike);
    socketService.on(EVENTS.POST_UNLIKED, handlePostUnlike);
    
    return () => {
      // Leave the post room when unmounting
      socketService.emit(EVENTS.LEAVE_POST, postId);
      
      // Remove event listeners
      socketService.off(EVENTS.COMMENT_CREATED);
      socketService.off(EVENTS.COMMENT_UPDATED);
      socketService.off(EVENTS.COMMENT_DELETED);
      socketService.off(EVENTS.POST_UPDATED);
      socketService.off(EVENTS.POST_DELETED);
      socketService.off(EVENTS.POST_LIKED);
      socketService.off(EVENTS.POST_UNLIKED);
    };
  }, [postId]);

  const handleNewComment = (comment) => {
    setPost(prevPost => {
      if (!prevPost) return null;
      return {
        ...prevPost,
        comments: [...(prevPost.comments || []), comment],
        commentsCount: (prevPost.commentsCount || 0) + 1
      };
    });
  };

  const handleUpdatedComment = (updatedComment) => {
    setPost(prevPost => {
      if (!prevPost || !prevPost.comments) return prevPost;
      const updatedComments = prevPost.comments.map(comment => 
        comment.id === updatedComment.id ? { ...comment, ...updatedComment } : comment
      );
      return { ...prevPost, comments: updatedComments };
    });
  };

  const handleDeletedComment = (commentId) => {
    setPost(prevPost => {
      if (!prevPost || !prevPost.comments) return prevPost;
      const filteredComments = prevPost.comments.filter(comment => comment.id !== commentId);
      return { 
        ...prevPost, 
        comments: filteredComments,
        commentsCount: Math.max(0, (prevPost.commentsCount || 0) - 1)
      };
    });
  };

  const handlePostUpdate = (updatedPost) => {
    if (updatedPost.id === postId) {
      setPost(prevPost => prevPost ? { ...prevPost, ...updatedPost } : null);
    }
  };

  const handlePostDelete = (deletedPost) => {
    if (deletedPost.id === postId) {
      // Post was deleted, navigate back to home
      navigate('/');
    }
  };

  const handlePostLike = (data) => {
    if (data.postId === postId) {
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          likesCount: data.likeCount,
          isLiked: currentUser ? true : false
        };
      });
    }
  };

  const handlePostUnlike = (data) => {
    if (data.postId === postId) {
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          likesCount: data.likeCount,
          isLiked: false
        };
      });
    }
  };

  const handleLikeToggle = async () => {
    if (!post || !currentUser) return;
    
    try {
      if (post.isLiked) {
        await postService.unlikePost(post.id);
      } else {
        await postService.likePost(post.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update like status');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!post) {
    return <ErrorMessage message="Post not found" />;
  }

  return (
    <div className="post-detail-page">
      <div className="container">
        <div className="post-container">
          <PostItem 
            post={post} 
            onLikeToggle={handleLikeToggle} 
            showFullContent 
          />
        </div>
        
        <div className="comments-section">
          <h3>Comments ({post.commentsCount || 0})</h3>
          
          {currentUser && (
            <CommentForm postId={post.id} />
          )}
          
          <CommentList 
            comments={post.comments || []} 
            postId={post.id} 
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;