const express = require('express');
const router = express.Router();
const authorization = require('../../middleware/authorization');

router.get("/protected", authorization , (req, res) => {
    return res.json({
        msg: "Good",
        user: {
            id: req.userId,
            role: req.userRole
        }
    });
});

module.exports = router;
