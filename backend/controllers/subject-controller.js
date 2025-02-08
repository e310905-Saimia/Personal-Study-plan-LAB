const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

// ✅ Create Subjects
const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        }));

        const existingSubjectBySubCode = await Subject.findOne({
            subCode: subjects[0].subCode,
            school: req.body.teacherID,
        });

        if (existingSubjectBySubCode) {
            return res.status(400).json({ message: '❌ Sorry, this subcode already exists' });
        }

        const newSubjects = subjects.map((subject) => ({
            ...subject,
            sclassName: req.body.sclassName,
            school: req.body.teacherID,
        }));

        const result = await Subject.insertMany(newSubjects);
        res.status(201).json(result);
    } catch (err) {
        console.error("❌ Error in subjectCreate:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get Free Subjects
const freeSubjectList = async (req, res) => {
    try {
        const freeSubjects = await Subject.find({ teacher: null });
        res.status(200).json(freeSubjects);
    } catch (err) {
        console.error("❌ Error in freeSubjectList:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get Subjects by Class
const classSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id });
        res.status(200).json(subjects);
    } catch (err) {
        console.error("❌ Error in classSubjects:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get Subject Details
const getSubjectDetail = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json(subject);
    } catch (err) {
        console.error("❌ Error in getSubjectDetail:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Delete Subjects by Class
const deleteSubjectsByClass = async (req, res) => {
    try {
        const result = await Subject.deleteMany({ sclassName: req.params.id });
        res.status(200).json({ message: `${result.deletedCount} subjects deleted successfully` });
    } catch (err) {
        console.error("❌ Error in deleteSubjectsByClass:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Delete All Subjects
const deleteSubjects = async (req, res) => {
    try {
        const result = await Subject.deleteMany({});
        res.status(200).json({ message: `${result.deletedCount} subjects deleted successfully` });
    } catch (err) {
        console.error("❌ Error in deleteSubjects:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Delete a Single Subject
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (err) {
        console.error("❌ Error in deleteSubject:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get All Subjects
const allSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json(subjects);
    } catch (err) {
        console.error("❌ Error in allSubjects:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    subjectCreate,
    freeSubjectList,
    classSubjects,
    getSubjectDetail,
    deleteSubjectsByClass,
    deleteSubjects,
    deleteSubject,
    allSubjects,
};
