const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserModel = require("../model/model.user");
const AlumniModel = require("../model/model.alumni");

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

        const token = jwt.sign({ userId: user._id, userType: user.userType }, process.env.JWT_SECRET);
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
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: "Name, email, and password are required." });
    }

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "User already exists with this email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            name,
            email,
            passwordHash: hashedPassword,
            userType: "Admin",
        });
        await user.save();

        res.status(201).json({ success: true, data: null, message: "Admin registered successfully." });
    } catch (error) {
        console.error("Error registering admin:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
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

        res.status(200).json({ success: true, data: null, message: "Alumni verified successfully." });
    } catch (error) {
        console.error("Error verifying alumni:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
};

module.exports = {
    registerAlumni,
    registerStudent,
    registerAdmin,
    login,
    verifyAlumni,
};
