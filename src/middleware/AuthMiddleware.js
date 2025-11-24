const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Token Invalid' });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};


