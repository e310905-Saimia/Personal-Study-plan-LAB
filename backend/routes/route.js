const express = require('express');
const router = express.Router();

// Import Controllers
const subjectController = require('../controllers/subject-controller');
const noticeController = require('../controllers/notice-controller');

// ✅ SUBJECT ROUTES
router.post('/subjects', subjectController.subjectCreate);
router.get('/subjects', subjectController.allSubjects);
router.get('/subjects/:id', subjectController.getSubjectDetail);
router.put('/subjects/:id', subjectController.updateSubject); 
router.delete('/subjects/:id', subjectController.deleteSubject);
router.post('/subjects/:id/outcomes', subjectController.addOutcome);
router.put('/subjects/:subjectID/outcomes/:outcomeID', subjectController.updateOutcome);
router.delete('/subjects/:subjectID/outcomes/:outcomeID', subjectController.deleteOutcome);


// ✅ NOTICE ROUTES
router.post('/NoticeCreate', noticeController.noticeCreate);
router.get('/NoticeList/:id', noticeController.noticeList);
router.delete('/Notices/:id', noticeController.deleteNotices);
router.delete('/Notice/:id', noticeController.deleteNotice);
router.put('/Notice/:id', noticeController.updateNotice);

module.exports = router;
