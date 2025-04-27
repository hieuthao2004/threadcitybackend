import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3001'; // Adjust the URL as needed

class SocketService {
  private socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
    });
  }

  public connect() {
    this.socket.connect();
  }

  public disconnect() {
    this.socket.disconnect();
  }

  public on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  public emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  public off(event: string, callback: (...args: any[]) => void) {
    this.socket.off(event, callback);
  }
}

const socketService = new SocketService();
export default socketService;