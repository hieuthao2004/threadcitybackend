const express = require('express');
const router = express.Router();
const DBService = require('../services/db.service');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")

router.get("/register", async (req, res) => {
    return res.json({email: "", username: "", password: ""});
});

router.post("/register", async (req, res) => {
    const { username, password, email } = req.body;
    if (await DBService.findUserByEmail(email)) {
        return res.status(403).json({msg: "Existed email!"});
    } else if (await DBService.findUserByUsername(username)) {
        return res.status(403).json({msg: "Existed username!"});
    } else {
        const hashedPassword = await bcrypt.hash(password,  await bcrypt.genSalt(10));
        try {
            const userData = {
                u_email: email,
                u_username: username,
                u_password: hashedPassword,
                u_createAt: new Date(),
                u_status: false,
                u_role: 'user',
                u_bio: "",
            }
            const user = await DBService.createUser(userData);
            if (user) {
                const token = jwt.sign({id: user.id, role: user.role}, "YOUR_SECRET_KEY");
                return res.status(200).json({msg: "Created account!"}).cookie("access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
            } else {
                return res.status(401).json({ message: "Invalid credentials" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Server Error!" });
        }
    }
})

module.exports = router;