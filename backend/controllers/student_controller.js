const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema');

// ✅ Register Student
const studentRegister = async (req, res) => {
    try {
        const { email, password, teacherID } = req.body;

        if (!email || !password) {  
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPass = await bcrypt.hash(password, 10);
        const student = new Student({ email, password: hashedPass, teacherID });

        const result = await student.save();
        res.status(201).json(result);
    } catch (err) {
        console.error("❌ Error in studentRegister:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// ✅ Student Login
const studentLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(404).json({ message: "Student not found!" });
        }

        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        const token = jwt.sign({ id: student._id, role: "Student" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        student.password = undefined; // Hide password from response

        res.status(200).json({ token, student });
    } catch (err) {
        console.error("❌ Error in studentLogIn:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

// ✅ Get All Students
const getStudents = async (req, res) => {
    try {
        let students = await Student.find().select("-password"); // Do not fetch passwords

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        res.status(200).json(students); 
    } catch (err) {
        console.error("❌ Error fetching students:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// ✅ Get Single Student Details
const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("sclassName", "sclassName")
            .populate("school", "schoolName")
            .populate("examResult.subName", "subName");

        if (!student) {
            return res.status(404).json({ message: "No student found" });
        }

        student.password = undefined;
        res.send(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Delete All Students of a School
const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No students found to delete" });
        }

        res.send({ message: `${result.deletedCount} students deleted` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete Single Student
const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.send({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update Student Details
const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        let result = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Student not found" });
        }

        result.password = undefined;
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete All Students in a Specific Class
const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No students found to delete in this class" });
        }

        res.send({ message: `${result.deletedCount} students deleted from the class` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update Student Exam Results
const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getStudentSubjects = async (req, res) => {
    try {
        const studentID = req.params.studentID;

        // Find the student
        const student = await Student.findById(studentID);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetch all subjects and outcomes
        const subjects = await Subject.find().populate("outcomes");

        res.status(200).json(subjects);
    } catch (error) {
        console.error("Error in getStudentSubjects:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {
    studentRegister,
    studentLogIn, 
    getStudents, 
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    deleteStudentsByClass,
    updateExamResult,
    getStudentSubjects
};
