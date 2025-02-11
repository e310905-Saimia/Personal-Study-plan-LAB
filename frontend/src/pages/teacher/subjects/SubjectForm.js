import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addSubject } from '../../../redux/subjectrelated/subjectHandle';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Paper, Typography } from '@mui/material';

const SubjectForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [subjectName, setSubjectName] = useState('');
    const [credits, setCredits] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!subjectName || !credits) {
            alert('Please enter subject name and credits.');
            return;
        }

        const newSubject = { name: subjectName, credits: parseInt(credits, 10) };
        dispatch(addSubject(newSubject))
            .then(() => navigate('/Teacher/dashboard/subjects')) // Redirect after adding
            .catch((error) => console.error('Error adding subject:', error));
    };

    return (
        <Paper sx={{ padding: 3, maxWidth: 500, margin: 'auto', marginTop: 5 }}>
            <Typography variant="h5" gutterBottom>Add Subject</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Subject Name"
                    variant="outlined"
                    fullWidth
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    label="Credits"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    margin="normal"
                    required
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                    <Button variant="contained" color="primary" type="submit">
                        Save
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default SubjectForm;
