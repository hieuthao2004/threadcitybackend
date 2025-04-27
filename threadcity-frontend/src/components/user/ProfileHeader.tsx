import React from 'react';

const ProfileHeader = ({ user }) => {
  return (
    <div className="profile-header">
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <img src={user.avatar} alt={`${user.name}'s avatar`} />
    </div>
  );
};

export default ProfileHeader;