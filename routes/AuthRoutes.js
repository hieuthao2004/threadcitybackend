const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authorization = require("../middleware/authorization");

const users = [
    { id: 1, username: 'john', password: '1234', role: 'captain' },
    { id: 2, username: 'alice', password: 'abcd', role: 'admin' }
];

router.post("/auth", async (req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({message: "Invalid credential!"});
    };

    const token = jwt.sign({id: user.id, role: user.role}, "YOUR_SECRET_KEY");
    return res.cookie("access_token", token, {httpOnly: true, secure: process.env.NODE_ENV === "production"}).status(200).json({message: "Logged in"});
});

router.get("/logout", authorization, async (req, res) => {
    return res.clearCookie("access_token").status(200).json({message: "Logged out"})
});

router.get("/protected", authorization, async (req, res) => {
    return res.json({msg: "Good" , user: { id: req.userId, role: req.userRole } });
})

router.post("/register", (req, res) => {
    const {username, password} = req.body;
    if (username !== users.find(user => user.username)) {
        res.json("Created account!")
    }
})


module.exports = router;
