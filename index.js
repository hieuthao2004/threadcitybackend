const express = require('express');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001;

const DBService = require("./services/db.service");

app.use(express.json());
app.use(cookieParser());

;

const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, "YOUR_SECRET_KEY");
        req.userId = data.id;
        req.userRole = data.role;
        return next();
    } catch {
        return res.sendStatus(403);
    }
};

app.post("/auth", (req, res) => {
    const { username, password } = req.body;

    const user = DBService.authenticateUser(username, password);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, "YOUR_SECRET_KEY");
    console.log("Generated token:", token);
    
    return res
        .cookie("access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
        .status(200)
        .json({ message: "Logged in" });
});

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    
    try {
        const user = await DBService.authenticateUser(username, password);
        if (user) {
            return res.status(403).json({msg: "Existed account!"});
        };
        const userData = {
            username: username,
            password: password,
            role: 'user',
            createAt: new Date()
        }
        await DBService.createUser(userData);
        return res.status(200).json({ message: "Account created successfully"});
    } catch (error) {
        console.error(error);
        
    }
});

app.get("/", authorization, (req, res) => {
    return res.json({ message: "Hello world!" });
});


app.get("/logout", authorization, (req, res) => {
    return res.clearCookie("access_token").status(200).json({ message: "Logged out" });
});

app.get("/protected", authorization, (req, res) => {
    return res.json({msg: "Good" , user: { id: req.userId, role: req.userRole } });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
