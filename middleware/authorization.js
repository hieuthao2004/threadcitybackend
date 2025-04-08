const jwt = require('jsonwebtoken');

const authorization = async (req, res, next) => {
    const token = req.cookieds.access_token;
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

exports.module = authorization;