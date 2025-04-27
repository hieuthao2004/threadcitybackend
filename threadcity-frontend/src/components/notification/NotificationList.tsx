import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../../contexts/NotificationContext';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/helpers';
import NotificationItem from './NotificationItem';
import Loader from '../common/Loader';

const NotificationList: React.FC = () => {
  const { 
    notifications, 
    loading, 
    hasMore, 
    loadMore, 
    markAllAsRead 
  } = useContext(NotificationContext);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h2>Notifications</h2>
        
        {notifications.length > 0 && (
          <button 
            className="mark-all-read"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications yet</p>
        </div>
      ) : (
        <>
          <ul className="notifications">
            {notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </ul>
          
          {hasMore && (
            <button 
              className="load-more-btn"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationList;