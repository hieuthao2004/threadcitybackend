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
    const { fullname, bio, email } = req.body; // Extract specific fields
    
    try {
        // Check if user is authorized to edit this profile
        const currentUsername = await model.getUsername(userID);
        if (currentUsername !== username) {
            return res.status(403).json({ msg: "Unauthorized to edit this profile" });
        }

        // Create update data object with proper field names
        const updateData = {
            u_fullname: fullname,
            u_bio: bio,
            u_email: email
        };

        // Update user data
        await model.updateUserData(userID, updateData);
        
        // Get updated user data
        const updatedUser = await model.getUserById(userID);
        
        // Update search index
        await usersIndex.partialUpdateObject({
            objectID: userID,
            username: updatedUser.u_username,
            fullname: updatedUser.u_fullname,
            bio: updatedUser.u_bio,
            email: updatedUser.u_email
        });

        // Return updated user data
        return res.status(200).json({ 
            msg: "Profile updated successfully",
            userData: {
                u_username: updatedUser.u_username,
                u_fullname: updatedUser.u_fullname,
                u_bio: updatedUser.u_bio,
                u_email: updatedUser.u_email,
                u_avatar: updatedUser.u_avatar
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