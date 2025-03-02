const express = require('express');
const router = express.Router();

// Import Controllers
const subjectController = require('../controllers/subject-controller');

// ✅ SUBJECT ROUTES
router.post('/subjects', subjectController.subjectCreate);
router.get('/subjects', subjectController.allSubjects);
router.get('/subjects/:id', subjectController.getSubjectDetail);
router.put('/subjects/:id', subjectController.updateSubject); 
router.delete('/subjects/:id', subjectController.deleteSubject);
router.post('/subjects/:id/outcomes', subjectController.addOutcome);
router.put('/subjects/:subjectID/outcomes/:outcomeID', subjectController.updateOutcome);
router.delete('/subjects/:subjectID/outcomes/:outcomeID', subjectController.deleteOutcome);
router.post('/subjects/:subjectID/outcomes/:outcomeID/projects', subjectController.addProject);


module.exports = router;
