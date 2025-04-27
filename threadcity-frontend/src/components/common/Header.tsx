import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">ThreadCity</Link>
        </div>
        
        <nav className="header-nav">
          {currentUser ? (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/create-post" className="nav-link">Create Post</Link>
              <Link to="/notifications" className="nav-link">Notifications</Link>
              <Link to={`/profile/${currentUser.u_username}`} className="nav-link">Profile</Link>
              <button 
                onClick={handleLogout} 
                className="nav-link logout-btn"
                disabled={loading}
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;