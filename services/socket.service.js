import { EVENTS } from '../socket/events.js';

/**
 * Socket service to manage socket.io operations
 * Provides utility functions for working with sockets across the application
 */
class SocketService {
  constructor() {
    this.io = null;
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

  // Create and emit a notification
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