const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader) {
            return res.status(401).send({
                message: 'Authorization header is required',
                success: false
            });
        }

        const parts = authHeader.split(' ');
        const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : authHeader;

        if (!token) {
            return res.status(401).send({
                message: 'Bearer token missing',
                success: false
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET environment variable is missing.');
            return res.status(500).send({
                message: 'Server configuration error',
                success: false
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: 'Authentication failed: Token is invalid or expired',
                    success: false
                });
            }

            // Ensure req.body is defined before setting userId
            if (!req.body || typeof req.body !== 'object') {
                req.body = {};
            }
            req.body.userId = decoded.id;
            req.user = { id: decoded.id };
            next();
        });
    } catch (error) {
        console.error('Auth Middleware Exception:', error);
        res.status(401).send({
            message: 'Authentication process failed',
            success: false
        });
    }
};
