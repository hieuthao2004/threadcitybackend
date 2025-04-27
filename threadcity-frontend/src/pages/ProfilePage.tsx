import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfilePosts from '../components/profile/ProfilePosts';
import FollowersList from '../components/follow/FollowersList';
import FollowingList from '../components/follow/FollowingList';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import userService from '../services/user.service';

const ProfilePage = () => {
  const { username } = useParams<{username: string}>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = await userService.getUserByUsername(username);
        setProfile(user);
      } catch (err: any) {
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, navigate]);

  if (loading) {
    return <Loader />;
  }

  if (error || !profile) {
    return <ErrorMessage message={error || 'User not found'} />;
  }

  return (
    <div className="profile-page">
      <ProfileHeader profile={profile} />
      <div className="tabs">
        <button onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'active' : ''}>Posts</button>
        <button onClick={() => setActiveTab('followers')} className={activeTab === 'followers' ? 'active' : ''}>Followers</button>
        <button onClick={() => setActiveTab('following')} className={activeTab === 'following' ? 'active' : ''}>Following</button>
      </div>
      {activeTab === 'posts' && <ProfilePosts posts={profile.posts} />}
      {activeTab === 'followers' && <FollowersList followers={profile.followers} />}
      {activeTab === 'following' && <FollowingList following={profile.following} />}
    </div>
  );
};

export default ProfilePage;