import { EVENTS } from '../events.js';
import jwt from 'jsonwebtoken';
import UsersModel from '../../models/UsersModel.js';
import socketService from '../../services/socket.service.js';

const authenticationHandler = (io, socket) => {
    const usersModel = new UsersModel();
    
    socket.on(EVENTS.AUTH, async (token) => {
        try {
            // Verify token
            const decoded = jwt.verify(token, "YOUR_SECRET_KEY");
            const userId = decoded.id;
            
            // Store user ID on socket for easy access
            socket.userId = userId;
            
            // Join user's personal room for notifications
            socket.join(`user:${userId}`);
            
            // Update user's online status
            await usersModel.loginStatus(userId);
            
            // Broadcast user online status using service
            socketService.broadcastAll(socket, EVENTS.USER_ONLINE, { userId });
            
            // Confirm authentication success
            socket.emit(EVENTS.AUTH_SUCCESS, { userId });
            
            console.log(`User ${userId} authenticated via socket ${socket.id}`);
            
            // Set up disconnect handler
            socket.on(EVENTS.DISCONNECT, async () => {
                if (socket.userId) {
                    await usersModel.logoutStatus(socket.userId);
                    socketService.getIO().emit(EVENTS.USER_OFFLINE, { userId: socket.userId });
                }
            });
        } catch (error) {
            console.error('Socket authentication error:', error);
            socket.emit(EVENTS.AUTH_ERROR, { message: 'Authentication failed' });
        }
    });
};

export default authenticationHandler;