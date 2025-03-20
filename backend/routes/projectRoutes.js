// backend/routes/projectRoutes.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project-controller');

// Get all projects
router.get('/', projectController.getAllProjects);

// Get a specific project by ID
router.get('/:id', projectController.getProjectById);

// Create a new project
router.post('/', projectController.createProject);

// Update a project
router.put('/:id', projectController.updateProject);

// Soft delete a project (mark as deleted)
router.delete('/:id/soft', projectController.softDeleteProject);

// Get projects by category
router.get('/category/:category', projectController.getProjectsByCategory);

// Get projects by teacher
router.get('/teacher/:teacherID', projectController.getProjectsByTeacher);

module.exports = router;