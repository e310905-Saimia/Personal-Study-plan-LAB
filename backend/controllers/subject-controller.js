const Subject = require('../models/subjectSchema.js');

// Add the decimal parser helper function
const parseDecimalValue = (value) => {
  if (value === undefined || value === null) return null;
  
  // Convert to string if it's a number already
  const strValue = typeof value === 'number' ? String(value) : value;
  
  // Replace comma with period if present
  const normalized = strValue.replace(',', '.');
  
  // Parse and return the value
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
};

// ✅ Create a Subject (Only Name & Credits) with duplicate check
const subjectCreate = async (req, res) => {
    try {
        let { name, credits } = req.body;

        if (!name || !credits) {
            return res.status(400).json({ message: "Name and credits are required" });
        }

        // Check if subject with this name already exists (case-insensitive)
        const existingSubject = await Subject.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });

        if (existingSubject) {
            return res.status(409).json({ 
                message: "Subject with this name already exists", 
                existingSubject 
            });
        }

        // ✅ Create and save the subject
        const newSubject = new Subject({ name, credits });
        await newSubject.save();

        res.status(201).json({ message: "Subject added successfully!", subject: newSubject });
    } catch (error) {
        console.error("Error in subjectCreate:", error);
        
        // Handle mongoose duplicate key error
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(409).json({ message: "Subject with this name already exists" });
        }
        
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get All Subjects
const allSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json(subjects);
    } catch (error) {
        console.error("Error in allSubjects:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get Subject Details
const getSubjectDetail = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json(subject);
    } catch (error) {
        console.error("Error in getSubjectDetail:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateSubject = async (req, res) => {
    try {
        const { name, credits } = req.body;

        // Check if name is being changed and if it would create a duplicate
        if (name) {
            const existingSubject = await Subject.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: req.params.id } // Exclude current subject
            });

            if (existingSubject) {
                return res.status(409).json({ 
                    message: "Cannot update: another subject with this name already exists" 
                });
            }
        }

        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.id,
            { name, credits },
            { new: true, runValidators: true }
        );

        if (!updatedSubject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.status(200).json({ message: 'Subject updated successfully', subject: updatedSubject });
    } catch (error) {
        console.error("Error in updateSubject:", error);
        
        // Handle mongoose duplicate key error
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(409).json({ 
                message: "Cannot update: another subject with this name already exists" 
            });
        }
        
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete Subject
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error("Error in deleteSubject:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateOutcome = async (req, res) => {
    try {
        const { topic, project, credits, maxCredits, requirements, compulsory } = req.body;
        
        const subject = await Subject.findById(req.params.subjectID);
        if (!subject) return res.status(404).json({ message: "Subject not found" });

        const outcome = subject.outcomes.id(req.params.outcomeID);
        if (!outcome) return res.status(404).json({ message: "Outcome not found" });

        // Check if updating topic and project would create a duplicate
        if (topic !== undefined || project !== undefined) {
            const newTopic = topic !== undefined ? topic : outcome.topic;
            const newProject = project !== undefined ? project : outcome.project;
            
            const duplicateOutcome = subject.outcomes.find(o => 
                o._id.toString() !== req.params.outcomeID && // Skip the current outcome
                o.topic.toLowerCase() === newTopic.toLowerCase() && 
                o.project.toLowerCase() === newProject.toLowerCase()
            );

            if (duplicateOutcome) {
                return res.status(409).json({ 
                    message: "Cannot update: another outcome with this topic and project already exists",
                    outcome: duplicateOutcome
                });
            }
        }

        // Validate credits with comma support if provided
        if (credits !== undefined) {
            const parsedCredits = parseDecimalValue(credits);
            if (parsedCredits === null) {
                return res.status(400).json({ 
                    message: "Invalid credit value format"
                });
            }
            
            // Apply validation - ensure credits are between 0.1 and 10
            outcome.credits = Math.max(0.1, Math.min(parsedCredits, 10));
        }
        
        // Validate maxCredits with comma support if provided
        if (maxCredits !== undefined) {
            const parsedMaxCredits = parseDecimalValue(maxCredits);
            if (parsedMaxCredits === null) {
                return res.status(400).json({ 
                    message: "Invalid maximum credit value format"
                });
            }
            
            // Apply validation - ensure maxCredits are between 0.1 and 10
            outcome.maxCredits = Math.max(0.1, Math.min(parsedMaxCredits, 10));
        }

        // Only update the specific outcome properties if they're provided
        if (topic !== undefined) outcome.topic = topic;
        if (project !== undefined) outcome.project = project;
        if (requirements !== undefined) outcome.requirements = requirements; 
        
        // Handle compulsory field explicitly - ensure it's a boolean
        if (compulsory !== undefined) {
            outcome.compulsory = Boolean(compulsory);
        }
        
        console.log("Updated outcome:", outcome); // Add logging

        await subject.save();
        
        res.status(200).json({ message: "Outcome updated successfully", subject });
    } catch (error) {
        console.error("Error in updateOutcome:", error);
        res.status(500).json({ error: error.message });
    }
};

const addOutcome = async (req, res) => {
    try {
        const { topic, project, credits, maxCredits, compulsory } = req.body;
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: "Subject not found" });

        // Use topic as project if project is not provided
        const effectiveProject = project || topic;

        // Check for duplicate outcome (topic and project combination)
        const duplicateOutcome = subject.outcomes.find(outcome => 
            outcome.topic.toLowerCase() === topic.toLowerCase() && 
            outcome.project.toLowerCase() === effectiveProject.toLowerCase()
        );

        if (duplicateOutcome) {
            return res.status(409).json({ 
                message: "An outcome with this topic and project already exists for this subject",
                outcome: duplicateOutcome
            });
        }

        // Parse credit values with comma support
        const parsedCredits = parseDecimalValue(credits);
        if (parsedCredits === null) {
            return res.status(400).json({ message: "Invalid credit value format" });
        }

        // Apply validation - ensure credits are between 0.1 and 10
        const creditsValue = Math.max(0.1, Math.min(parsedCredits, 10));
        
        // Parse and validate maxCredits if provided, otherwise use credits value
        let maxCreditsValue = creditsValue;
        if (maxCredits !== undefined) {
            const parsedMaxCredits = parseDecimalValue(maxCredits);
            if (parsedMaxCredits !== null) {
                maxCreditsValue = Math.max(0.1, Math.min(parsedMaxCredits, 10));
            }
        }

        // Set compulsory to true by default if not provided
        const isCompulsory = compulsory !== undefined ? compulsory : true;

        subject.outcomes.push({ 
            topic, 
            project: effectiveProject, 
            credits: creditsValue,
            maxCredits: maxCreditsValue,
            compulsory: isCompulsory 
        });
        
        await subject.save();
        res.status(201).json({ message: "Outcome added successfully", subject });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete an outcome
const deleteOutcome = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.subjectID);
        if (!subject) return res.status(404).json({ message: "Subject not found" });

        subject.outcomes = subject.outcomes.filter(outcome => outcome._id.toString() !== req.params.outcomeID);
        await subject.save();

        res.status(200).json({ message: "Outcome deleted successfully", subject });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addProject = async (req, res) => {
    try {
        const { subjectID, outcomeID } = req.params;
        const { name, credit, studentID } = req.body;

        // Find the subject
        const subject = await Subject.findById(subjectID);
        if (!subject) return res.status(404).json({ message: "Subject not found" });

        // Find the outcome
        const outcome = subject.outcomes.id(outcomeID);
        if (!outcome) return res.status(404).json({ message: "Outcome not found" });

        // Create a new project
        const newProject = { name, credit, studentID };
        outcome.projects.push(newProject);

        await subject.save();

        // ✅ Send Notification to Teacher
        await Notification.create({
            message: `New project submitted for ${subject.name}`,
            studentID,
            subjectID,
            isRead: false
        });

        res.status(201).json({ message: "Project submitted successfully", project: newProject });
    } catch (error) {
        res.status(500).json({ message: "Error submitting project", error });
    }
};

const importOutcomes = async (req, res) => {
    try {
        const { outcomes } = req.body;
        const subject = await Subject.findById(req.params.subjectId);
        
        if (!subject) return res.status(404).json({ message: "Subject not found" });
        
        if (!Array.isArray(outcomes) || outcomes.length === 0) {
            return res.status(400).json({ message: "No valid outcomes provided" });
        }
        
        let addedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        
        // Process and add each outcome to the subject
        for (const outcome of outcomes) {
            try {
                // Validate required fields
                if (!outcome.topic || !outcome.project || outcome.credits === undefined) {
                    errorCount++;
                    continue;
                }
                
                // Check for existing outcome with same topic and project
                const existingOutcomeIndex = subject.outcomes.findIndex(o => 
                    o.topic.toLowerCase() === outcome.topic.toLowerCase() && 
                    o.project.toLowerCase() === outcome.project.toLowerCase()
                );
                
                // Convert compulsory to boolean
                const isCompulsory = outcome.compulsory !== undefined ? 
                    (String(outcome.compulsory).toLowerCase() === 'true' || outcome.compulsory === true) : true;
                
                // Parse credits with comma support
                const parsedCredits = parseDecimalValue(outcome.credits);
                if (parsedCredits === null) {
                    errorCount++;
                    continue;
                }
                
                // Apply validation
                const validCredits = Math.max(0.1, Math.min(parsedCredits, 10));
                
                // Parse maxCredits with comma support
                let validMaxCredits = validCredits;
                if (outcome.maxCredits !== undefined) {
                    const parsedMaxCredits = parseDecimalValue(outcome.maxCredits);
                    if (parsedMaxCredits !== null) {
                        validMaxCredits = Math.max(0.1, Math.min(parsedMaxCredits, 10));
                    }
                }
                
                // Prepare the new outcome object
                const outcomeData = {
                    topic: outcome.topic,
                    project: outcome.project,
                    credits: validCredits,
                    maxCredits: validMaxCredits,
                    compulsory: isCompulsory,
                    requirements: Array.isArray(outcome.requirements) ? outcome.requirements : []
                };
                
                if (existingOutcomeIndex >= 0) {
                    // Update existing outcome
                    subject.outcomes[existingOutcomeIndex] = {
                        ...subject.outcomes[existingOutcomeIndex].toObject(),
                        ...outcomeData
                    };
                    updatedCount++;
                } else {
                    // Add new outcome
                    subject.outcomes.push(outcomeData);
                    addedCount++;
                }
            } catch (err) {
                console.error("Error processing outcome:", err);
                errorCount++;
            }
        }
        
        await subject.save();
        
        res.status(201).json({ 
            message: `Successfully imported ${addedCount} new outcomes, updated ${updatedCount} existing outcomes${errorCount > 0 ? ` (${errorCount} failed)` : ''}`, 
            subject 
        });
    } catch (error) {
        console.error("Error importing outcomes:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { subjectCreate, allSubjects, getSubjectDetail, updateSubject, deleteSubject, addOutcome, updateOutcome, deleteOutcome, addProject, importOutcomes };