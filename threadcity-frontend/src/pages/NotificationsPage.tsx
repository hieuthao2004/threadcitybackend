import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../contexts/NotificationContext';
import { formatDate } from '../utils/helpers';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    loading, 
    hasMore, 
    loadMore, 
    markAsRead, 
    markAllAsRead 
  } = useContext(NotificationContext);
  
  const [error, setError] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  };

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
        return `/post/${notification.postId}`;
      case 'follow':
        return `/profile/${notification.senderUsername}`;
      default:
        return '#';
    }
  };

  if (loading && notifications.length === 0) {
    return <Loader />;
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <h1>Notifications</h1>
          {notifications.length > 0 && (
            <button 
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </button>
          )}
        </div>
        
        {error && <ErrorMessage message={error} />}
        
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>You have no notifications</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <Link 
                  key={notification.id} 
                  to={getNotificationLink(notification)}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="notification-avatar">
                    {notification.senderAvatar ? (
                      <img src={notification.senderAvatar} alt={notification.senderUsername} />
                    ) : (
                      <div className="default-avatar">
                        {notification.senderUsername?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <p className="notification-time">{formatDate(notification.createdAt)}</p>
                  </div>
                  {!notification.isRead && (
                    <div className="unread-indicator"></div>
                  )}
                </Link>
              ))}
              
              {hasMore && (
                <button 
                  className="load-more-button"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;