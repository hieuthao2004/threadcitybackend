import { Socket as SocketIOClient } from 'socket.io-client';
import { EVENTS } from '../utils/constants';

export interface SocketResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ImageUploadResponse extends SocketResponse {
  imageUrl?: string;
  publicId?: string;
  postId?: string;
}

export interface PasswordResetRequestResponse extends SocketResponse {
  message: string;
}

export interface TokenVerificationResponse extends SocketResponse {
  username?: string;
}

export interface FollowResponse extends SocketResponse {
  following?: string;
}

export interface NotificationResponse {
  id: string;
  message: string;
  type: string;
  createdAt: Date;
  isRead: boolean;
  senderId: string;
  senderUsername?: string;
  senderAvatar?: string;
  postId?: string;
}

export interface CustomSocket extends SocketIOClient {
  auth?: { token: string };
}