import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addSubject } from '../../../redux/subjectrelated/subjectHandle';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Paper, Typography, Alert } from '@mui/material';
import axios from 'axios';

const SubjectForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [subjectName, setSubjectName] = useState('');
    const [credits, setCredits] = useState('');
    const [error, setError] = useState('');
    const [existingSubjects, setExistingSubjects] = useState([]);

    // Fetch existing subjects when component mounts
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/subjects");
                setExistingSubjects(response.data);
            } catch (err) {
                console.error("Error fetching existing subjects:", err);
                setError("Failed to fetch existing subjects");
            }
        };
        
        fetchSubjects();
    }, []);

    // Check if subject name already exists
    const isDuplicateSubject = (name) => {
        return existingSubjects.some(subject => 
            subject.name.toLowerCase() === name.toLowerCase()
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!subjectName || !credits) {
            setError('Please enter subject name and credits.');
            return;
        }

        // Check for duplicate before submission
        if (isDuplicateSubject(subjectName)) {
            setError(`A subject with the name "${subjectName}" already exists.`);
            return;
        }

        const newSubject = { name: subjectName, credits: parseInt(credits, 10) };
        dispatch(addSubject(newSubject))
            .then(() => navigate('/Teacher/dashboard/subjects')) // Redirect after adding
            .catch((error) => {
                console.error('Error adding subject:', error);
                if (error.response && error.response.status === 409) {
                    setError("A subject with this name already exists.");
                } else {
                    setError("Failed to add subject. Please try again.");
                }
            });
    };

    // Clear error when input changes
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        setError(''); // Clear any error when user makes changes
    };

    return (
        <Paper sx={{ padding: 3, maxWidth: 500, margin: 'auto', marginTop: 5 }}>
            <Typography variant="h5" gutterBottom>Add Subject</Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Subject Name"
                    variant="outlined"
                    fullWidth
                    value={subjectName}
                    onChange={handleInputChange(setSubjectName)}
                    margin="normal"
                    required
                    error={!!error && error.includes(subjectName)}
                />
                <TextField
                    label="Credits"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={credits}
                    onChange={handleInputChange(setCredits)}
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