const express = require('express');
const router = express.Router();
const DBService = require('../services/db.service');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")


router.get("/logout", async (req, res) => {
    return res.clearCookie("access_token").status(200).json({msg: "Logged out!"})
})

module.exports = router;