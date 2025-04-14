import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import authorization from '../../middleware/authorization.js';
import UsersModel from '../../models/UsersModel.js';

const router = express.Router();
const model = new UsersModel();

router.post("/auth", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await model.findUserByUsername(username)        
        if (user) {
            const isMatched = await bcrypt.compare(password, user.u_password);
            if (isMatched) {                
                const token = jwt.sign({id: user.id, role: user.u_role}, "YOUR_SECRET_KEY");
                await model.loginStatus(user.id);
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
        await model.logoutStatus(userId);
        return res.clearCookie("access_token").status(200).json({msg: "Logged out!"})
    }
})

export default router;