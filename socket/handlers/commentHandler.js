import { EVENTS } from '../events.js';
import PostsModel from '../../models/PostsModel.js';
import UsersModel from '../../models/UsersModel.js';
import socketService from '../../services/socket.service.js';

// Function to handle comment events
const commentHandler = (io, socket) => {
    const postsModel = new PostsModel();
    const usersModel = new UsersModel();

    //update comments based on post user joins
    socket.on(EVENTS.JOIN_POST, (postId) => {
        socket.join(`post:${postId}`);
        console.log(`User ${socket.id} joined post: ${postId}`);
    });

    //user leaves post 
    socket.on(EVENTS.LEAVE_POST, (postId) => {
        socket.leave(`post:${postId}`);
        console.log(`User ${socket.id} left post: ${postId}`);
    });

    //create comment
    socket.on(EVENTS.COMMENT_CREATED, async (data) => {
        try {
            const { postId, userId, content } = data;
            //get username by userId
            const username = await usersModel.getUsernameById(userId);

            //generate comment object in database
            const commentData = {
                post: postId,
                user: userId,
                content: content,
                c_createdAt: new Date(),
                c_updatedAt: new Date(),
                c_creater: username
            };

            const commentId = await postsModel.createComment(commentData);

            //get newly created comment and emit to all users in the post
            const comment = {
                id: commentId,
                content,
                username,
                userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Use socketService to boardcast new comment to everyone in the post
            socketService.emitToPost(postId, EVENTS.COMMENT_CREATED, comment);

            //notify new comment to post owner
            const post = await postsModel.getPostById(postId);
            if (post && post.user !== userId) {
                const notification = socketService.createNotification(
                    'comment',
                    userId,
                    post.user,
                    postId
                );
                socketService.sendNotification(post.user, notification);
            }
        }
        catch (error) {
            console.error('Error creating comment:', error);
            socket.emit(EVENTS.COMMENT_CREATED, { success: false, error: 'Failed to create comment' });
        }
    });

    //update comment
    socket.on(EVENTS.COMMENT_UPDATED, async (data) => {
        try {
            const { postId, commentId, content, userId } = data;
            // Updating comment in the database
            await postsModel.updateComment(userId, postId, commentId, content);

            // Use socketService to boadcast update to everyone in the post
            socketService.emitToPost(postId, EVENTS.COMMENT_UPDATED, {
                id: commentId,
                content,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            socket.emit(EVENTS.COMMENT_UPDATED, { success: false, error: 'Failed to update comment' });
        }
    });

    //delete comment
    socket.on(EVENTS.COMMENT_DELETED, async (data) => {
        try {
            const { postId, commentId } = data;
            await postsModel.deleteComment(commentId);

            // Use socketService to broadcast delete comment to everyone in the post
            socketService.emitToPost(postId, EVENTS.COMMENT_DELETED, commentId);
        } catch (error) {
            console.error('Error deleting comment:', error);
            socket.emit(EVENTS.COMMENT_DELETED, { success: false, error: 'Failed to delete comment' });
        }
    });
};

export default commentHandler;
