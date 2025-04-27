import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SocketContext } from './SocketContext';
import notificationService from '../services/notification.service';
import { Notification } from '../types/notification.types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const socket = useContext(SocketContext);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Load initial notifications
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
  }, [currentUser]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('notification_received', handleNewNotification);

    return () => {
      socket.off('notification_received');
    };
  }, [socket, currentUser]);

  const fetchNotifications = async (reset = true) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const pageToFetch = reset ? 1 : page;
      const response = await notificationService.getAllNotifications(pageToFetch);
      
      if (reset) {
        setNotifications(response.notifications);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(response.hasMore);
      countUnread(reset ? response.notifications : notifications);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    await fetchNotifications(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
      
      countUnread();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const countUnread = (notifs = notifications) => {
    const count = notifs.filter(notif => !notif.isRead).length;
    setUnreadCount(count);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      hasMore,
      loadMore,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};