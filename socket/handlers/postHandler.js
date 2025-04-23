import { EVENTS } from "../events.js";
import PostsModel from "../../models/PostsModel.js";
import UsersModel from "../../models/UsersModel.js";

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
            followers.forEach(followerId => {
                const notification = socketService.createNotification(
                    'new_post',
                    userId,
                    followerId,
                    postId
                );
                socketService.sendNotification(followerId, notification);
            });
        } 
        catch (error) {
            console.error('Error handling post creation:', error);
            socket.emit('error', { message: 'Failed to create post' });
          }
    })

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
            socket.emit('error', { message: 'Failed to update post' });
          }
    })

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
            socket.emit('error', { message: 'Failed to delete post' });
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
      
        // Notify post owner if they're not the liker
        if (post && post.u_id !== userId) {
            io.to(`user:${post.u_id}`).emit(EVENTS.NEW_NOTIFICATION, {
            type: 'like',
            postId,
            actorId: userId,
            createdAt: new Date(),
            });
        }
      
        // Update like count for all users viewing this post
        io.to(`post:${postId}`).emit(EVENTS.POST_LIKED, {
            postId,
            userId,
            likeCount: post.likes ? post.likes.length + 1 : 1
        });
        } 
        catch (error) {
            console.error('Error handling post like:', error);
            socket.emit('error', { message: 'Failed to like post' });
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
      
            // Update like count for all users viewing this post
            io.to(`post:${postId}`).emit(EVENTS.POST_UNLIKED, {
                postId,
                userId,
                likeCount: post.likes ? post.likes.length : 0
            });
        } 
        catch (error) {
            console.error('Error handling post unlike:', error);
            socket.emit('error', { message: 'Failed to unlike post' });
        }
    });
};

export default postHandler;