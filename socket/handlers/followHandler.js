import { EVENTS } from '../events.js';
import UsersModel from '../../models/UsersModel.js';
import FollowsModel from '../../models/FollowsModel.js';
import socketService from '../../services/socket.service.js';

const followHandler = (io, socket) => {
    const usersModel = new UsersModel();
    const followsModel = new FollowsModel();

    // User follows another user
    socket.on(EVENTS.FOLLOW_USER, async (data) => {
        try {
            if (!socket.userId) {
                return socket.emit(EVENTS.ERROR, { message: 'Authentication required' });
            }

            const { targetId, targetUsername } = data;
            const userId = socket.userId;
            
            // Check if already following
            const isAlreadyFollowing = await followsModel.isFollowed(userId, targetId);
            if (isAlreadyFollowing) {
                return socket.emit(EVENTS.FOLLOW_USER, { 
                    success: false, 
                    error: 'Already following this user' 
                });
            }
            
            // Follow the user
            await followsModel.followPeople(userId, targetId);
            
            // Create notification
            const followerUsername = await usersModel.getUsername(userId);
            
            // Create and send notification using enhanced method
            await socketService.createAndSendNotification({
                receiverId: targetId,
                senderId: userId,
                type: 'follow',
                postId: null,
                message: `${followerUsername} started following you`,
                createdAt: new Date()
            });
            
            // Emit success response
            socket.emit(EVENTS.FOLLOW_USER, { 
                success: true,
                following: targetUsername
            });
            
        } catch (error) {
            console.error('Error processing follow request:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to process follow request' });
        }
    });
    
    // User unfollows another user
    socket.on(EVENTS.UNFOLLOW_USER, async (data) => {
        try {
            if (!socket.userId) {
                return socket.emit(EVENTS.ERROR, { message: 'Authentication required' });
            }

            const { targetId } = data;
            const userId = socket.userId;
            
            // Check if following
            const isFollowing = await followsModel.isFollowed(userId, targetId);
            if (!isFollowing) {
                return socket.emit(EVENTS.UNFOLLOW_USER, { 
                    success: false, 
                    error: 'Not following this user' 
                });
            }
            
            // Unfollow the user
            await followsModel.unfollowPeople(userId, targetId);
            
            // Delete follow notification if it exists
            await socketService.deleteNotification(userId, targetId, null, 'follow');
            
            // Emit success response
            socket.emit(EVENTS.UNFOLLOW_USER, { 
                success: true
            });
            
        } catch (error) {
            console.error('Error processing unfollow request:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to process unfollow request' });
        }
    });
    
    // Get online users that the current user follows
    socket.on(EVENTS.GET_ONLINE_FOLLOWING, async () => {
        try {
            if (!socket.userId) {
                return socket.emit(EVENTS.ERROR, { message: 'Authentication required' });
            }
            
            // First, get all users the current user follows
            const following = await followsModel.getFollowing(socket.userId);
            
            if (following.length === 0) {
                return socket.emit(EVENTS.ONLINE_FOLLOWING, { onlineUsers: [] });
            }
            
            // Get all users
            const allUsers = await usersModel.getAllUsers();
            
            // Filter for online users that the current user follows
            const onlineFollowing = allUsers.filter(user => 
                following.includes(user.id) && user.u_status === true
            ).map(user => ({
                userId: user.id,
                username: user.u_username
            }));
            
            socket.emit(EVENTS.ONLINE_FOLLOWING, { onlineUsers: onlineFollowing });
            
        } catch (error) {
            console.error('Error getting online following:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to get online following users' });
        }
    });
};

export default followHandler;