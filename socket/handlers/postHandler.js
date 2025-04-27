import { EVENTS } from "../events.js";
import PostsModel from "../../models/PostsModel.js";
import UsersModel from "../../models/UsersModel.js";
import socketService from '../../services/socket.service.js';

//function to handle most post events
const postHandler = (io, socket) => {
    const postsModel = new PostsModel();
    const usersModel = new UsersModel();

    //create post 
    socket.on(EVENTS.POST_CREATED, async (data) => {
        try {
            const { postId, userId, username } = data;

            // Use socketService to broadcast to everyone
            socketService.broadcastAll(socket, EVENTS.POST_CREATED, {
                postId,
                userId,
                username,
                createdAt: new Date()
            });

            // Notify followers
            const followers = await usersModel.getUserFollowers(userId);
            if (followers && followers.length > 0) {
                // Get username for more descriptive notification
                const creatorUsername = await usersModel.getUsername(userId);
                
                // Notify each follower about new post
                for(const followerId of followers) {
                    await socketService.createAndSendNotification({
                        receiverId: followerId,
                        senderId: userId,
                        type: 'new_post',
                        postId: postId,
                        message: `${creatorUsername} created a new post`
                    });
                }
            }
        } 
        catch (error) {
            console.error('Error handling post creation:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to create post' });
          }
    });

    //update post
    socket.on(EVENTS.POST_UPDATED, async (data) => {
        try {
            const { postId, userId, content } = data;
            
            await postsModel.updatePost(userId, postId, content);
            
            // Use socketService to broadcast update to everyone in the post
            socketService.emitToPost(postId, EVENTS.POST_UPDATED, {
                postId,
                content,
                updatedAt: new Date()
            });
        } 
        catch (error) {
            console.error('Error updating post:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to update post' });
          }
    });

    //delete post
    socket.on(EVENTS.POST_DELETED, async (data) => {
        try {
            const {postId, userId} = data;

            //try deleting the post
            await postsModel.softDeletePost(postId, userId);

            //log the deletion event
            console.log(`Post with ID ${postId} deleted by user ${userId}`);

        }
        catch (error) {
            console.error('Error deleting post:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to delete post' });
        }
    });

    // Handle post likes
    socket.on(EVENTS.POST_LIKED, async (data) => {
        try {
            const { postId, userId } = data;
          
            // Like the post in the database
            await postsModel.likePost(userId, postId);
          
            // Get post info to notify owner
            const post = await postsModel.findPostById(postId);
            const username = await usersModel.getUsername(userId);
          
            // Notify post owner if they're not the liker
            if (post && post.u_id !== userId) {
                await socketService.createAndSendNotification({
                    receiverId: post.u_id,
                    senderId: userId,
                    type: 'like',
                    postId,
                    message: `${username} liked your post`
                });
            }
          
            // Update like count for all users viewing this post
            socketService.emitToPost(postId, EVENTS.POST_LIKED, {
                postId,
                userId,
                likeCount: post.likes ? post.likes.length + 1 : 1
            });
        } 
        catch (error) {
            console.error('Error handling post like:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to like post' });
        }
    });

    // Handle post unlikes
    socket.on(EVENTS.POST_UNLIKED, async (data) => {
        try {
            const { postId, userId } = data;
          
            // Unlike the post in the database
            await postsModel.unLikedPost(userId, postId);
          
            // Get updated post info
            const post = await postsModel.findPostById(postId);
            
            // Delete notification if it exists
            if (post && post.u_id !== userId) {
                await socketService.deleteNotification(userId, post.u_id, postId, 'like');
            }
          
            // Update like count for all users viewing this post
            socketService.emitToPost(postId, EVENTS.POST_UNLIKED, {
                postId,
                userId,
                likeCount: post.likes ? post.likes.length : 0
            });
        } 
        catch (error) {
            console.error('Error handling post unlike:', error);
            socket.emit(EVENTS.ERROR, { message: 'Failed to unlike post' });
        }
    });
};

export default postHandler;