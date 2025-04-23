import express from 'express';
import authorization from '../../middleware/authorization.js';
import NotificationsModel from '../../models/NotificationsModel.js';
const router = express.Router();
const notificationsModel = new NotificationsModel();

router.get("/notifications", authorization, async (req, res) => {
    try {
        const user_id = req.userId;
        const allNotifications = await notificationsModel.getAllNotifications(user_id);

        return res.status(200).json({
            msg: "Getting all notifications",
            allNotifications
        });
    } catch (error) {
        console.error("Error getting notifications:", error);
        return res.status(500).json({ msg: "Failed to fetch notifications" });
    }
});

module.exports = router;