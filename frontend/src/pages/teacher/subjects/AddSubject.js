import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addSubject } from "../../../redux/subjectrelated/subjectHandle";
import { TextField, Button, Paper, Box, Typography, Alert, Snackbar } from "@mui/material";
import axios from "axios";

const AddSubject = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [subjectData, setSubjectData] = useState({
        name: "",
        credits: 1, // Default credits value that will be sent but not shown in UI
    });
    const [existingSubjects, setExistingSubjects] = useState([]);
    const [error, setError] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);

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

    // Handle input change
    const handleChange = (e) => {
        setSubjectData({ ...subjectData, [e.target.name]: e.target.value });
        setError(""); // Clear any errors when user makes changes
    };

    // Check if subject name already exists
    const isDuplicateSubject = (name) => {
        return existingSubjects.some(subject => 
            subject.name.toLowerCase() === name.toLowerCase()
        );
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subjectData.name) {
            setError("Please enter a subject name.");
            return;
        }
        
        // Check for duplicate before submission
        if (isDuplicateSubject(subjectData.name)) {
            setError(`A subject with the name "${subjectData.name}" already exists.`);
            return;
        }
        
        try {
            await dispatch(addSubject(subjectData));
            navigate("/Teacher/dashboard/subjects"); // Redirect back to subjects page
        } catch (error) {
            console.error("Error adding subject:", error);
            if (error.response && error.response.status === 409) {
                setError("A subject with this name already exists.");
            } else {
                setError("Failed to add subject. Please try again.");
            }
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Paper sx={{ padding: 3, width: "50%", margin: "auto", marginTop: 5 }}>
            <Typography variant="h5" gutterBottom>
                Add New Subject
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Subject Name"
                    name="name"
                    value={subjectData.name}
                    onChange={handleChange}
                    margin="normal"
                    required
                    error={!!error && error.includes(subjectData.name)}
                />
                {/* Credits field removed, but default value of 1 is still used */}
                <Box sx={{ marginTop: 2 }}>
                    <Button variant="contained" color="primary" type="submit">
                        Add Subject
                    </Button>
                </Box>
            </form>
            
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="Error adding subject"
            />
        </Paper>
    );
};

export default AddSubject;