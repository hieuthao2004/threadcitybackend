import express from 'express'
const router = express.Router();
import authorization from '../../middleware/authorization.js';

router.get("/protected", authorization , (req, res) => {
    return res.json({
        msg: "Good",
        user: {
            id: req.userId,
            role: req.userRole
        }
    });
});

export default router;