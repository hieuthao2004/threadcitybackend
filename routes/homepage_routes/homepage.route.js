const express = require('express');
const router = express.Router();
const authorization = require('../../middleware/authorization');
const DBService = require('../../services/db.service');

// create a post
router.post("/create_post", authorization, async (req, res) => {
    const userID = req.userId;
    const { content } = req.body;
    const postData = {
        u_id: userID,
        p_content: content,
        p_create_at: new Date(),
        p_is_visible: true,
    };
    try {
        await DBService.createPost(postData);
        return res.status(200).json({ message: "Post created successfully" });
    } catch (error) {
        console.error(error);
    }
});

router.get("/posts", authorization, async (req, res) => {
    try {
        const posts = await DBService.getAllPosts();
        return res.status(200).json({ allPosts: posts })
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;