// components/follow/FollowingList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/user.service';
import Avatar from '../common/Avatar';
import FollowButton from './FollowButton';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';

interface FollowingListProps {
  username: string;
}

const FollowingList: React.FC<FollowingListProps> = ({ username }) => {
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadFollowing();
  }, [username]);

  const loadFollowing = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getFollowing(username, 1);
      setFollowing(response.users);
      setHasMore(response.hasMore);
      setPage(1);
    } catch (err: any) {
      setError(err.message || 'Failed to load following');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await userService.getFollowing(username, nextPage);
      setFollowing(prev => [...prev, ...response.users]);
      setHasMore(response.hasMore);
      setPage(nextPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load more following');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading && !following.length) {
    return <Loader />;
  }

  if (error && !following.length) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="following-list">
      <h2>Following</h2>
      
      {following.length === 0 ? (
        <p className="no-following">Not following anyone yet</p>
      ) : (
        <>
          <ul className="user-list">
            {following.map(user => (
              <li key={user.id} className="user-item">
                <Link to={`/profile/${user.username}`} className="user-link">
                  {user.profilePicture ? (
                    <Avatar src={user.profilePicture} alt={user.username} size={50} />
                  ) : (
                    <div className="default-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="username">{user.username}</span>
                </Link>
                
                <FollowButton 
                  targetId={user.id} 
                  isFollowed={true} 
                  targetUsername={user.username}
                />
              </li>
            ))}
          </ul>
          
          {hasMore && (
            <button 
              className="load-more-btn"
              onClick={loadMore}
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

export default FollowingList;