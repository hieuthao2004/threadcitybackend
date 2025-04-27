// components/follow/FollowersList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/user.service';
import Avatar from '../common/Avatar';
import FollowButton from './FollowButton';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';

interface FollowersListProps {
  username: string;
}

const FollowersList: React.FC<FollowersListProps> = ({ username }) => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadFollowers();
  }, [username]);

  const loadFollowers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getFollowers(username, 1);
      setFollowers(response.users);
      setHasMore(response.hasMore);
      setPage(1);
    } catch (err: any) {
      setError(err.message || 'Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await userService.getFollowers(username, nextPage);
      setFollowers(prev => [...prev, ...response.users]);
      setHasMore(response.hasMore);
      setPage(nextPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load more followers');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading && !followers.length) {
    return <Loader />;
  }

  if (error && !followers.length) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="followers-list">
      <h2>Followers</h2>
      
      {followers.length === 0 ? (
        <p className="no-followers">No followers yet</p>
      ) : (
        <>
          <ul className="user-list">
            {followers.map(user => (
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
                  isFollowed={user.isFollowed} 
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

export default FollowersList;