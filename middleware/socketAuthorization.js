import jwt from 'jsonwebtoken';
import { EVENTS } from '../socket/events.js';

const socketAuthorization = (socket, io) => {
    // This middleware doesn't block connections
    // It just provides a way to authenticate after connection
  
    // Set up authentication with 30 sec timeout
    const authTimeout = setTimeout(() => {
        if (!socket.userId) {
            socket.emit(EVENTS.AUTH_ERROR, { message: 'Authentication timeout' });
            socket.disconnect(true);
        }
    }, 30000);
    
    // Listen for authenticate event
    socket.on(EVENTS.AUTH, (token) => {
        try {
            // Clear the timeout since authentication attempt was made
            clearTimeout(authTimeout);
            
            // Verify JWT token
            const data = jwt.verify(token, "YOUR_SECRET_KEY");
            
            // Store user info on socket for other handlers to use
            socket.userId = data.id;
            socket.userRole = data.role;
            
            // Join user-specific room
            socket.join(`user:${data.id}`);
            
            // Confirm authentication
            socket.emit(EVENTS.AUTH_SUCCESS, {
                userId: data.id,
                role: data.role
            });
        } catch (error) {
            socket.emit(EVENTS.AUTH_ERROR, { message: 'Invalid token' });
        }
    });
};

export default socketAuthorization;