const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

// Create a new class
const sclassCreate = async (req, res) => {
    try {
        const sclass = new Sclass({
            sclassName: req.body.sclassName,
            school: req.body.teacherID // Updated to use teacherID
        });

        const existingSclassByName = await Sclass.findOne({
            sclassName: req.body.sclassName,
            school: req.body.teacherID
        });

        if (existingSclassByName) {
            res.send({ message: 'Sorry, this class name already exists' });
        } else {
            const result = await sclass.save();
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// List all classes for a teacher
const sclassList = async (req, res) => {
    try {
        const sclasses = await Sclass.find({ school: req.params.id });
        if (sclasses.length > 0) {
            res.send(sclasses);
        } else {
            res.send({ message: "No classes found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get details of a specific class
const getSclassDetail = async (req, res) => {
    try {
        let sclass = await Sclass.findById(req.params.id);
        if (sclass) {
            sclass = await sclass.populate("school", "schoolName");
            res.send(sclass);
        } else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get all students in a specific class
const getSclassStudents = async (req, res) => {
    try {
        const students = await Student.find({ sclassName: req.params.id });
        if (students.length > 0) {
            const modifiedStudents = students.map(student => ({
                ...student._doc,
                password: undefined
            }));
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete a specific class
const deleteSclass = async (req, res) => {
    try {
        const deletedClass = await Sclass.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.send({ message: "Class not found" });
        }
        await Student.deleteMany({ sclassName: req.params.id });
        await Subject.deleteMany({ sclassName: req.params.id });
        await Teacher.updateMany(
            { teachSclass: req.params.id },
            { $unset: { teachSclass: "" } }
        );
        res.send(deletedClass);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete all classes for a teacher
const deleteSclasses = async (req, res) => {
    try {
        const deletedClasses = await Sclass.deleteMany({ school: req.params.id });
        if (deletedClasses.deletedCount === 0) {
            return res.send({ message: "No classes found to delete" });
        }
        await Student.deleteMany({ school: req.params.id });
        await Subject.deleteMany({ school: req.params.id });
        await Teacher.updateMany(
            { school: req.params.id },
            { $unset: { teachSclass: "" } }
        );
        res.send(deletedClasses);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    sclassCreate,
    sclassList,
    getSclassDetail,
    getSclassStudents,
    deleteSclass,
    deleteSclasses
};
