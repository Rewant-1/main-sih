const User = require("../model/model.user.js");

const getStudents = async () => {
  try {
    const students = await User.find({ role: 'student' });
    return students;
  } catch (error) {
    throw error;
  }
};

const getStudentById = async (studentId) => {
  try {
    const student = await User.findOne({ _id: studentId, role: 'student' });
    return student;
  } catch (error) {
    throw error;
  }
};

const updateStudent = async (studentId, studentData) => {
  try {
    const updatedStudent = await User.findOneAndUpdate({ _id: studentId, role: 'student' }, studentData, {
      new: true,
    });
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