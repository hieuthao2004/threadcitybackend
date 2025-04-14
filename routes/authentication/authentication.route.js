const express = require('express');
const router = express.Router();
const DBService = require('../../services/db.service');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const dbService = require('../../services/db.service');
const authorization = require('../../middleware/authorization');

router.post("/auth", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await DBService.findUserByUsername(username);
        if (user) {
            const isMatched = await bcrypt.compare(password, user.u_password);
            if (isMatched) {                
                const token = jwt.sign({id: user.id, role: user.u_role}, "YOUR_SECRET_KEY");
                await dbService.loginStatus(user.id);
                return res.cookie("access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" }).status(200).json({ msg: "Logged in!" });
            } else {
                return res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Server Error!" });
    }
});

router.get("/logout", authorization, async (req, res) => {
    const token = req.cookies.access_token;
    if (token) {     
        const userId = jwt.verify(token, "YOUR_SECRET_KEY").id;   
        await dbService.logoutStatus(userId);
        return res.clearCookie("access_token").status(200).json({msg: "Logged out!"})
    }
})


module.exports = router;