const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Bearer <token>
    const tokenString = token.split(' ')[1];

    jwt.verify(tokenString, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (roles.length && !roles.includes(req.userRole)) {
            return res.status(403).json({ message: 'Role not authorized' });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    authorize
};
