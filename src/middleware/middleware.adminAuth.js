const jwt = require("jsonwebtoken");
const AdminModel = require("../model/model.admin");

// Verify Admin Token - For admin panel routes only
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided",
            });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find admin by ID
        const admin = await AdminModel.findById(decoded.id);
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid or inactive admin",
            });
        }

        // Attach admin info to request
        req.admin = {
            _id: admin._id,
            id: admin._id,
            adminId: admin.adminId, // College group ID
            name: admin.name,
            email: admin.email,
            adminType: admin.adminType,
            instituteName: admin.instituteName,
            isSuperAdmin: admin.isSuperAdmin || false,
        };

        next();
    } catch (error) {
        console.error("Admin auth error:", error);
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid token",
            error: error.message,
        });
    }
};

// Check if admin is super admin
const verifySuperAdmin = (req, res, next) => {
    if (!req.admin || !req.admin.isSuperAdmin) {
        return res.status(403).json({
            success: false,
            message: "Forbidden - Super admin access required",
        });
    }
    next();
};

// Internal API Key Auth (for microservice communication)
const verifyInternalApiKey = (req, res, next) => {
    const apiKey = req.headers['x-internal-api-key'];
    const adminId = req.headers['x-admin-id'];
    
    if (apiKey && apiKey === process.env.INTERNAL_API_KEY && adminId) {
        req.admin = {
            adminId: adminId,
            isInternal: true,
        };
        return next();
    }
    
    return res.status(403).json({
        success: false,
        message: "Forbidden - Invalid internal API key",
    });
};

// Allow either admin token or internal API key
const allowAdminOrInternal = async (req, res, next) => {
    const apiKey = req.headers['x-internal-api-key'];
    const adminId = req.headers['x-admin-id'];
    
    // Try internal API key first
    if (apiKey && apiKey === process.env.INTERNAL_API_KEY && adminId) {
        req.admin = {
            adminId: adminId,
            isInternal: true,
        };
        return next();
    }
    
    // Otherwise require admin token
    return verifyAdmin(req, res, next);
};

module.exports = {
    verifyAdmin,
    verifySuperAdmin,
    verifyInternalApiKey,
    allowAdminOrInternal,
};
