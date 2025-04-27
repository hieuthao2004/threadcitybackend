import jwt from 'jsonwebtoken';

const authorization = async (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Decoded token:', decoded);

        req.userId = decoded.id;
        req.userUsername = decoded.username;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        return res.status(403).json({
            success: false,
            message: "Invalid token"
        });
    }
};

export default authorization;