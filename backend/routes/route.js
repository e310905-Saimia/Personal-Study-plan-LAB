const express = require('express');
const router = express.Router();

// Import Controllers
const studentController = require('../controllers/student_controller');
const subjectController = require('../controllers/subject-controller');
const classController = require('../controllers/class-controller');
const noticeController = require('../controllers/notice-controller');

// ✅ STUDENT ROUTES
router.post('/StudentRegister', studentController.studentRegister);
router.post('/StudentLogin', studentController.studentLogIn);
router.get('/Students/:id', studentController.getStudents);
router.get('/Student/:id', studentController.getStudentDetail);
router.delete('/Students/:id', studentController.deleteStudents);
router.delete('/StudentsClass/:id', studentController.deleteStudentsByClass);
router.delete('/Student/:id', studentController.deleteStudent);
router.put('/Student/:id', studentController.updateStudent);
router.put('/UpdateExamResult/:id', studentController.updateExamResult);

// ✅ SUBJECT ROUTES
router.post('/SubjectCreate', subjectController.subjectCreate);
router.get('/FreeSubjectList/:id', subjectController.freeSubjectList);
router.get('/ClassSubjects/:id', subjectController.classSubjects);
router.get('/Subject/:id', subjectController.getSubjectDetail);
router.delete('/SubjectsClass/:id', subjectController.deleteSubjectsByClass);
router.delete('/Subjects/:id', subjectController.deleteSubjects);
router.delete('/Subject/:id', subjectController.deleteSubject);
router.get('/AllSubjects', subjectController.allSubjects);

// ✅ CLASS ROUTES
router.post('/SclassCreate', classController.sclassCreate);
router.get('/SclassList/:id', classController.sclassList);
router.get('/Sclass/:id', classController.getSclassDetail);
router.get('/SclassStudents/:id', classController.getSclassStudents);
router.delete('/Sclasses/:id', classController.deleteSclasses);
router.delete('/Sclass/:id', classController.deleteSclass);

// ✅ NOTICE ROUTES
router.post('/NoticeCreate', noticeController.noticeCreate);
router.get('/NoticeList/:id', noticeController.noticeList);
router.delete('/Notices/:id', noticeController.deleteNotices);
router.delete('/Notice/:id', noticeController.deleteNotice);
router.put('/Notice/:id', noticeController.updateNotice);

module.exports = router;
