// backend/controllers/project-controller.js
const Project = require('../models/projectSchema');

// Get all projects
exports.getAllProjects = async (req, res) => {
    try {
        // Build query based on parameters
        const query = {};
        
        // Log all request queries to debug
        console.log("Received request with query params:", req.query);
        
        // Active/inactive filter
        if (req.query.isDeleted !== undefined) {
            query.isDeleted = req.query.isDeleted === 'true';
        } else {
            // Default to not deleted
            query.isDeleted = false;
        }
        
        // Stage filter (active, in-progress, closed)
        if (req.query.stage) {
            // This is the important line that sets the stage for filtering
            query.stage = req.query.stage;
            console.log(`Filtering projects by stage: ${req.query.stage}`);
        }
        
        console.log("Final MongoDB query:", query);
        
        const projects = await Project.find(query).sort({ createdAt: -1 });
        
        console.log(`Found ${projects.length} projects matching criteria`);
        // Log the stages of returned projects for debugging
        const stageCounts = {
            'active': projects.filter(p => p.stage === 'active').length,
            'in-progress': projects.filter(p => p.stage === 'in-progress').length,
            'closed': projects.filter(p => p.stage === 'closed').length,
            'undefined': projects.filter(p => p.stage === undefined).length
        };
        console.log('Project stage counts in results:', stageCounts);
        
        // If we're filtering for active projects but got mixed results,
        // perform a second filter in the controller just to be sure
        if (req.query.stage === 'active' && stageCounts['in-progress'] > 0 || stageCounts['closed'] > 0) {
            console.log('Warning: Got non-active projects despite filter. Manually filtering results.');
            const filteredProjects = projects.filter(p => p.stage === 'active');
            console.log(`Returning ${filteredProjects.length} projects after manual filtering`);
            return res.status(200).json(filteredProjects);
        }
        
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Error fetching projects", error: error.message });
    }
};

// Get a specific project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Error fetching project", error: error.message });
    }
};

// Helper to generate a project number
const generateProjectNumber = async () => {
    const currentYear = new Date().getFullYear();
    
    // Find the highest project number for current year
    const highestProject = await Project.findOne(
        { projectNumber: { $regex: `^${currentYear}-` } },
        { projectNumber: 1 },
        { sort: { projectNumber: -1 } }
    );
    
    let newNumber = 1;
    
    if (highestProject && highestProject.projectNumber) {
        // Extract the numeric part after the year-
        const matches = highestProject.projectNumber.match(/^(\d+)-(\d+)$/);
        if (matches && matches[2]) {
            newNumber = parseInt(matches[2]) + 1;
        }
    }
    
    // Format with leading zeros (001, 002, etc.)
    return `${currentYear}-${newNumber.toString().padStart(3, '0')}`;
};

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { name, teacherID, stage, startDate } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Project name is required" });
        }

        // Check if project with same name already exists (case-insensitive)
        const existingProject = await Project.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            isDeleted: false
        });

        if (existingProject) {
            return res.status(409).json({ message: "A project with this name already exists" });
        }

        // Generate project number
        const projectNumber = await generateProjectNumber();

        // Create new project
        const newProject = new Project({
            name,
            projectNumber,
            stage: stage || 'active', // Default to active if not specified
            startDate: startDate || new Date(),
            teacherID: teacherID || null,
            isDeleted: false
        });

        const savedProject = await newProject.save();
        console.log(`Created new project: ${name}, stage: ${savedProject.stage}, ID: ${savedProject._id}`);
        res.status(201).json({ message: "Project created successfully", project: savedProject });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Error creating project", error: error.message });
    }
};

// Update a project
exports.updateProject = async (req, res) => {
    try {
        const { name, teacherID, stage, startDate } = req.body;
        const projectId = req.params.id;

        // Find the project to update
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // If name is being changed, check for duplicates
        if (name && name !== project.name) {
            const existingProject = await Project.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: projectId },
                isDeleted: false
            });

            if (existingProject) {
                return res.status(409).json({ message: "Another project with this name already exists" });
            }
        }

        // Update fields if provided
        if (name) project.name = name;
        if (teacherID) project.teacherID = teacherID;
        if (stage) project.stage = stage;  // Update stage if provided
        if (startDate) project.startDate = startDate;

        const updatedProject = await project.save();
        console.log(`Updated project: ${updatedProject.name}, new stage: ${updatedProject.stage}`);
        res.status(200).json({ message: "Project updated successfully", project: updatedProject });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Error updating project", error: error.message });
    }
};

// Soft delete a project (mark as deleted)
exports.softDeleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        
        const project = await Project.findByIdAndUpdate(
            projectId,
            { isDeleted: true },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        console.log(`Soft deleted project: ${project.name}, ID: ${project._id}`);
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ message: "Error deleting project", error: error.message });
    }
};

// Get projects by teacher
exports.getProjectsByTeacher = async (req, res) => {
    try {
        const teacherID = req.params.teacherID;
        const projects = await Project.find({ 
            teacherID, 
            isDeleted: false 
        });
        
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects by teacher:", error);
        res.status(500).json({ message: "Error fetching projects by teacher", error: error.message });
    }
};