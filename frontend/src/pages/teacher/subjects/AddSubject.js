import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addSubject } from "../../../redux/subjectrelated/subjectHandle";
import { TextField, Button, Paper, Box, Typography } from "@mui/material";

const AddSubject = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [subjectData, setSubjectData] = useState({
        name: "",
        credits: "",
    });

    // Handle input change
    const handleChange = (e) => {
        setSubjectData({ ...subjectData, [e.target.name]: e.target.value });
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subjectData.name || !subjectData.credits) {
            alert("Please fill in all fields.");
            return;
        }
        
        try {
            await dispatch(addSubject(subjectData));
            navigate("/Teacher/subjects"); // Redirect back to subjects page
        } catch (error) {
            console.error("Error adding subject:", error);
        }
    };

    return (
        <Paper sx={{ padding: 3, width: "50%", margin: "auto", marginTop: 5 }}>
            <Typography variant="h5" gutterBottom>
                Add New Subject
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Subject Name"
                    name="name"
                    value={subjectData.name}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Credits"
                    name="credits"
                    type="number"
                    value={subjectData.credits}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <Box sx={{ marginTop: 2 }}>
                    <Button variant="contained" color="primary" type="submit">
                        Add Subject
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default AddSubject;
