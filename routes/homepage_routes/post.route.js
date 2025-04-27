import express from 'express';
import authorization from '../../middleware/authorization.js';
import uploadImageMiddleware from '../../middleware/uploadMiddleware.js';
import PostsModel from '../../models/PostsModel.js';
import NotificationsModel from '../../models/NotificationsModel.js';

const router = express.Router();
const postsModel = new PostsModel();
const notificationsModel = new NotificationsModel();

// Create a new post with optional image
router.post("/posts", authorization, uploadImageMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.userId;
        
        if (!content && !req.imageUrl) {
            return res.status(400).json({ 
                success: false,
                message: "Post must contain either text content or an image" 
            });
        }

        const postData = {
            u_id: userId,
            p_content: content || "",
            p_is_visible: true
        };

        // Pass the image URL from the middleware to createPost
        const newPost = await postsModel.createPost(postData, req.imageUrl);

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: newPost
        });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create post"
        });
    }
});

export default router;