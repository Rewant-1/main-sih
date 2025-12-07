const AlumniService = require("../service/service.alumni.js");

const getAlumni = async (req, res) => {
  try {
    const alumni = await AlumniService.getAlumni(req.admin.adminId);
    res.status(200).json({ success: true, data: alumni });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAlumniById = async (req, res) => {
  try {
    const alumni = await AlumniService.getAlumniById(req.params.id, req.admin.adminId);
    if (alumni) {
      res.status(200).json({ success: true, data: alumni });
    } else {
      res.status(404).json({ success: false, error: "Alumni not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateAlumni = async (req, res) => {
  try {
    const alumni = await AlumniService.updateAlumni(req.params.id, req.body, req.admin.adminId);
    if (alumni) {
      res.status(200).json({ success: true, data: alumni });
    } else {
      res.status(404).json({ success: false, error: "Alumni not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const verifyAlumni = async (req, res) => {
  try {
    const alumni = await AlumniService.verifyAlumni(req.params.id, req.admin.adminId);
    if (!alumni) {
      return res.status(404).json({ success: false, error: "Alumni not found" });
    }
    res.status(200).json({ success: true, data: alumni, message: "Alumni verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const UserModel = require("../model/model.user");
const AlumniModel = require("../model/model.alumni");

const createAlumni = async (req, res) => {
  try {
    const { alumni } = req.body;

    if (!Array.isArray(alumni) || alumni.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body: 'alumni' must be a non-empty array",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const createdAlumni = [];

      for (const alumniData of alumni) {
        if (!alumniData.name || !alumniData.email || !alumniData.password || !alumniData.graduationYear || !alumniData.degreeUrl) {
          throw new Error(`Missing required fields for alumni: ${alumniData.email || "Unknown"}`);
        }

        const existingUser = await UserModel.findOne({ email: alumniData.email }).session(session);
        if (existingUser) {
          throw new Error(`User already exists: ${alumniData.email}`);
        }

        const hashedPassword = await bcrypt.hash(alumniData.password, 10);

        const [user] = await UserModel.create([{
          name: alumniData.name,
          email: alumniData.email,
          passwordHash: hashedPassword,
          userType: "Alumni",
          adminId: req.admin.adminId,
        }], { session });

        const [alumni] = await AlumniModel.create([{
          userId: user._id,
          adminId: req.admin.adminId,
          graduationYear: alumniData.graduationYear,
          degreeUrl: alumniData.degreeUrl,
          verified: false, // Admin can verify later
        }], { session });

        user.profileDetails = alumni._id;
        await user.save({ session });
        createdAlumni.push(user);
      }

      await session.commitTransaction();

      return res.status(201).json({
        success: true,
        message: "All alumni created successfully",
        data: createdAlumni,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Transaction Aborted:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  getAlumni,
  getAlumniById,
  updateAlumni,
  verifyAlumni,
  createAlumni,
};