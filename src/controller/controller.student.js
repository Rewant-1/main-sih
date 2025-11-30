// const StudentService = require("../service/service.student.js");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const UserModel = require("../model/model.user.js");
const studentModel = require("../model/model.student.js");

// const getStudents = async (req, res) => {
//     try {
//         const students = await StudentService.getStudents();
//         res.status(200).json(students);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const getStudentById = async (req, res) => {
//     try {
//         const student = await StudentService.getStudentById(req.params.id);
//         if (student) {
//             res.status(200).json(student);
//         } else {
//             res.status(404).json({ message: "Student not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const updateStudent = async (req, res) => {
//     try {
//         const student = await StudentService.updateStudent(
//             req.params.id,
//             req.body
//         );
//         res.status(200).json(student);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const createStudents = async (req, res) => {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid request body: 'students' must be a non-empty array",
        });
    }

    const session = await mongoose.startSession();

    session.startTransaction();

    try {
        const createdStudents = [];

        for (const studentData of students) {
            if (
                !studentData.name ||
                !studentData.email ||
                !studentData.password ||
                !studentData.academic?.degreeType ||
                !studentData.academic?.degreeName
            ) {
                throw new Error(
                    `Missing fields for student: ${
                        studentData.email || "Unknown"
                    }`
                );
            }

            const existingUser = await UserModel.findOne({
                email: studentData.email,
            }).session(session);
            if (existingUser) {
                throw new Error(`User already exists: ${studentData.email}`);
            }

            const hashedPassword = await bcrypt.hash(studentData.password, 10);

            const [user] = await UserModel.create(
                [
                    {
                        name: studentData.name,
                        email: studentData.email,
                        passwordHash: hashedPassword,
                        userType: "Student",
                    },
                ],
                { session }
            );

            const [student] = await studentModel.create(
                [
                    {
                        userId: user._id,
                        academic: studentData.academic,
                    },
                ],
                { session }
            );

            user.profileDetails = student._id;
            await user.save({ session });
            createdStudents.push(user);
        }
        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "All students created successfully",
            data: createdStudents,
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Transaction Aborted:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    } finally {
        session.endSession();
    }
};

module.exports = {
    getStudents,
    getStudentById,
    updateStudent,
    createStudents,
};
