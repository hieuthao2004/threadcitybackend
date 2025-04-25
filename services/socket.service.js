import { EVENTS } from '../socket/events.js';
import NotificationsModel from '../models/NotificationsModel.js';

/**
 * Socket service to manage socket.io operations
 * Provides utility functions for working with sockets across the application
 */
class SocketService {
  constructor() {
    this.io = null;
    this.notificationsModel = new NotificationsModel();
  }

  // Initialize with socket.io instance
  initialize(io) {
    this.io = io;
    return this;
  }

  // Get the socket.io instance
  getIO() {
    if (!this.io) {
      console.warn('Socket.io not initialized. Call initialize() first.');
      return null;
    }
    return this.io;
  }

  // Emit to a specific user by user ID
  emitToUser(userId, event, data) {
    if (!this.io) return false;
    this.io.to(`user:${userId}`).emit(event, data);
    return true;
  }

  // Emit to a specific post room
  emitToPost(postId, event, data) {
    if (!this.io) return false;
    this.io.to(`post:${postId}`).emit(event, data);
    return true;
  }

  // Broadcast to all connected clients except sender
  broadcastAll(socket, event, data) {
    if (!socket) return false;
    socket.broadcast.emit(event, data);
    return true;
  }

  /**
   * Create and send a notification - stores in database AND sends via socket
   * @param {Object} data Notification data
   * @param {string} data.receiverId User who receives the notification
   * @param {string} data.senderId User who triggered the notification
   * @param {string} data.type Notification type (like, comment, follow, etc)
   * @param {string|null} data.postId Related post ID if applicable
   * @param {string} data.message Notification message
   * @returns {Promise<string|null>} Notification ID or null if failed
   */
  async createAndSendNotification(data) {
    try {
      const { receiverId, senderId, type, postId, message } = data;
      
      // Skip if sender is the receiver
      if (receiverId === senderId) return null;
      
      // 1. Store notification in database
      const notificationId = await this.notificationsModel.createNotification(
        receiverId, 
        senderId, 
        type, 
        postId || '', 
        message
      );
      
      // 2. Send real-time notification via socket
      const notification = {
        id: notificationId,
        type,
        senderId,
        message,
        postId,
        createAt: new Date()
      };
      
      this.emitToUser(receiverId, EVENTS.NEW_NOTIFICATION, notification);
      
      return notificationId;
    } catch (error) {
      console.error('Error creating and sending notification:', error);
      return null;
    }
  }
  
  /**
   * Delete a notification from database
   */
  async deleteNotification(senderId, receiverId, postId = null, type = null) {
    try {
      await this.notificationsModel.deleteNotification(senderId, receiverId, postId, type);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Legacy method for backward compatibility
  sendNotification(userId, notification) {
    return this.emitToUser(userId, EVENTS.NEW_NOTIFICATION, notification);
  }

  // Create standard notification object
  createNotification(type, actorId, targetId, relatedId = null) {
    return {
      type,          // 'like', 'comment', 'follow', etc.
      actorId,       // User who triggered the notification
      targetId,      // User who receives the notification
      relatedId,     // ID of related content (post, comment)
      createdAt: new Date()
    };
  }

  // Get all connected sockets
  getConnectedSockets() {
    if (!this.io) return [];
    return Array.from(this.io.sockets.sockets.values());
  }

  // Get online users
  getOnlineUsers() {
    if (!this.io) return [];
    
    const sockets = this.getConnectedSockets();
    return sockets
      .filter(socket => socket.userId) // Only authenticated sockets have userId
      .map(socket => socket.userId);
  }

  // Check if a user is online
  isUserOnline(userId) {
    if (!this.io) return false;
    
    const sockets = this.getConnectedSockets();
    return sockets.some(socket => socket.userId === userId);
  }

  // Get users in a room
  getUsersInRoom(room) {
    if (!this.io) return [];
    
    const sockets = Array.from(this.io.sockets.adapter.rooms.get(room) || []);
    return sockets.map(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      return socket?.userId;
    }).filter(Boolean); // Filter out undefined values
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;