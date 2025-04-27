import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import FollowButton from '../follow/FollowButton';

interface ProfileHeaderProps {
  profile: {
    id: string;
    username: string;
    bio: string;
    profilePicture: string;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    isFollowed: boolean;
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const { currentUser } = useAuth();
  const isOwnProfile = currentUser && currentUser.id === profile.id;

  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {profile.profilePicture ? (
          <Avatar src={profile.profilePicture} alt={profile.username} size={100} />
        ) : (
          <div className="default-avatar large">
            {profile.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="profile-info">
        <h2>{profile.username}</h2>
        
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{profile.postsCount}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat">
            <Link to={`/profile/${profile.username}/followers`}>
              <span className="stat-value">{profile.followersCount}</span>
              <span className="stat-label">Followers</span>
            </Link>
          </div>
          <div className="stat">
            <Link to={`/profile/${profile.username}/following`}>
              <span className="stat-value">{profile.followingCount}</span>
              <span className="stat-label">Following</span>
            </Link>
          </div>
        </div>
        
        <div className="profile-actions">
          {isOwnProfile ? (
            <Link to="/edit-profile" className="btn-secondary">
              Edit Profile
            </Link>
          ) : (
            <FollowButton 
              targetId={profile.id} 
              isFollowed={profile.isFollowed}
              targetUsername={profile.username}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;