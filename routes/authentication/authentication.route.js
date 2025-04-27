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
        const user = await model.findUser(username);   
        if (user) {
            const isMatched = await bcrypt.compare(password, user.u_password);
            if (isMatched) {                
                const token = jwt.sign(
                    {
                        id: user.id, 
                        role: user.u_role, 
                        username: user.u_username
                    }, 
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN }
                );
                
                await model.loginStatus(user.id);
                
                return res
                    .cookie("access_token", token, { 
                        httpOnly: true, 
                        secure: process.env.NODE_ENV === "production",
                        sameSite: 'strict'
                    })
                    .status(200)
                    .json({ 
                        success: true,
                        message: "Logged in successfully" 
                    });
            }
        }
        
        return res.status(401).json({ 
            success: false,
            message: "Invalid username or password" 
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server Error!" 
        });
    }
});

router.get("/logout", authorization, async (req, res) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await model.logoutStatus(decoded.id);
        
        return res
            .clearCookie("access_token")
            .status(200)
            .json({
                success: true,
                message: "Logged out successfully"
            });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: "Error during logout"
        });
    }
});

export default router;