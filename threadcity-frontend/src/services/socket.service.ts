import { io, Socket } from 'socket.io-client';
import { EVENTS } from '../utils/constants';

const SOCKET_SERVER_URL = 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (this.socket && this.socket.connected) return;

    this.socket = io(SOCKET_SERVER_URL, {
      auth: {
        token
      },
      withCredentials: true,
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit<T>(event: string, data: T): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    this.socket.emit(event, data);
  }

  on<T>(event: string, callback: (data: T) => void): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    this.socket.on(event, callback);
  }

  off(event: string): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    this.socket.off(event);
  }

  joinRoom(room: string): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    this.socket.emit('join_room', { room });
  }

  leaveRoom(room: string): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    this.socket.emit('leave_room', { room });
  }
}

export default new SocketService();