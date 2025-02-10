// const bcrypt = require('bcrypt');
// const Student = require('../models/studentSchema.js');

// const studentLogIn = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         let student = await Student.findOne({ email });
//         if (!student) {
//             return res.status(404).json({ message: "Student not found!" });
//         }

//         const isMatch = await bcrypt.compare(password, student.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid password!" });
//         }

//         student.password = undefined;
//         res.status(200).json(student);
//     } catch (err) {
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// };

// const studentRegister = async (req, res) => {
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPass = await bcrypt.hash(req.body.password, salt);

//         const existingStudent = await Student.findOne({ email: req.body.email });

//         if (existingStudent) {
//             return res.status(400).json({ message: 'Email already exists' });
//         }

//         const student = new Student({
//             ...req.body,
//             school: req.body.teacherID,
//             password: hashedPass
//         });

//         let result = await student.save();

//         result.password = undefined;
//         res.send(result);
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };


const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');

// const studentRegister = async (req, res) => {
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPass = await bcrypt.hash(req.body.password, salt);

//         const existingStudent = await Student.findOne({ email: req.body.email });

//         if (existingStudent) {
//             return res.status(400).json({ message: 'Email already exists' });
//         }

//         const student = new Student({
//             ...req.body,
//             password: hashedPass,
//         });

//         const result = await student.save();
//         result.password = undefined;
//         res.status(201).json(result);
//     } catch (err) {
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// };
const jwt = require('jsonwebtoken');

const studentRegister = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPass = await bcrypt.hash(password, 10);
        const student = new Student({ email, password: hashedPass });

        const result = await student.save();
        result.password = undefined; // Hide password in response
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
// Student Login
const studentLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("🔹 Login Attempt:", email, password);

        const student = await Student.findOne({ email });
        console.log("🔹 Found Student in DB:", student);

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
        console.error("Error in studentLogIn:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};


const getStudents = async (req, res) => {
    try {
        console.log("Fetching students for school:", req.params.id);
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        console.log("Students Fetched:", students);
        res.send(students);
    } catch (err) {
        console.error("Error fetching students:", err);
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
