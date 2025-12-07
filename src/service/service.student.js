const Student = require("../model/model.student.js");

const getStudents = async (adminId) => {
  try {
    // Build filter - if adminId is provided, filter by it; otherwise return all
    const filter = adminId ? { adminId } : {};
    // Query Student model and populate userId to get user details (name, email)
    const students = await Student.find(filter).populate('userId', 'name email username userType createdAt');
    return students;
  } catch (error) {
    throw error;
  }
};

const getStudentById = async (studentId, adminId) => {
  try {
    // Build filter - if adminId is provided, filter by it; otherwise just by id
    const filter = adminId ? { _id: studentId, adminId } : { _id: studentId };
    // Query Student model by its _id and populate userId
    const student = await Student.findOne(filter).populate('userId', 'name email username userType createdAt');
    return student;
  } catch (error) {
    throw error;
  }
};

const updateStudent = async (studentId, studentData, adminId) => {
  try {
    // Build filter - if adminId is provided, filter by it; otherwise just by id
    const filter = adminId ? { _id: studentId, adminId } : { _id: studentId };
    const student = await Student.findOne(filter);
    if (!student) {
      return null;
    }
    // Update Student document fields (academic info)
    const updatedStudent = await Student.findOneAndUpdate(
      filter,
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