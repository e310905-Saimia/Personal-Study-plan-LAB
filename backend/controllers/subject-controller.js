const Subject = require('../models/subjectSchema.js');

// ✅ Create a Subject (Only Name & Credits)
const subjectCreate = async (req, res) => {
    try {
        let { name, credits } = req.body;

        if (!name || !credits) {
            return res.status(400).json({ message: "Name and credits are required" });
        }

        // ✅ Create and save the subject
        const newSubject = new Subject({ name, credits });
        await newSubject.save();

        res.status(201).json({ message: "Subject added successfully!", subject: newSubject });
    } catch (error) {
        console.error("Error in subjectCreate:", error);
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

const addOutcome = async (req, res) => {
    try {
        const { topic, project, credits, compulsory } = req.body;
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: "Subject not found" });

        // Set compulsory to true by default if not provided
        const isCompulsory = compulsory !== undefined ? compulsory : true;

        subject.outcomes.push({ 
            topic, 
            project, 
            credits, 
            compulsory: isCompulsory 
        });
        
        await subject.save();
        res.status(201).json({ message: "Outcome added successfully", subject });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// const updateOutcome = async (req, res) => {
//     try {
//         const { topic, project, credits, requirements, compulsory } = req.body;
//         const subject = await Subject.findById(req.params.subjectID);
//         if (!subject) return res.status(404).json({ message: "Subject not found" });

//         const outcome = subject.outcomes.id(req.params.outcomeID);
//         if (!outcome) return res.status(404).json({ message: "Outcome not found" });

//         // ✅ Only update the specific outcome
//         if (topic !== undefined) outcome.topic = topic;
//         if (project !== undefined) outcome.project = project;
//         if (credits !== undefined) outcome.credits = credits;
//         if (requirements !== undefined) outcome.requirements = requirements; 
//         if (compulsory !== undefined) outcome.compulsory = compulsory;

//         await subject.save();

//         res.status(200).json({ message: "Outcome updated successfully", subject });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// This is how the updateOutcome function in subject-controller.js should look:

const updateOutcome = async (req, res) => {
    try {
        const { topic, project, credits, requirements, compulsory } = req.body;
        console.log("Received update request with body:", req.body);
        
        const subject = await Subject.findById(req.params.subjectID);
        if (!subject) return res.status(404).json({ message: "Subject not found" });

        const outcome = subject.outcomes.id(req.params.outcomeID);
        if (!outcome) return res.status(404).json({ message: "Outcome not found" });

        // Only update the specific outcome properties if they're provided
        if (topic !== undefined) outcome.topic = topic;
        if (project !== undefined) outcome.project = project;
        if (credits !== undefined) outcome.credits = credits;
        if (requirements !== undefined) outcome.requirements = requirements; 
        
        // Handle compulsory field explicitly - ensure it's a boolean
        if (compulsory !== undefined) {
            outcome.compulsory = Boolean(compulsory);
            console.log(`Updated compulsory to ${outcome.compulsory} (${typeof outcome.compulsory})`);
        }

        await subject.save();
        console.log("Subject saved successfully with updated outcome");

        res.status(200).json({ message: "Outcome updated successfully", subject });
    } catch (error) {
        console.error("Error in updateOutcome:", error);
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
        let errorCount = 0;
        
        // Process and add each outcome to the subject
        for (const outcome of outcomes) {
            try {
                // Validate required fields
                if (!outcome.topic || !outcome.project || outcome.credits === undefined) {
                    errorCount++;
                    continue;
                }
                
                // Add the outcome to the subject
                subject.outcomes.push({
                    topic: outcome.topic,
                    project: outcome.project,
                    credits: Number(outcome.credits),
                    compulsory: outcome.compulsory !== undefined ? 
                        (String(outcome.compulsory).toLowerCase() === 'true' || outcome.compulsory === true) : true,
                    requirements: Array.isArray(outcome.requirements) ? outcome.requirements : []
                });
                
                addedCount++;
            } catch (err) {
                console.error("Error adding outcome:", err);
                errorCount++;
            }
        }
        
        await subject.save();
        
        res.status(201).json({ 
            message: `Successfully imported ${addedCount} outcomes${errorCount > 0 ? ` (${errorCount} failed)` : ''}`, 
            subject 
        });
    } catch (error) {
        console.error("Error importing outcomes:", error);
        res.status(500).json({ error: error.message });
    }
};



module.exports = { subjectCreate, allSubjects, getSubjectDetail,updateSubject, deleteSubject, addOutcome, updateOutcome, deleteOutcome, addProject, importOutcomes };