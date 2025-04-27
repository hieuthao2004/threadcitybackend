import { useState } from 'react';
import { followUser, unfollowUser } from '../../services/userService';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId, isFollowing }) => {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFollowToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (following) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      setFollowing(!following);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleFollowToggle} disabled={loading}>
      {loading ? 'Loading...' : following ? 'Unfollow' : 'Follow'}
      {error && <p className="error">{error}</p>}
    </button>
  );
};

export default FollowButton;