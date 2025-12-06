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

    if (process.env.NODE_ENV === 'development') {
        try {
            console.debug('[Auth] Authorization header present, token startsWith:', token?.slice(0,6));
        } catch(e) {}
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid access token" });
        }
        req.user = user;
        if (process.env.NODE_ENV === 'development') {
            try {
                console.debug('[Auth] token payload:', JSON.stringify(user));
            } catch (e) {}
        }
        next();
    });
};

const checkRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        
        // Normalize role comparison - handle both array and string inputs
        const userRole = req.user.userType?.toLowerCase();
        let allowedRoles;
        
        if (Array.isArray(role)) {
            allowedRoles = role.map(r => r.toLowerCase());
        } else {
            allowedRoles = [role.toLowerCase()];
        }
        
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: "Forbidden: Insufficient rights" });
        }
    };
};

// Alias for authenticateToken - used by various routes
const protect = authenticateToken;

// Alias for authMiddleware - used by campaign, survey, successStory routes
const authMiddleware = authenticateToken;

// authorize: checks if user has one of the allowed roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        // Normalize role comparison (handle case differences)
        const userRole = req.user.userType?.toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());
        
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: "Forbidden: Insufficient rights" });
        }
    };
};

module.exports = { 
    internalAuth, 
    authenticateToken, 
    checkRole,
    protect,
    authorize,
    authMiddleware
};
