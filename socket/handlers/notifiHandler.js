import { EVENTS } from '../events.js';
import NotificationsModel from '../../models/NotificationsModel.js';
import UsersModel from '../../models/UsersModel.js';
import socketService from '../../services/socket.service.js';

const notifiHandler = (io, socket) => {
    const notificationsModel = new NotificationsModel();
    const usersModel = new UsersModel();

    //getting all notifications
    socket.on(EVENTS.GET_NOTIFICATIONS, async () => {
        try {
            if (!socket.userId) {
                return socket.emit(EVENTS.ERROR, { message: 'Authentication required' });
            }

            const notifications = await notificationsModel.getAllNotifications(socket.userId);
            
            //notify the requesting user
            socket.emit(EVENTS.GET_NOTIFICATIONS, notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to fetch notifications' });
        }
    });

    // Send a notification to a specific user
    socket.on('send_notification', async (data) => {
        try {
            if (!socket.userId || socket.userRole !== 'admin') {
                return socket.emit(EVENTS.ERROR, { message: 'Unauthorized' });
            }

            const { targetId, type, message, relatedId } = data;
            
            // Create notification in the database
            const notificationId = await notificationsModel.createNotification(
                targetId,
                socket.userId,
                type,
                relatedId || '',
                message
            );
            
            // Use socketService to send real-time notification
            const notification = {
                id: notificationId,
                type,
                message,
                sender_id: socket.userId,
                post_id: relatedId,
                createAt: new Date()
            };
            
            socketService.sendNotification(targetId, notification);
            
            socket.emit('notification_sent', { success: true });
        } catch (error) {
            console.error('Error sending notification:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to send notification' });
        }
    });
};

export default notifiHandler;