const Student = require("../model/model.student.js");

const getStudents = async (adminId) => {
  try {
    // Query Student model and populate userId to get user details (name, email)
    const students = await Student.find({ adminId }).populate('userId', 'name email username userType createdAt');
    return students;
  } catch (error) {
    throw error;
  }
};

const getStudentById = async (studentId, adminId) => {
  try {
    // Query Student model by its _id and populate userId
    const student = await Student.findOne({ _id: studentId, adminId }).populate('userId', 'name email username userType createdAt');
    return student;
  } catch (error) {
    throw error;
  }
};

const updateStudent = async (studentId, studentData, adminId) => {
  try {
    const student = await Student.findOne({ _id: studentId, adminId });
    if (!student) {
      return null;
    }
    // Update Student document fields (academic info)
    const updatedStudent = await Student.findOneAndUpdate(
      { _id: studentId, adminId },
      studentData, 
      { new: true }
    ).populate('userId', 'name email username userType createdAt');
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