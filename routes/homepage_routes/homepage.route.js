import express from 'express';
import authorization from '../../middleware/authorization.js';
import uploadImageMiddleware from '../../middleware/uploadMiddleware.js';  // Import the middleware
import PostsModel from '../../models/PostsModel.js';
import UsersModel from '../../models/UsersModel.js';
import NotificationsModel from '../../models/NotificationsModel.js';
import { index } from '../../services/algolia.js';
import { usersIndex } from '../../services/algolia.js';

const router = express.Router();
const model = new PostsModel();
const userModel = new UsersModel();
const notificationsModel = new NotificationsModel();

router.get("/search_posts", async (req, res) => {
    const { query } = req.query;
    
    try {
        const { hits } = await index.search(query, {
            attributesToRetrieve: ['p_content', 'p_creater', 'p_create_at', 'p_image_url'],
            hitsPerPage: 10
        });        

        return res.status(200).json(hits);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error searching posts" });
    }
});


router.get("/searchs_users", async (req, res) => {
    const { query } = req.query;
    
    try {
        const { hits } = await usersIndex.search(query, {
            attributesToRetrieve: ['username', 'u_fullname', 'avatar', 'bio'],
            hitsPerPage: 10,
            // filters: 'u_isBanned: false'
        });

        return res.status(200).json(hits);
    } catch (error) {
        return res.status(500).json({ msg: "Error searching users" });
    }
});

// CRUD post
router.post("/create_post", authorization, uploadImageMiddleware, async (req, res) => {
    console.log('Request body:', req.body);
    const userID = req.userId;
    const { content } = req.body;
    const imageUrl = req.imageUrl || ""; // Get image URL from middleware
    
    try {
        // Check if post has at least content or image
        if ((!content || content.trim().length === 0) && !imageUrl) {
            console.log('Validation failed: Post must have content or image');
            return res.status(400).json({ 
                message: "Post must contain either text content or an image" 
            });
        }

        const postData = {
            u_id: userID,
            p_creater: await userModel.getUsername(userID),
            p_content: content ? content.trim() : "",
            p_create_at: new Date(),
            p_is_visible: true,
            p_image_url: imageUrl, // Add the image URL from middleware
        };

        console.log('Attempting to create post with data:', postData);
        const post = await model.createPost(postData);
        console.log('Created post:', post);
        
        if (!post) {
            console.log('Post creation failed - no post returned');
            return res.status(500).json({ 
                message: "Failed to create post" 
            });
        }

        const objectID = post.id || `post_${Date.now()}`;
        console.log('Generated objectID:', objectID);

        try {
            // Include image URL in Algolia indexing
            await index.saveObject({
                objectID,
                ...postData,
                id: objectID
            });
            console.log('Saved to Algolia successfully');
        } catch (algoliaError) {
            console.error('Algolia save error:', algoliaError);
        }
        
        return res.status(200).json({ 
            message: "Post created successfully",
            post: {
                id: objectID,
                ...postData
            }
        });

    } catch (error) {
        console.error("Create post error:", error);
        return res.status(500).json({ 
            message: "Failed to create post",
            error: error.message
        });
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
        const updatedPost = await model.updatePost(user, p_id, newContent);
        await index.saveObject({
            objectID: updatedPost.id, 
            p_content: updatedPost.p_content,
            p_updateAt: updatedPost.p_updateAt, 
            p_is_visible: true, 
            p_image_url: "" 
        });

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
        const post = await model.softDeletePost(p_id, userId);
        await index.partialUpdateObject({
            objectID: post.id,
            p_is_visible: false
        });
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
        const postOwner = await model.getPostOwner(p_id);
        const actioner = await userModel.getUsername(userID);
        const msg = `${actioner} liked your post`

        await notificationsModel.createNotification(postOwner, userID, 'like', p_id, msg);

        return res.status(200).json({
            msg: result ? "Post liked!" : "Already liked!",
            liked: result
        });
    } catch (error) {
        console.error("Error liking post:", error);
        return res.status(500).json({ msg: "Failed to like post" });
    }
});

// implement here
router.delete("/posts/:p_id/disliked", authorization, async (req, res) => {
    const { p_id } = req.params;
    const userId = req.userId;

    try {
        const result = await model.unLikedPost(userId, p_id);
        if (result) {
            const postOwner = await model.getPostOwner(p_id);
            await notificationsModel.deleteNotification(userId, postOwner, p_id, 'like');
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
        const receiver_id = await model.getPostOwner(p_id);
        const username = await userModel.getUsername(user_id);
        const msg = `${username} commented on your post`;
        await notificationsModel.createNotification(receiver_id, user_id, 'comment', p_id, msg);
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
        const postOwner = await model.getPostOwner(p_id);
        await notificationsModel.deleteNotification(userId, postOwner, p_id, 'comment');
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

router.delete("/profile/posts/:p_id/unsaved", authorization, async (req, res) => {
    try {
        const userID = req.userId;
        const username = await userModel.getUsername(userID);
        const { p_id } = req.params;

        const result = await model.deleteSavePost(username, p_id);

        if (!result) {
            return res.status(404).json({
                msg: "Post was not saved",
                unsaved: false
            });
        }

        return res.status(200).json({
            msg: "Post unsaved successfully",
            unsaved: true
        });
    } catch (error) {
        console.error("Error unsaving post:", error);
        return res.status(500).json({ msg: "Failed to unsave post" });
    }
});

// CD repost
router.post("/posts/:p_id/reposted", authorization, async (req, res) => {
    const userId = req.userId;
    const { p_id } = req.params;
    const { repostContent } = req.body;

    try {
        const username = await userModel.getUsername(userId);
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
        const receiver_id = await model.getPostOwner(p_id);
        const sender_username = await userModel.getUsername(userId);
        const msg = `${sender_username} reposted your post`;
        await notificationsModel.createNotification(receiver_id, userId, 'repost', p_id, msg);
        return res.status(200).json({ msg: "Reposted", id: repostId });

    } catch (error) {
        console.error("Error while reposting post:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

router.delete("/posts/:p_id/unreposted", authorization, async (req, res) => {
    const userId = req.userId;
    const { p_id } = req.params;

    try {
        await model.deleteRepost(userId, p_id);
        const postOwner = await model.getPostOwner(p_id);
        await notificationsModel.deleteNotification(userId, postOwner, p_id, 'repost');
        return res.status(200).json({ msg: "Delete repost" });
    } catch (error) {
        console.error("Error when deleting repost:", error);
        return res.status(500).json({ msg: "Failed to delete repost" });
    }
});

export default router;