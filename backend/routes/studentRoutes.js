const express = require('express');
const router = express.Router();
const {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    deleteStudentsByClass,
} = require('../controllers/student_controller');

// ✅ STUDENT ROUTES
router.post('/register', studentRegister);
router.post('/login', studentLogIn);
router.get('/list', getStudents);
router.get('/:id', getStudentDetail);
router.delete('/all/:id', deleteStudents);
router.delete('/:id', deleteStudent);
router.put('/:id', updateStudent);
router.delete('/class/:id', deleteStudentsByClass);

router.post('/:outcomeID/requestProject', async (req, res) => {
    try {
        const { name, description, credits } = req.body;
        const outcomeID = req.params.outcomeID;

        if (!name || !description || !credits) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const subject = await Subject.findOne({ "outcomes._id": outcomeID });

        if (!subject) {
            return res.status(404).json({ message: "Outcome not found." });
        }

        const outcome = subject.outcomes.id(outcomeID);
        outcome.assessments.push({
            name,
            credit: credits,
            assessedBy: "Pending Teacher Approval",
            date: new Date().toISOString().split("T")[0]
        });

        await subject.save();
        res.status(201).json({ message: "Project request submitted successfully!" });
    } catch (error) {
        console.error("❌ Error handling project request:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;
