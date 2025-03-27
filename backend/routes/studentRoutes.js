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
    getStudentSubjects,
    submitProject,
    assessProject,
    getOutcomeProjects,
    deleteProject,
    addStudentSubject,
    updateStudentSubject,
    deleteStudentSubject,
    addStudentOutcome,
    updateStudentOutcome,
    deleteStudentOutcome
} = require('../controllers/student_controller');

// ✅ Authentication Routes
router.post('/register', studentRegister);
router.post('/login', studentLogIn);

// ✅ Student CRUD Routes
router.get('/list', getStudents);
router.get('/:id', getStudentDetail);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.delete('/all/:id', deleteStudents);
router.delete('/class/:id', deleteStudentsByClass);

// ✅ Subject Management Routes
router.get("/:studentID/subjects", getStudentSubjects);
router.post('/:studentID/subjects', addStudentSubject);
router.put('/:studentID/subjects/:subjectID', updateStudentSubject);
router.delete('/:studentID/subjects/:subjectID', deleteStudentSubject);

// ✅ Project Management Routes - FIXED ROUTES
router.get('/:studentID/subjects/:subjectID/outcomes/:outcomeID/projects', getOutcomeProjects);
router.post('/:studentID/subjects/:subjectID/outcomes/:outcomeID/projects', submitProject);
router.put('/:studentID/subjects/:subjectID/outcomes/:outcomeID/projects/:projectID', assessProject);
router.delete('/:studentID/subjects/:subjectID/outcomes/:outcomeID/projects/:projectID', deleteProject);

// Add Outcome Management Routes
router.post('/:studentID/subjects/:subjectID/outcomes', addStudentOutcome);
router.put('/:studentID/subjects/:subjectID/outcomes/:outcomeID', updateStudentOutcome);
router.delete('/:studentID/subjects/:subjectID/outcomes/:outcomeID', deleteStudentOutcome);

module.exports = router;