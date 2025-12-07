const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserModel = require("../model/model.user");
const AlumniModel = require("../model/model.alumni");
const AdminModel = require("../model/model.admin");
const AuditLog = require('../model/model.auditLog');

const registerAlumni = async (req, res) => {
    const { name, email, password, graduationYear, degreeUrl } = req.body;
    if (!name || !email || !password || !graduationYear || !degreeUrl) {
        return res.status(400).json({ success: false, error: "All fields are required." });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            name,
            email,
            passwordHash: hashedPassword,
            userType: "Alumni",
        });
        await user.save({ session });

        const alumni = new AlumniModel({
            userId: user._id,
            graduationYear,
            degreeUrl,
        });
        await alumni.save({ session });

        user.profileDetails = alumni._id;
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ success: true, data: null, message: "Alumni registered successfully." });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error registering alumni:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    } finally {
        session.endSession();
    }
};

const registerStudent = async (req, res) => {
    const { name, email, password, enrollmentYear, expectedGraduation, course, rollNumber, phone } = req.body;
    if (!name || !email || !password || !enrollmentYear || !expectedGraduation || !course || !rollNumber) {
        return res.status(400).json({ success: false, error: "All fields are required for student registration." });
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const existingUser = await UserModel.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, error: "User already exists with this email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModel({
            name,
            email,
            passwordHash: hashedPassword,
            userType: "Student",
            phone,
        });
        await user.save({ session });

        // create student profile
        const StudentModel = require('../model/model.student');
        const student = new StudentModel({
            userId: user._id,
            academic: {
                entryDate: new Date(),
                expectedGraduationDate: new Date(expectedGraduation),
                degreeType: course,
                degreeName: course,
            },
        });
        await student.save({ session });

        user.profileDetails = student._id;
        await user.save({ session });

        await session.commitTransaction();
        res.status(201).json({ success: true, data: null, message: "Student registered successfully." });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error registering student:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    } finally {
        session.endSession();
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    console.log(`[Auth] Login attempt for email: ${email}`);
    try {
        const user = await UserModel.findOne({ email });
        if (!user) console.warn(`[Auth] No user found with email: ${email}`);
        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid email or password." });
        }
        if (user.userType === "Alumni") {
            if (!user.profileDetails) {
                return res.status(403).json({ success: false, error: "Alumni profile not found." });
            }
            const alumni = await AlumniModel.findById(user.profileDetails);
            if (!alumni.verified) {
                return res.status(403).json({ success: false, error: "Alumni account not verified." });
            }
        }
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );
        if (!isPasswordValid) {
            console.warn(`[Auth] Invalid password for user: ${email} id=${user._id}`);
            return res.status(401).json({ success: false, error: "Invalid email or password." });
        }

        const token = jwt.sign({ userId: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const sanitizedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            createdAt: user.createdAt,
        };
        console.log(`[Auth] Login successful for user: ${email} id=${user._id} type=${user.userType}`);
        res.status(200).json({ success: true, data: { token, user: sanitizedUser }, message: "Login successful." });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
};

const registerAdmin = async (req, res) => {
    const { name, email, password, adminType, address, phone, bio } = req.body;

    // Validate required fields
    if (!name || !email || !password || !address?.street || !address?.city || !address?.state || !phone) {
        return res.status(400).json({
            success: false,
            error: "Name, email, password, address (street, city, state), and phone are required."
        });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, error: "User already exists with this email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            name,
            email,
            passwordHash: hashedPassword,
            userType: "Admin",
        });
        await user.save({ session });

        const admin = new AdminModel({
            userId: user._id,
            adminType: adminType || 'college',
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                country: address.country || 'India',
            },
            phone,
            bio: bio || '',
        });
        await admin.save({ session });

        user.profileDetails = admin._id;
        await user.save({ session });

        await session.commitTransaction();

        res.status(201).json({ success: true, data: null, message: "Admin registered successfully." });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error registering admin:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    } finally {
        session.endSession();
    }
};

const verifyAlumni = async (req, res) => {
    const { alumniId } = req.params;

    try {
        const alumni = await AlumniModel.findById(alumniId);
        if (!alumni) {
            return res.status(404).json({ success: false, error: "Alumni not found." });
        }

        alumni.verified = true;
        await alumni.save();

        // Log audit with actor info if available
        try {
            const actorId = req.adminId || req.user?.userId || null;
            const actorType = req.user?.userType === 'Admin' ? 'Admin' : 'User';
            await AuditLog.create({
                action: 'VERIFY',
                resourceType: 'Alumni',
                resourceId: alumni._id,
                actor: actorId,
                actorType: actorType,
                actorEmail: req.user?.email || null,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: { triggeredBy: actorId ? 'admin' : 'internal' }
            });
        } catch (err) {
            // Do not block on audit log errors
            console.warn('Failed to create audit log for alumni verification', err?.message || err);
        }

        res.status(200).json({ success: true, data: null, message: "Alumni verified successfully." });
    } catch (error) {
        console.error("Error verifying alumni:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required",
            });
        }

        const user = await UserModel.findOne({ email, userType: "Admin" }).populate('profileDetails');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Incorrect email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "Incorrect email or password",
            });
        }

        const adminData = {
            id: user._id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            profileDetails: user.profileDetails,
        };

        const token = jwt.sign(adminData, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: adminData,
            },
        });
    } catch (error) {
        console.error("Error logging in admin:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

const resetAdminPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user?.id;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "All fields are required",
            });
        }

        const user = await UserModel.findById(userId);
        if (!user || user.userType !== "Admin") {
            return res.status(404).json({
                success: false,
                error: "Admin not found",
            });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "Incorrect old password",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("Error resetting admin password:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

module.exports = {
    registerAlumni,
    registerStudent,
    registerAdmin,
    login,
    verifyAlumni,
    loginAdmin,
    resetAdminPassword,
};
