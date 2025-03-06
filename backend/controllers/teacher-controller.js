const Teacher = require('../models/teacherSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register Teacher
exports.teacherRegister = async (req, res) => {
    

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    try {
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const teacher = new Teacher({ name, email, password: hashedPassword });
        await teacher.save();

        res.status(201).json({ message: "Teacher registered successfully", teacher });
    } catch (err) {
        console.error("Error in teacherRegister:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

// Login Teacher
exports.teacherLogIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, teacher.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create a token with role information
        const token = jwt.sign({ id: teacher._id, role: "Teacher" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        
        // Make a copy of the teacher object to modify safely
        const teacherResponse = { ...teacher.toObject() };
        
        // Remove password from response
        delete teacherResponse.password;
        
        // Ensure role field exists
        if (!teacherResponse.role) {
            teacherResponse.role = "Teacher";
        }
        
        // Return token and teacher data with role
        res.status(200).json({ 
            token, 
            teacher: teacherResponse 
        });
    } catch (err) {
        console.error("Error in teacherLogIn:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};
  
// ✅ Get All Teachers
exports.getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// ✅ Get Teacher by ID
exports.getTeacherDetail = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(teacher);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// ✅ Delete All Teachers
exports.deleteTeachers = async (req, res) => {
    try {
        const result = await Teacher.deleteMany();
        res.status(200).json({ message: `${result.deletedCount} teachers deleted successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// ✅ Delete Teacher by ID
exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// ✅ Delete Teachers by Class
exports.deleteTeachersByClass = async (req, res) => {
    try {
        const result = await Teacher.deleteMany({ classId: req.params.id });
        res.status(200).json({ message: `${result.deletedCount} teachers deleted from class successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// ✅ Update Teacher's Subject
exports.updateTeacherSubject = async (req, res) => {
    const { teacherId, subjectId } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { subjectId },
            { new: true }
        );
        if (!updatedTeacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(updatedTeacher);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};
