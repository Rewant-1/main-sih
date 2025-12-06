const AdminModel = require("../model/model.admin");
const UserModel = require("../model/model.user");

const getAdminNames = async (req, res) => {
    try {
        const admins = await AdminModel.find()
            .populate('userId', 'name email')
            .select('_id userId adminType');
        
        const adminNames = admins.map((admin) => ({
            name: admin.userId?.name || 'Unknown',
            email: admin.userId?.email,
            id: admin._id,
            userId: admin.userId?._id,
            adminType: admin.adminType,
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
        
        const admin = await AdminModel.findById(id)
            .populate('userId', 'name email username createdAt');

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
                userId: admin.userId,
                adminType: admin.adminType,
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
        const allowedFields = ['adminType', 'address', 'phone', 'bio'];
        const updates = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        }

        const admin = await AdminModel.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('userId', 'name email');

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

        const admin = await AdminModel.findById(id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        // Delete the admin profile
        await AdminModel.findByIdAndDelete(id);

        // Delete the associated user account
        if (admin.userId) {
            await UserModel.findByIdAndDelete(admin.userId);
        }

        return res.status(200).json({
            success: true,
            message: "Admin deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting admin:", error);
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
};
