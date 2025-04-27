// components/follow/FollowButton.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import followService from '../../services/follow.service';
import ErrorMessage from '../common/ErrorMessage';

interface FollowButtonProps {
  targetId: string;
  isFollowed: boolean;
  targetUsername?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  targetId, 
  isFollowed, 
  targetUsername 
}) => {
  const [following, setFollowing] = useState(isFollowed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const handleFollowToggle = async () => {
    if (!currentUser) {
      setError('You must be logged in to follow users');
      return;
    }

    if (currentUser.id === targetId) {
      setError('You cannot follow yourself');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (following) {
        await followService.unfollowUser(targetId);
      } else {
        await followService.followUser(targetId, targetUsername);
      }
      
      setFollowing(!following);
    } catch (err: any) {
      setError(err.message || 'Failed to process follow request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="follow-button-container">
      <button 
        className={`follow-button ${following ? 'following' : ''}`}
        onClick={handleFollowToggle}
        disabled={loading || !currentUser}
      >
        {loading ? 'Processing...' : following ? 'Unfollow' : 'Follow'}
      </button>
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default FollowButton;