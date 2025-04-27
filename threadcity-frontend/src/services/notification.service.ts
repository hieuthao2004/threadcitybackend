import apiClient from './api.service';
import socketService from './socket.service';
import { API_ROUTES, EVENTS } from '../utils/constants';
import { Notification } from '../types/notification.types';

class NotificationService {
  async getAllNotifications(page: number = 1, limit: number = 20): Promise<{
    notifications: Notification[];
    hasMore: boolean;
  }> {
    try {
      const response = await apiClient.get(
        `${API_ROUTES.NOTIFICATIONS.BASE}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.put(API_ROUTES.NOTIFICATIONS.MARK_READ(notificationId));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put(API_ROUTES.NOTIFICATIONS.MARK_ALL_READ);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }

  listenForNotifications(callback: (notification: Notification) => void): void {
    socketService.on<Notification>(EVENTS.NOTIFICATION_RECEIVED, callback);
  }

  stopListening(): void {
    socketService.off(EVENTS.NOTIFICATION_RECEIVED);
  }
}

export default new NotificationService();