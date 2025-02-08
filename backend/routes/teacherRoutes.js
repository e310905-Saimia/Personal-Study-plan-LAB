const express = require('express');
const router = express.Router();
const {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    deleteTeachers,
    deleteTeacher,
    deleteTeachersByClass,
    updateTeacherSubject,
} = require('../controllers/teacher-controller');

// Routes
router.post('/register', teacherRegister);
router.post('/TeacherLogin', teacherLogIn);
router.get('/', getTeachers);
router.get('/:id', getTeacherDetail);
router.delete('/:id', deleteTeacher);
router.delete('/class/:id', deleteTeachersByClass);
router.put('/update-subject', updateTeacherSubject);

module.exports = router;
