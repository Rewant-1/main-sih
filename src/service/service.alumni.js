const Alumni = require("../model/model.alumni.js");

const getAlumni = async () => {
  try {
    // Query Alumni model and populate userId to get user details (name, email)
    const alumni = await Alumni.find().populate('userId', 'name email username userType createdAt');
    return alumni;
  } catch (error) {
    throw error;
  }
};

const getAlumniById = async (alumniId) => {
  try {
    // Query Alumni model by its _id and populate userId
    const alumni = await Alumni.findById(alumniId).populate('userId', 'name email username userType createdAt');
    return alumni;
  } catch (error) {
    throw error;
  }
};

const updateAlumni = async (alumniId, alumniData) => {
  try {
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return null;
    }
    // Update Alumni document fields (verified, graduationYear, skills, degreeUrl)
    const updatedAlumni = await Alumni.findByIdAndUpdate(
      alumniId, 
      alumniData, 
      { new: true }
    ).populate('userId', 'name email username userType createdAt');
    return updatedAlumni;
  } catch (error) {
    throw error;
  }
};

const verifyAlumni = async (alumniId) => {
  try {
    const alumni = await Alumni.findById(alumniId);
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