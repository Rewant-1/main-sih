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

// captureAdminAction: middleware to capture admin ID for audit logging
// This adds x-admin-id to headers and req.adminId for use in controllers
const captureAdminAction = (req, res, next) => {
    if (req.user && req.user.userType?.toLowerCase() === 'admin') {
        req.adminId = req.user.id;
        // Set header for downstream services or logging
        req.headers['x-admin-id'] = req.user.id;
        
        if (process.env.NODE_ENV === 'development') {
            console.debug('[Admin Action] Captured admin ID:', req.adminId);
        }
    }
    next();
};

// allowInternalOrAdmin: allow request if either the internal API key is present
// or the user has an authenticated Admin token. This is useful for endpoints
// that can be invoked by services or admins (eg. verifyAlumni).
const allowInternalOrAdmin = (req, res, next) => {
    const apiKey = req.headers['x-internal-api-key'];
    if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
        return next();
    }

    // Not an internal call. Verify JWT and admin role.
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid access token' });
        }
        // Only allow Admin user type
        if (user.userType?.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only' });
        }
        req.user = user;
        // capture admin id for audit logging
        req.adminId = user.id;
        // set header for downstream logging if needed
        req.headers['x-admin-id'] = user.id;
        next();
    });
};

module.exports = { 
    internalAuth, 
    authenticateToken, 
    checkRole,
    protect,
    authorize,
    authMiddleware,
    captureAdminAction
    , allowInternalOrAdmin
};
