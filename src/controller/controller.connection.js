const ConnectionModel = require("../model/model.connections.js");
const AlumniModel = require("../model/model.alumni.js");

const sendRequest = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const { alumniId } = req.body;

        if (!alumniId) {
            return res.status(400).json({
                success: false,
                message: "Alumni ID is required.",
            });
        }
        const alumni = await AlumniModel.findById(alumniId);
        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni not found.",
            });
        }
        const existingConnection = await ConnectionModel.findOne({
            studentId,
            alumniId,
        });
        if (existingConnection) {
            return res.status(400).json({
                success: false,
                message: "Connection already exists.",
            });
        }
        const connection = new ConnectionModel({
            studentId,
            alumniId,
        });
        await connection.save();
        res.status(201).json({
            success: true,
            message: "Connection request sent successfully.",
        });
    } catch (error) {
        console.error("Error sending connection request:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const alumniId = req.user.userId;
        const { connectionId } = req.body;

        if (!connectionId) {
            return res.status(400).json({
                success: false,
                message: "Connection ID is required.",
            });
        }
        const connection = await ConnectionModel.findById(connectionId);
        if (!connection || connection.alumniId.toString() !== alumniId) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found.",
            });
        }
        connection.status = "accepted";
        await connection.save();
        res.status(200).json({
            success: true,
            message: "Connection request accepted successfully.",
        });
    } catch (error) {
        console.error("Error accepting connection request:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const alumniId = req.user.userId;
        const { connectionId } = req.body;

        if (!connectionId) {
            return res.status(400).json({
                success: false,
                message: "Connection ID is required.",
            });
        }
        const connection = await ConnectionModel.findById(connectionId);
        if (!connection || connection.alumniId.toString() !== alumniId) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found.",
            });
        }
        await ConnectionModel.findByIdAndDelete(connectionId);
        res.status(200).json({
            success: true,
            message: "Connection request rejected successfully.",
        });
    } catch (error) {
        console.error("Error rejecting connection request:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const getConnections = async (req, res) => {
    try {
        const { userId, userType } = req.user;
        const filter =
            userType === "Student"
                ? { studentId: userId }
                : { alumniId: userId };
        const connections = await ConnectionModel.find(filter);
        res.status(200).json(connections);
    } catch (error) {
        console.error("Error getting connections:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

module.exports = {
    sendRequest,
    acceptRequest,
    rejectRequest,
    getConnections,
};
