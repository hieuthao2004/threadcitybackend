import express from 'express';
import authorization from '../../middleware/authorization.js';
import PostsModel from '../../models/PostsModel.js';

const router = express.Router();
const model = new PostsModel();

// create a post
router.post("/create_post", authorization, async (req, res) => {
    const userID = req.userId;
    const { content } = req.body;
    const postData = {
        u_id: userID,
        p_content: content,
        p_create_at: new Date(),
        p_is_visible: true,
        p_image_url: ""
    };
    try {
        await model.createPost(postData);
        return res.status(200).json({ message: "Post created successfully" });
    } catch (error) {
        console.error(error);
    }
});

router.get("/posts", async (req, res) => {
    try {
        const posts = await model.getAllPosts();
        return res.status(200).json({ allPosts: posts })
    } catch (error) {
        console.error(error);
    }
});

router.get("/post/:p_id", async (req, res) => {
    const { p_id } = req.params;
    const post = await model.findPostById(p_id);
    return res.status(200).json({post: post})
});

export default router;