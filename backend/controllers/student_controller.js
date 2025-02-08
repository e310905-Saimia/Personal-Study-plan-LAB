const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');

const studentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.teacherID, 
            sclassName: req.body.sclassName,
        });

        if (existingStudent) {
            res.send({ message: 'Roll Number already exists' });
        } else {
            const student = new Student({
                ...req.body,
                school: req.body.teacherID,
                password: hashedPass
            });

            let result = await student.save();

            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    try {
        const { rollNum, studentName, password } = req.body;

        // Check if student exists
        let student = await Student.findOne({ rollNum, name: studentName });
        if (!student) {
            return res.status(404).json({ message: "Student not found!" });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password!" });
        }

        // Remove password from the response
        student.password = undefined;
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("sclassName", "sclassName")
            .populate("school", "schoolName")
            .populate("examResult.subName", "subName");

        if (student) {
            student.password = undefined;
            res.send(student);
        } else {
            res.status(404).json({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// 🔹 Delete All Students of a School
const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "No students found to delete" });
        } else {
            res.send({ message: `${result.deletedCount} students deleted` });
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

// 🔹 Delete Single Student
const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.send({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
};

// 🔹 Update Student Details
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
        res.status(500).json(error);
    }
};

// 🔹 Delete All Students in a Specific Class
const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No students found to delete in this class" });
        }
        res.send({ message: `${result.deletedCount} students deleted from the class` });
    } catch (error) {
        res.status(500).json(error);
    }
};

// 🔹 Update Student Exam Results
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
        res.status(500).json(error);
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
    updateExamResult
};
