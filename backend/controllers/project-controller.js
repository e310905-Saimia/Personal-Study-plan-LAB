// backend/controllers/project-controller.js

const Project = require('../models/projectSchema');

// Get all projects
exports.getAllProjects = async (req, res) => {
    try {
        // Get active projects by default (not deleted)
        const activeOnly = req.query.activeOnly !== 'false';
        const query = activeOnly ? { isDeleted: false } : {};
        
        const projects = await Project.find(query).sort({ createdAt: -1 });
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

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { name, description, defaultCredits, category, teacherID } = req.body;

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

        // Create new project
        const newProject = new Project({
            name,
            description: description || "",
            defaultCredits: defaultCredits || 1,
            category: category || "General",
            teacherID: teacherID || null,
            isDeleted: false
        });

        const savedProject = await newProject.save();
        res.status(201).json({ message: "Project created successfully", project: savedProject });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Error creating project", error: error.message });
    }
};

// Update a project
exports.updateProject = async (req, res) => {
    try {
        const { name, description, defaultCredits, category, isActive } = req.body;
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
        if (description !== undefined) project.description = description;
        if (defaultCredits !== undefined) project.defaultCredits = defaultCredits;
        if (category) project.category = category;
        if (isActive !== undefined) project.isActive = isActive;

        const updatedProject = await project.save();
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

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ message: "Error deleting project", error: error.message });
    }
};

// Get projects by category
exports.getProjectsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const projects = await Project.find({ 
            category, 
            isDeleted: false 
        });
        
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects by category:", error);
        res.status(500).json({ message: "Error fetching projects by category", error: error.message });
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