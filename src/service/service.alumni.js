const User = require("../model/model.user.js");

const getAlumni = async () => {
  try {
    const alumni = await User.find({ role: 'alumni' });
    return alumni;
  } catch (error) {
    throw error;
  }
};

const getAlumniById = async (alumniId) => {
  try {
    const alumni = await User.findOne({ _id: alumniId, role: 'alumni' });
    return alumni;
  } catch (error) {
    throw error;
  }
};

const updateAlumni = async (alumniId, alumniData) => {
  try {
    const updatedAlumni = await User.findOneAndUpdate({ _id: alumniId, role: 'alumni' }, alumniData, {
      new: true,
    });
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