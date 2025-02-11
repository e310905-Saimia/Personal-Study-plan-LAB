const Subject = require('../models/subjectSchema.js');

// ✅ Create a Subject (Only Name & Credits)
const subjectCreate = async (req, res) => {
    try {
        let { name, credits } = req.body;

        if (!name || !credits) {
            return res.status(400).json({ message: "Name and credits are required" });
        }

        // ✅ Create and save the subject
        const newSubject = new Subject({ name, credits });
        await newSubject.save();

        res.status(201).json({ message: "Subject added successfully!", subject: newSubject });
    } catch (error) {
        console.error("❌ Error in subjectCreate:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get All Subjects
const allSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json(subjects);
    } catch (error) {
        console.error("❌ Error in allSubjects:", error);
        res.status(500).json({ error: error.message });
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
    } catch (error) {
        console.error("❌ Error in getSubjectDetail:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateSubject = async (req, res) => {
    try {
        const { name, credits } = req.body;

        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.id,
            { name, credits },
            { new: true, runValidators: true }
        );

        if (!updatedSubject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.status(200).json({ message: 'Subject updated successfully', subject: updatedSubject });
    } catch (error) {
        console.error("❌ Error in updateSubject:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete Subject
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error("❌ Error in deleteSubject:", error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = { subjectCreate, allSubjects, getSubjectDetail,updateSubject, deleteSubject, };
