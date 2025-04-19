import express from 'express';
import authorization from '../../middleware/authorization.js';
import PostsModel from '../../models/PostsModel.js';
import UsersModel from '../../models/UsersModel.js';

const router = express.Router();
const model = new PostsModel();
const userModel = new UsersModel();

// CRUD post
router.post("/create_post", authorization, async (req, res) => {
    const userID = req.userId;
    const { content } = req.body;
    const postData = {
        u_id: userID,
        p_creater: userModel.getUsername(userID),
        p_content: content,
        p_create_at: new Date(),
        p_is_visible: true,
        p_image_url: "",
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

router.get("/posts/:p_id", async (req, res) => {
    const { p_id } = req.params;
    const post = await model.findPostById(p_id);
    return res.status(200).json({msg: "good", post: post})
});

router.put("/posts/:p_id", authorization, async (req, res) => {
    const user = req.userId;
    const p_id = req.params;
    const { newContent } = req.body;
    await model.updatePost(user, p_id, newContent.content);
    return res.status(200).json({msg: "Updated post!"}) 
});

// CD like
router.post("/posts/liked/:p_id", authorization ,async (req, res) => {
   const { p_id } = req.params;
   const userID = req.userId;
   await model.likePost(userID, p_id);
   return res.status(200).json({msg: "Liked"});
});

router.delete("/posts/liked/:p_id", authorization, async (req, res) => {
    const {p_id} = req.params;
    const user = req.userId; 
    await model.unLikedPost(user, p_id);
    return res.status(200).json({msg: "Unliked"})
});

// CRUD comments
router.get("/posts/:p_id/comments", authorization, async (req, res) => {
    const { p_id } = req.params;
    const user_id = req.userId;

    try {
        const comments = await model.getAllComments(p_id, user_id);
        return res.status(200).json({ msg: "Good", allComments: comments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error fetching comments" });
    }
});

router.post("/posts/:p_id/comments", authorization, async (req, res) => {
    const { p_id } = req.params;
    const user_id = req.userId;
    const cmt = req.body; 
    const content = {
        user: user_id,
        c_creater: userModel.getUsername(user_id),
        post: p_id,
        content: cmt.comment,
        c_createAt: new Date(),
    }
    await model.createComment(content);
    return res.status(200).json({msg: "Comment created!"})
});

router.put("/posts/:p_id/comments/:c_id", authorization, async (req, res) => {
    const cmtID = req.params.c_id;
    const postID = req.params.p_id;
    const userID = req.userId;
    const { comment } = req.body;

    try {
        await model.updateComment(userID, postID, cmtID, comment);
        return res.status(200).json({ msg: "Comment updated successfully" });
    } catch (error) {
        console.error("Update comment error:", error);
        return res.status(403).json({ msg: error.message || "You are not allowed to edit this comment" });
    }
});

router.post("/posts/:p_id/comments/:c_id/hide", async (req, res) => {
    const cmtID = req.params.c_id;
    const postID = req.params.p_id;
    const userID = req.userId;

    const content = {
        user_id: userID,
        username: userModel.getUsername(userID),
        post: postID,
        comment_id: cmtID,
        hiddenAt: new Date()
    };

    await model.hideComment(content);
    return res.status(200).json({msg: "Hide Comment"})
});

router.delete("/posts/:p_id/comments/:c_id", authorization, async (req, res) => {
    const userId = req.userId;
    const { p_id, c_id } = req.params;

    try {
        await model.deleteComment(userId, p_id, c_id);
        return res.status(200).json({ msg: "Comment deleted successfully" });
    } catch (error) {
        console.error("Delete comment error:", error);
        return res.status(403).json({ msg: error.message || "You can't delete this comment" });
    }
});



export default router;