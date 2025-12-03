const User = require("../model/model.user.js");

const getAlumni = async () => {
  try {
    const alumni = await User.find({ userType: 'Alumni' }).populate('profileDetails');
    return alumni;
  } catch (error) {
    throw error;
  }
};

const getAlumniById = async (alumniId) => {
  try {
    const alumni = await User.findOne({ _id: alumniId, userType: 'Alumni' }).populate('profileDetails');
    return alumni;
  } catch (error) {
    throw error;
  }
};

const updateAlumni = async (alumniId, alumniData) => {
  try {
    const alumni = await User.findOne({ _id: alumniId, userType: 'Alumni' });
    if (!alumni) {
      return null;
    }
    const updatedAlumni = await User.findOneAndUpdate(
      { _id: alumniId, userType: 'Alumni' }, 
      alumniData, 
      { new: true }
    ).populate('profileDetails');
    return updatedAlumni;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAlumni,
  getAlumniById,
  updateAlumni,
};