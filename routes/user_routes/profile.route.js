import express from 'express';
import authorization from '../../middleware/authorization.js';
import uploadImageMiddleware from '../../middleware/uploadMiddleware.js';
import UsersModel from '../../models/UsersModel.js';
import PostsModel from '../../models/PostsModel.js';
import { usersIndex } from '../../services/algolia.js';
const router = express.Router();
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
    const updateData = req.body; 
    
    try {
        const currentUsername = await model.getUsername(userID);
        if (currentUsername !== username) {
            return res.status(403).json({ msg: "Unauthorized to edit this profile" });
        }
        await model.updateUserData(userID, updateData);
        
        const updatedUser = await model.getUserById(userID);
        
        await usersIndex.partialUpdateObject({
            objectID: userID,
            ...updateData,
            username: updatedUser.u_username,
            fullname: updatedUser.u_fullname,
            avatar: updatedUser.u_avatar,
            bio: updatedUser.u_bio
        });

        return res.status(200).json({ 
            msg: "Profile updated successfully",
            user: {
                username: updatedUser.u_username,
                fullname: updatedUser.u_fullname,
                avatar: updatedUser.u_avatar,
                bio: updatedUser.u_bio
            }
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ 
            msg: "Failed to update profile",
            error: error.message 
        });
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


//keep the REST API route for image uploads
router.put("/profile/avatar", authorization, uploadImageMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const imageUrl = req.imageUrl; // This comes from the uploadImageMiddleware
    
    if (!imageUrl) {
      return res.status(400).json({ msg: "No image provided" });
    }
    
    await model.updateAvatar(userId, imageUrl);
    
    return res.status(200).json({ 
      msg: "Avatar updated successfully",
      avatarUrl: imageUrl
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return res.status(500).json({ msg: "Failed to update avatar" });
  }
});

export default router;