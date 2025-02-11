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


module.exports = router;
