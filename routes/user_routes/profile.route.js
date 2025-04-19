const express = require('express');
const authorization = require('../../middleware/authorization');
const jwt = require('jsonwebtoken');
const router = express.Router();
import UsersModel from '../../models/UsersModel';
const model = new UsersModel();

router.get("/profile/@:username", authorization, async (req, res) => {
    const { username } = req.params;
    try {
        const userData = await model.findUser(username);
        return res.status(200).json({ msg: "Good", userData });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
});


export default router;