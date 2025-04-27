import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../../contexts/NotificationContext';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/helpers';

interface Notification {
  id: string;
  type: string;
  message: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  postId?: string;
  createdAt: Date;
  isRead: boolean;
}

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useContext(NotificationContext);
  
  const getNotificationLink = () => {
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
  
  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };
  
  return (
    <Link 
      to={getNotificationLink()} 
      className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-avatar">
        {notification.senderAvatar ? (
          <Avatar src={notification.senderAvatar} alt={notification.senderUsername} size={40} />
        ) : (
          <div className="default-avatar">
            {notification.senderUsername?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>
      
      <div className="notification-content">
        <p className="notification-message">{notification.message}</p>
        <span className="notification-date">{formatDate(notification.createdAt)}</span>
      </div>
      
      {!notification.isRead && (
        <div className="unread-indicator"></div>
      )}
    </Link>
  );
};

export default NotificationItem;