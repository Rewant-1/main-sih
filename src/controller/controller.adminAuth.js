const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminModel = require("../model/model.admin");

// Admin Login - Only for admin panel access
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find admin by email
        const admin = await AdminModel.findOne({ email, isActive: true });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Incorrect email or password",
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password",
            });
        }

        // Create JWT token with admin info
        const tokenData = {
            id: admin._id,
            adminId: admin.adminId,
            name: admin.name,
            email: admin.email,
            adminType: admin.adminType,
            isSuperAdmin: admin.isSuperAdmin || false,
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                admin: {
                    _id: admin._id,
                    adminId: admin.adminId,
                    name: admin.name,
                    email: admin.email,
                    adminType: admin.adminType,
                    instituteName: admin.instituteName,
                    isSuperAdmin: admin.isSuperAdmin || false,
                },
            },
        });
    } catch (error) {
        console.error("Error logging in admin:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Register Admin - Protected by internal API key or super admin
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, instituteName, adminId, address, phone, adminType, bio } = req.body;
        
        // Validate required fields
        if (!name || !email || !password || !instituteName || !adminId || !address?.street || !address?.city || !address?.state || !phone) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided",
            });
        }

        // Check if admin with this email already exists
        const existingAdmin = await AdminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin with this email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = new AdminModel({
            name,
            email,
            password: hashedPassword,
            instituteName,
            adminId, // Group identifier for college
            adminType: adminType || 'college',
            address,
            phone,
            bio: bio || '',
            isActive: true,
            verified: true,
        });

        console.log('Attempting to save admin:', { name, email, adminId });
        await admin.save();
        console.log('Admin saved successfully');

        // Generate token for immediate use
        const tokenData = {
            id: admin._id,
            adminId: admin.adminId,
            name: admin.name,
            email: admin.email,
            adminType: admin.adminType,
            isSuperAdmin: admin.isSuperAdmin || false,
        };
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '7d' });

        console.log('Sending response...');
        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            data: {
                admin: {
                    _id: admin._id,
                    adminId: admin.adminId,
                    name: admin.name,
                    email: admin.email,
                    instituteName: admin.instituteName,
                },
                token,
            },
        });
    } catch (error) {
        console.error("Error registering admin:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const adminId = req.admin?.id || req.admin?._id;

        if (!adminId || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const admin = await AdminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect old password",
            });
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("Error resetting admin password:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = {
    loginAdmin,
    registerAdmin,
    resetPassword,
};
