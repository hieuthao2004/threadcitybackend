import express from 'express';
import authorization from '../../middleware/authorization.js';
const router = express.Router();
import UsersModel from '../../models/UsersModel.js';
const model = new UsersModel();

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


export default router;