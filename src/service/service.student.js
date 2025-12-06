const Student = require("../model/model.student.js");

const getStudents = async () => {
  try {
    // Query Student model and populate userId to get user details (name, email)
    const students = await Student.find().populate('userId', 'name email username userType createdAt');
    return students;
  } catch (error) {
    throw error;
  }
};

const getStudentById = async (studentId) => {
  try {
    // Query Student model by its _id and populate userId
    const student = await Student.findById(studentId).populate('userId', 'name email username userType createdAt');
    return student;
  } catch (error) {
    throw error;
  }
};

const updateStudent = async (studentId, studentData) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return null;
    }
    // Update Student document fields (academic info)
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId, 
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