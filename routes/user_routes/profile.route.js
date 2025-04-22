import express from 'express';
import authorization from '../../middleware/authorization.js';
const router = express.Router();
import UsersModel from '../../models/UsersModel.js';
import PostsModel from '../../models/PostsModel.js';
const model = new UsersModel();
const postModel = new PostsModel();

// generally get a user data be default
router.get("/profile/@:username", async (req, res) => {
    const { username } = req.params;

    try {
        const userData = await model.getUserData(username);

        if (!userData) {
            return res.status(404).json({ msg: "User not found" });
        }

        return res.status(200).json({ msg: "Good", userData });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

router.put("/profile/@:username", authorization, async (req, res) => {
    const userID = req.userId;
    const { username } = req.params;
    const content = req.body.content;
    
    try {
        if (await model.getUsername(userID) !== username) {
            return res.status(401).json({ msg: "Unauthorized to change other profile!" });
        } else {
            await model.updateUserData(userID, content);
            return res.status(200).json({ msg: "Profile updated successfully!" });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(400).json({ msg: error.message || "An error occurred while updating profile." });
    }
});

router.get("/profile/comments", authorization, async (req, res) => {
    try {
        const userID = req.userId;
        const alldata = await model.getUserComments(userID);
        return res.status(200).json({msg: "All comments", allUserComments: alldata});
    } catch (error) {
        return res.status(400).json({msg: "An error occurred while getting all user comments."});
    }
});

router.get("/profile/posts", authorization, async (req, res) => {
    try {
        const userID = req.userId;
        const username = await model.getUsername(userID);        
        const allPosts = await model.getUserPosts(username);
        return res.status(200).json({msg: "Good", allUserPosts: allPosts})
    } catch (error) {
        return res.status(400).json({msg: "An error occurred while getting all user posts."});
    }
});

router.get("/profile/posts/saved", authorization, async (req, res) => {
    try {
        const userId = req.userId;

        const allSavedPosts = await model.getAllUserSavePosts(userId);

        return res.status(200).json({
            msg: "Fetched saved posts successfully",
            savedPosts: allSavedPosts
        });
    } catch (error) {
        console.error("Error fetching saved posts:", error);
        return res.status(500).json({ msg: "Failed to fetch saved posts" });
    }
});

router.get("/profile/posts/:p_id/saved", authorization, async (req, res) => {
    try {
        const userId = req.userId;
        const { p_id } = req.params;

        const safeDataSavedPost = await postModel.getSavePost(userId,p_id);

        return res.status(200).json({
            msg: "Get saved post successfully",
            savedPost: safeDataSavedPost
        });
    } catch (error) {
        console.error("Error fetching saved posts:", error);
        return res.status(500).json({ msg: "Failed to fetch saved posts" });
    }
});

router.delete("/profile/posts/:p_id/unsaved", authorization, async (req, res) => {
    try {
        const userId = req.userId;
        const {p_id} = req.params;
        await postModel.deleteSavePost(userId, p_id);
        return res.status(200).json({msg: "Deleted save post"})
    } catch (error) {
        return res.status(500).json({ msg: "Failed to delete saved posts" });
    }
});




export default router;