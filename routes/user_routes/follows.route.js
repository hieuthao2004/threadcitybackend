import express from 'express';
import authorization from '../../middleware/authorization.js';
import FollowsModel from '../../models/FollowsModel.js';
const router = express.Router();
const followsModel = new FollowsModel();

router.post("/follows/:u_id/followed", authorization, async (req, res) => {
    const userId = req.userId;
    const { u_id } = req.params;

    try {
        const isAlreadyFollowed = await followsModel.isFollowed(userId, u_id);
        if (isAlreadyFollowed) {
            return res.status(400).json({ msg: "Already following this user" });
        }

        await followsModel.followPeople(userId, u_id);
        return res.status(200).json({ msg: "Now following", followed: true });
    } catch (error) {
        console.error("Error in follow route:", error);
        return res.status(500).json({ msg: "Something went wrong" });
    }
});

router.delete("/follows/:u_id", authorization, async (req, res) => {
    const userId = req.userId;
    const { u_id: following_id } = req.params;

    try {
        const result = await followsModel.unfollowPeople(userId, following_id);

        if (result.unfollowed) {
            return res.status(200).json({ msg: "Unfollowed successfully", unfollowed: true });
        } else {
            return res.status(404).json({ msg: "Follow relationship not found", unfollowed: false });
        }
    } catch (error) {
        console.error("Error in unfollow route:", error);
        return res.status(500).json({ msg: "Something went wrong" });
    }
});

router.get("/follows/followers", authorization, async (req, res) => {
    try {
        const userId = req.userId;
        const allFollowers = await followsModel.getFollowers(userId);
        return res.status(200).json({ msg: "Getting all followers", allFollowers });
    } catch (error) {
        console.error("Error getting followers:", error);
        return res.status(500).json({ msg: "Failed to get followers" });
    }
});

router.get("/follows/following", authorization, async (req, res) => {
    try {
        const user_id = req.userId;
        const allFollowings = await followsModel.getFollowing(user_id);
        return res.status(200).json({ msg: "Getting all followings", allFollowings });
    } catch (error) {
        console.error("Error getting followings:", error);
        return res.status(500).json({ msg: "Failed to get followings" });
    }
});

export default router;