const AdminModel = require("../model/model.admin");
const UserModel = require("../model/model.user");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const AlumniModel = require("../model/model.alumni");
const StudentModel = require("../model/model.student");

const getAdminNames = async (req, res) => {
    try {
        // Filter by adminId - only show admins from same college
        const admins = await AdminModel.find({ 
            adminId: req.admin.adminId,
            isActive: true 
        }).select('_id name email adminType instituteName');
        
        const adminNames = admins.map((admin) => ({
            name: admin.name,
            email: admin.email,
            id: admin._id,
            adminType: admin.adminType,
            instituteName: admin.instituteName,
        }));

        if (!adminNames || adminNames.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No admins found",
            });
        }

        return res.status(200).json({
            success: true,
            data: adminNames,
        });
    } catch (error) {
        console.error("Error fetching admin names:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Only allow viewing admins from same college
        const admin = await AdminModel.findOne({ 
            _id: id,
            adminId: req.admin.adminId 
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                adminType: admin.adminType,
                instituteName: admin.instituteName,
                adminId: admin.adminId,
                address: admin.address,
                phone: admin.phone,
                bio: admin.bio,
                connections: admin.connections,
                verified: admin.verified,
                createdAt: admin.createdAt,
            },
        });
    } catch (error) {
        console.error("Error fetching admin by ID:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Only allow updating specific fields
        const allowedFields = ['name', 'address', 'phone', 'bio', 'instituteName'];
        const updates = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        }

        // Only update admins from same college
        const admin = await AdminModel.findOneAndUpdate(
            { _id: id, adminId: req.admin.adminId },
            updates,
            { new: true, runValidators: true }
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Admin updated successfully",
            data: admin,
        });
    } catch (error) {
        console.error("Error updating admin:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Only delete admins from same college
        const admin = await AdminModel.findOne({ 
            _id: id,
            adminId: req.admin.adminId 
        });
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        // Soft delete - mark as inactive
        admin.isActive = false;
        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Admin deactivated successfully",
        });
    } catch (error) {
        console.error("Error deleting admin:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin creates a new user (Student or Alumni)
const createUser = async (req, res) => {
    try {
        const { name, email, password, userType, phone, bio, graduationYear, degreeUrl, academic } = req.body;

        if (!name || !email || !password || !userType) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, and userType are required",
            });
        }

        if (!['Student', 'Alumni'].includes(userType)) {
            return res.status(400).json({
                success: false,
                message: "userType must be either 'Student' or 'Alumni'",
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check if user already exists
            const existingUser = await UserModel.findOne({ email }).session(session);
            if (existingUser) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user with admin's adminId for college segregation
            const user = new UserModel({
                name,
                email,
                passwordHash: hashedPassword,
                userType,
                phone: phone || '',
                adminId: req.admin.adminId, // Link to college
            });
            await user.save({ session });

            // Create profile based on userType
            let profile;
            if (userType === 'Alumni') {
                if (!graduationYear || !degreeUrl) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        success: false,
                        message: "graduationYear and degreeUrl are required for Alumni",
                    });
                }
                profile = new AlumniModel({
                    userId: user._id,
                    adminId: req.admin.adminId, // Link to college
                    graduationYear,
                    degreeUrl,
                    verified: false, // Admin can verify later
                });
                await profile.save({ session });
            } else if (userType === 'Student') {
                if (!academic || !academic.degreeType || !academic.degreeName) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        success: false,
                        message: "academic information (degreeType, degreeName) is required for Student",
                    });
                }
                // Generate a unique student identifier to avoid duplicate index collisions
                const generatedStudentId = `S${Date.now()}${Math.floor(Math.random() * 10000)}`;
                profile = new StudentModel({
                    userId: user._id,
                    adminId: req.admin.adminId, // Link to college
                    academic: academic,
                    student_id: generatedStudentId,
                });
                await profile.save({ session });
            }

            user.profileDetails = profile._id;
            await user.save({ session });

            await session.commitTransaction();

            return res.status(201).json({
                success: true,
                message: `${userType} created successfully`,
                data: {
                    userId: user._id,
                    profileId: profile._id,
                },
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin updates a user
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Only update users from same college
        const user = await UserModel.findOne({ 
            _id: id,
            adminId: req.admin.adminId 
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update allowed fields on User model
        if (updateData.name) user.name = updateData.name;
        if (updateData.phone) user.phone = updateData.phone;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin deletes a user and their profile
const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Only delete users from same college
        const user = await UserModel.findOne({ 
            _id: id,
            adminId: req.admin.adminId 
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Delete profile based on userType
        if (user.profileDetails) {
            if (user.userType === 'Alumni') {
                await AlumniModel.findByIdAndDelete(user.profileDetails);
            } else if (user.userType === 'Student') {
                await StudentModel.findByIdAndDelete(user.profileDetails);
            }
        }

        // Delete user
        await UserModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin awards Moksha coins to a user
const awardMokshaCoins = async (req, res) => {
    try {
        const { userId, coins } = req.body;

        if (!userId || coins === undefined) {
            return res.status(400).json({
                success: false,
                message: "userId and coins are required",
            });
        }

        if (typeof coins !== 'number' || coins < 0) {
            return res.status(400).json({
                success: false,
                message: "coins must be a positive number",
            });
        }

        // Only award coins to users from same college
        const user = await UserModel.findOne({ 
            _id: userId,
            adminId: req.admin.adminId 
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Add coins to user's mokshaCoins
        user.mokshaCoins = (user.mokshaCoins || 0) + coins;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `${coins} Moksha coins awarded successfully`,
            data: {
                userId: user._id,
                totalCoins: user.mokshaCoins,
            },
        });
    } catch (error) {
        console.error("Error awarding Moksha coins:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin awards a tag to a user
const awardTag = async (req, res) => {
    try {
        const { userId, tagName } = req.body;

        if (!userId || !tagName) {
            return res.status(400).json({
                success: false,
                message: "userId and tagName are required",
            });
        }

        // Only award tags to users from same college
        const user = await UserModel.findOne({ 
            _id: userId,
            adminId: req.admin.adminId 
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if tag already exists
        const existingTag = user.tags?.find(tag => tag.name === tagName);
        if (existingTag) {
            return res.status(400).json({
                success: false,
                message: "Tag already awarded to this user",
            });
        }

        // Add new tag with admin's adminId
        if (!user.tags) user.tags = [];
        user.tags.push({
            name: tagName,
            awardedBy: req.admin.adminId,
            awardedAt: new Date(),
        });
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Tag '${tagName}' awarded successfully`,
            data: {
                userId: user._id,
                tags: user.tags,
            },
        });
    } catch (error) {
        console.error("Error awarding tag:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getAdminNames,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    createUser,
    updateUserById,
    deleteUserById,
    awardMokshaCoins,
    awardTag,
};
