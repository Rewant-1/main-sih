const User = require("../model/model.user.js");

const getStudents = async () => {
  try {
    const students = await User.find({ userType: 'Student' }).populate('profileDetails');
    return students;
  } catch (error) {
    throw error;
  }
};

const getStudentById = async (studentId) => {
  try {
    const student = await User.findOne({ _id: studentId, userType: 'Student' }).populate('profileDetails');
    return student;
  } catch (error) {
    throw error;
  }
};

const updateStudent = async (studentId, studentData) => {
  try {
    const student = await User.findOne({ _id: studentId, userType: 'Student' });
    if (!student) {
      return null;
    }
    const updatedStudent = await User.findOneAndUpdate(
      { _id: studentId, userType: 'Student' }, 
      studentData, 
      { new: true }
    ).populate('profileDetails');
    return updatedStudent;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudent,
};