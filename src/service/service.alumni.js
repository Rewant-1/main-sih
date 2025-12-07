const Alumni = require("../model/model.alumni.js");

const getAlumni = async (adminId) => {
  try {
    // Query Alumni model and populate userId to get user details (name, email)
    const alumni = await Alumni.find({ adminId }).populate('userId', 'name email username userType createdAt');
    return alumni;
  } catch (error) {
    throw error;
  }
};

const getAlumniById = async (alumniId, adminId) => {
  try {
    // Query Alumni model by its _id and populate userId
    const alumni = await Alumni.findOne({ _id: alumniId, adminId }).populate('userId', 'name email username userType createdAt');
    return alumni;
  } catch (error) {
    throw error;
  }
};

const updateAlumni = async (alumniId, alumniData, adminId) => {
  try {
    const alumni = await Alumni.findOne({ _id: alumniId, adminId });
    if (!alumni) {
      return null;
    }
    // Update Alumni document fields (verified, graduationYear, skills, degreeUrl)
    const updatedAlumni = await Alumni.findOneAndUpdate(
      { _id: alumniId, adminId },
      alumniData, 
      { new: true }
    ).populate('userId', 'name email username userType createdAt');
    return updatedAlumni;
  } catch (error) {
    throw error;
  }
};

const verifyAlumni = async (alumniId, adminId) => {
  try {
    const alumni = await Alumni.findOne({ _id: alumniId, adminId });
    if (!alumni) return null;
    alumni.verified = true;
    await alumni.save();
    return alumni;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAlumni,
  getAlumniById,
  updateAlumni,
  verifyAlumni,
};