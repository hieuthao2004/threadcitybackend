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
        p_creater: await userModel.getUsername(userID),
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

router.get("/posts", authorization, async (req, res) => {
    const userID = req.userId;
    try {
        const posts = await model.getAllPosts(userID);
        return res.status(200).json({ allPosts: posts })
    } catch (error) {
        console.error(error);
    }
});

router.get("/posts/:p_id", async (req, res) => {
    const { p_id } = req.params;

    try {
        const post = await model.findPostById(p_id);

        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        return res.status(200).json({ msg: "Good", post });
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

router.put("/posts/:p_id", authorization, async (req, res) => {
    const user = req.userId;
    const { p_id } = req.params;
    const { newContent } = req.body;

    try {
        await model.updatePost(user, p_id, newContent);
        return res.status(200).json({ msg: "Updated post!" });
    } catch (error) {
        console.error("Update post error:", error);
        return res.status(500).json({ msg: "Failed to update post" });
    }
});

router.post("/posts/:p_id/hide", authorization, async (req, res) => {
    const userId = req.userId;
    const post_id = req.params.p_id;
    try {
        const content = {
            u_id: userId,
            username: await userModel.getUsername(userId),
            p_id: post_id,
            hiddenAt: new Date()
        }
        await model.hidePost(content);
        return res.status(200).json({msg: "Hide Post"})
    } catch (error) {
        console.error(error);
    }
});

router.put("/posts/:p_id/softdelete", authorization, async (req, res) => {
    const userId = req.userId;
    const { p_id } = req.params;
    console.log(p_id);
    

    try {
        await model.softDeletePost(p_id, userId);
        return res.status(200).json({ msg: "Post deleted!" });
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ msg: "Failed to delete post" });
    }
});

// CD like
router.post("/posts/:p_id/liked", authorization, async (req, res) => {
    const { p_id } = req.params;
    const userID = req.userId;

    try {
        const result = await model.likePost(userID, p_id);

        return res.status(200).json({
            msg: result ? "Post liked!" : "Already liked!",
            liked: result
        });
    } catch (error) {
        console.error("Error liking post:", error);
        return res.status(500).json({ msg: "Failed to like post" });
    }
});


router.delete("/posts/:p_id/disliked", authorization, async (req, res) => {
    const { p_id } = req.params;
    const user = req.userId;

    try {
        const result = await model.unLikedPost(user, p_id);
        if (result) {
            return res.status(200).json({ msg: "Unliked" });
        } else {
            return res.status(404).json({ msg: "Like not found"});
        }
    } catch (error) {
        console.error("Error unliking post:", error);
        return res.status(500).json({ msg: "Failed to unlike post" });
    }
});


// CRUD comments
router.get("/posts/:p_id/comments", authorization, async (req, res) => {
    const { p_id } = req.params;
    const user_id = req.userId;
    console.log(user_id);
    

    try {
        const comments = await model.getAllComments(p_id, user_id);

        if (comments) {
            return res.status(200).json({ msg: "Good", allComments: comments });
        } else {
            return res.status(404).json({ msg: "No comments found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error fetching comments" });
    }
});

router.post("/posts/:p_id/comments", authorization, async (req, res) => {
    const { p_id } = req.params;
    const user_id = req.userId;
    const cmt = req.body;

    try {
        const content = {
            user: user_id,
            c_creater: await userModel.getUsername(user_id),
            post: p_id,
            content: cmt.comment,
            c_image_url: "",
            c_createAt: new Date(),
        };
        await model.createComment(content);
        return res.status(200).json({ msg: "Comment created!" });
    } catch (error) {
        console.error("Error creating comment:", error);
        return res.status(500).json({ msg: "Failed to create comment" });
    }
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

router.post("/posts/:p_id/comments/:c_id/hide", authorization, async (req, res) => {
    const cmtID = req.params.c_id;
    const postID = req.params.p_id;
    const userID = req.userId;

    const content = {
        user_id: userID,
        username: await userModel.getUsername(userID),
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

// CD save post
router.post("/profile/posts/:p_id/saved", authorization, async (req, res) => {
    try {
        const userID = req.userId;
        const username = await userModel.getUsername(userID);
        const { p_id } = req.params;

        const result = await model.savePost(username, p_id);

        if (result.isPostSaved) {
            return res.status(200).json({
                msg: "Post already saved",
                saved: false
            });
        }

        return res.status(200).json({
            msg: "Post saved",
            saved: true,
            savedId: result.id
        });
    } catch (error) {
        console.error("Error saving post:", error);
        return res.status(500).json({ msg: "Failed to save post" });
    }
});

// CD repost
router.post("/posts/:p_id/reposted", authorization, async (req, res) => {
    const userId = req.userId;
    const { p_id } = req.params;
    const { repostContent } = req.body;

    try {
        const username = await model.getUsername(userId);
        const isReposted = await model.isReposted(userId, p_id);

        if (isReposted) {
            return res.status(401).json({ msg: "Post is already reposted" });
        }

        const content = {
            user_id: userId,
            username: username,
            post_id: p_id,
            content: repostContent,
            repost_at: new Date()
        };

        const repostId = await model.createRepost(content);
        return res.status(200).json({ msg: "Reposted", id: repostId });

    } catch (error) {
        console.error("Error while reposting post:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

router.delete("/posts/:p_id/unreposted", authorization, async (req, res) => {
    const userID = req.userId;
    const { p_id } = req.params;

    try {
        await model.deleteRepost(userID, p_id);
        return res.status(200).json({ msg: "Delete repost" });
    } catch (error) {
        console.error("Error when deleting repost:", error);
        return res.status(500).json({ msg: "Failed to delete repost" });
    }
});

export default router;