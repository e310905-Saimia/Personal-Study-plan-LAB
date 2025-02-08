const Notice = require('../models/noticeSchema.js');

// Create a new notice
const noticeCreate = async (req, res) => {
    try {
        const notice = new Notice({
            ...req.body,
            school: req.body.teacherID 
        });
        const result = await notice.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

// List all notices for a teacher
const noticeList = async (req, res) => {
    try {
        const notices = await Notice.find({ school: req.params.id });
        if (notices.length > 0) {
            res.send(notices);
        } else {
            res.send({ message: "No notices found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Update a notice
const updateNotice = async (req, res) => {
    try {
        const updatedNotice = await Notice.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedNotice) {
            return res.status(404).json({ message: "Notice not found" });
        }
        res.send(updatedNotice);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete a specific notice
const deleteNotice = async (req, res) => {
    try {
        const deletedNotice = await Notice.findByIdAndDelete(req.params.id);
        if (!deletedNotice) {
            return res.status(404).json({ message: "Notice not found" });
        }
        res.send(deletedNotice);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete all notices for a teacher
const deleteNotices = async (req, res) => {
    try {
        const deletedNotices = await Notice.deleteMany({ school: req.params.id });
        if (deletedNotices.deletedCount === 0) {
            return res.send({ message: "No notices found to delete" });
        }
        res.send(deletedNotices);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { 
    noticeCreate, 
    noticeList, 
    updateNotice, 
    deleteNotice, 
    deleteNotices 
};
