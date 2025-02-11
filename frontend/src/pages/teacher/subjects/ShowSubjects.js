import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList, updateSubject, deleteSubject } from '../../../redux/subjectrelated/subjectHandle';
import {
    Paper, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';

const ShowSubjects = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { subjects = [], loading } = useSelector((state) => state.subject);

    useEffect(() => {
        dispatch(getSubjectList());
    }, [dispatch]);

    // ✅ State for Editing
    const [open, setOpen] = useState(false);
    const [editSubject, setEditSubject] = useState({ id: "", name: "", credits: "" });

    // ✅ Open Edit Dialog
    const handleEdit = (subject) => {
        setEditSubject({ id: subject._id, name: subject.name, credits: subject.credits });
        setOpen(true);
    };

    // ✅ Close Edit Dialog
    const handleClose = () => {
        setOpen(false);
    };

    // ✅ Submit Edit
    const handleSubmitEdit = () => {
        dispatch(updateSubject(editSubject.id, { name: editSubject.name, credits: editSubject.credits }));
        setOpen(false);
    };

    // ✅ Handle Delete
    const handleDelete = (subjectID) => {
        if (window.confirm("Are you sure you want to delete this subject?")) {
            dispatch(deleteSubject(subjectID));
        }
    };

    return (
        <>
            {loading ? <div>Loading...</div> : (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Button variant="contained" onClick={() => navigate("/Teacher/subjects/add")}>
                            Add Subject
                        </Button>
                    </Box>

                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Topic</TableCell>
                                        <TableCell align="right">Credits</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {subjects.length > 0 ? subjects.map((subject) => (
                                        <TableRow key={subject._id}>
                                            <TableCell>
                                                {subject.name}
                                            </TableCell>
                                            <TableCell align="right">{subject.credits}</TableCell>
                                            <TableCell align="right">
                                                {/* ✅ Edit Button */}
                                                <Button variant="outlined" onClick={() => handleEdit(subject)}>Edit</Button>
                                                &nbsp;
                                                {/* ✅ Delete Button */}
                                                <Button variant="outlined" color="error" onClick={() => handleDelete(subject._id)}>Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                No subjects found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}

            {/* ✅ Edit Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit Subject</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Subject Name"
                        margin="dense"
                        value={editSubject.name}
                        onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Credits"
                        margin="dense"
                        type="number"
                        value={editSubject.credits}
                        onChange={(e) => setEditSubject({ ...editSubject, credits: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmitEdit} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ShowSubjects;
