import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UsersModel from '../models/UsersModel.js';

const router = express.Router();
const model = new UsersModel();

router.get("/register", async (req, res) => {
    return res.json({email: "", username: "", password: ""});
});

router.post("/register", async (req, res) => {
    const { username, password, email } = req.body;
    
    if (await model.checkUserExistByEmail(email)) {
        return res.status(403).json({msg: "Existed email!"});
    } else if (await model.checkUserExistByUsername(username)) {
        return res.status(403).json({msg: "Existed username!"});
    }
    const hashedPassword = await bcrypt.hash(password,  await bcrypt.genSalt(10));
    try {
        const userData = {
            u_email: email,
            u_username: username,
            u_fullname: "",
            u_password: hashedPassword,
            u_createAt: new Date(),
            u_status: false,
            u_role: 'user',
            u_bio: "",
            u_avatar: "",
            u_isBanned: false
        }
        const user = await model.createUser(userData);
        if (user) {
            const token = jwt.sign({id: user.id, role: user.role}, "YOUR_SECRET_KEY");
            return res.status(200).cookie("access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" }).json({msg: "Created account!"});
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Server Error!" });
    }


    
});

export default router;