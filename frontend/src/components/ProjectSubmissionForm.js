// frontend/src/components/ProjectSubmissionForm.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { submitStudentProject } from '../../../redux/studentRelated/studentHandle';
import axios from 'axios';

// This component can be used in the student dashboard to submit projects
const ProjectSubmissionForm = ({ studentID, subjectID, outcomeID, outcomeTopic }) => {
  const dispatch = useDispatch();
  
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [requestedCredit, setRequestedCredit] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [customProject, setCustomProject] = useState(false);
  const [customProjectName, setCustomProjectName] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedProject('');
    setRequestedCredit('');
    setCustomProject(false);
    setCustomProjectName('');
    setError('');
  };

  // Fetch available projects when dialog opens
  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await axios.get("http://localhost:5000/api/projects");
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load available projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectChange = (e) => {
    const value = e.target.value;
    setSelectedProject(value);
    
    // If custom project is selected, reset credit
    if (value === "custom") {
      setCustomProject(true);
      setRequestedCredit('');
    } else {
      setCustomProject(false);
      // Set the default credit from the selected project
      const project = projects.find(p => p._id === value);
      if (project) {
        setRequestedCredit(project.defaultCredits.toString());
      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (customProject && !customProjectName) {
      setError('Please enter a project name');
      return;
    }
    
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }
    
    if (!requestedCredit) {
      setError('Please enter requested credits');
      return;
    }
    
    // Convert requestedCredit to a number and validate
    const creditValue = Number(requestedCredit);
    if (isNaN(creditValue) || creditValue <= 0 || creditValue > 10) {
      setError('Credit must be a positive number between 0.1 and 10');
      return;
    }

    setLoading(true);
    try {
      // Determine the project name
      let projectName = '';
      if (customProject) {
        projectName = customProjectName;
      } else {
        // Find the selected project in the projects array
        const project = projects.find(p => p._id === selectedProject);
        projectName = project ? project.name : '';
      }

      if (!projectName) {
        setError('Invalid project selection');
        setLoading(false);
        return;
      }

      // Submit the project
      await dispatch(
        submitStudentProject(
          studentID, 
          subjectID, 
          outcomeID, 
          {
            name: projectName,
            requestedCredit: creditValue,
            // Store the original project ID if it's not a custom project
            originalProjectId: customProject ? null : selectedProject
          }
        )
      );

      // Close dialog and reset state
      handleClose();
      
    } catch (error) {
      console.error("Error submitting project:", error);
      setError(`Error submitting project: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outlined" 
        color="primary" 
        startIcon={<AddIcon />} 
        onClick={handleOpen}
        size="small"
      >
        Submit Project
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Submit Project for {outcomeTopic}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="body2" paragraph sx={{ mt: 1 }}>
            Select a project from the list or create a custom project. Your project will be reviewed by your teacher.
          </Typography>
          
          {loadingProjects ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth margin="normal">
              <InputLabel id="project-select-label">Project</InputLabel>
              <Select
                labelId="project-select-label"
                value={selectedProject}
                onChange={handleProjectChange}
                label="Project"
              >
                <MenuItem value="">
                  <em>Select a project</em>
                </MenuItem>
                
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name} ({project.defaultCredits} credits)
                  </MenuItem>
                ))}
                
                <MenuItem value="custom">
                  <em>Custom Project (Enter your own)</em>
                </MenuItem>
              </Select>
            </FormControl>
          )}
          
          {customProject && (
            <TextField
              fullWidth
              label="Project Name"
              value={customProjectName}
              onChange={(e) => setCustomProjectName(e.target.value)}
              margin="normal"
              required
            />
          )}
          
          <TextField
            fullWidth
            label="Requested Credits"
            type="number"
            value={requestedCredit}
            onChange={(e) => setRequestedCredit(e.target.value)}
            margin="normal"
            required
            inputProps={{ min: 0.1, max: 10, step: 0.1 }}
            helperText="Enter the number of credits you're requesting for this project (0.1-10)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectSubmissionForm;