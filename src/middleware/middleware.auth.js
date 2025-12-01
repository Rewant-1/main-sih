const jwt = require("jsonwebtoken");

const internalAuth = (req, res, next) => {
    const apiKey = req.headers["x-internal-api-key"];
    if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Unauthorized access.",
        });
    }
};

const authenticateToken = (req, res, next) => {
    const token =
        req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid access token" });
        }
        req.user = user;
        next();
    });
};

const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.userType === role) {
            next();
        } else {
            res.status(403).json({ message: "Forbidden: Insufficient rights" });
        }
    };
};

module.exports = { internalAuth, authenticateToken, checkRole };
