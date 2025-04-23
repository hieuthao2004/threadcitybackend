import { EVENTS } from './events.js';
import commentHandler from './handlers/commentHandler.js';
import postHandler from './handlers/postHandler.js';
// import notifiHandler from './handlers/notifiHandler.js';
import authenticationHandler from './handlers/authenticationHandler.js';
import socketAuthorization from '../middleware/socketAuthorization.js';
import socketService from '../services/socket.service.js';

const initializeSocket = (io) => {
    // initialize socket service with io instance 
    socketService.initialize(io);
  
    // Log socket connections and announce user connection on console 
    io.on(EVENTS.CONNECTION, (socket) => {
      console.log(`New socket connected: ${socket.id}`);
      
      // Apply socket authorization middleware
      socketAuthorization(socket, io);
        
        // Initialize handlers
        commentHandler(io, socket);
        postHandler(io, socket);
        notifiHandler(io, socket);
        authenticationHandler(io, socket);
        
        // Handle disconnection
        socket.on(EVENTS.DISCONNECT, () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    
    return io;
};

export default initializeSocket;