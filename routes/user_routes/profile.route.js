const express = require('express');
const authorization = require('../../middleware/authorization');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get("/profile/@:username", authorization, async (req, res) => {
    const token = req.cookies.access_token;
    if (token) {
        const userId = jwt.verify(token, "YOUR_SECRET_KEY");
        
    };
});