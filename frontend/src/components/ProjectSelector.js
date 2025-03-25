import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { submitStudentProject } from '../redux/studentRelated/studentHandle';
import { createNotification } from '../redux/noticeRelated/notificationSlice';

const ProjectSelector = ({ studentID, subjectID, outcomeID, outcomeTopic, onProjectSubmitted }) => {
  const dispatch = useDispatch();
  
  // State for project selection
  const [selectedProject, setSelectedProject] = useState('');
  const [requestedCredit, setRequestedCredit] = useState('');
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch available projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  // Function to fetch available projects from the API - only active ones
  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      console.log("Fetching active projects for student...");
      
      // Use the dedicated endpoint for active projects
      const url = 'http://localhost:5000/api/projects/active';
      console.log("API Request URL:", url);
  
      const response = await axios.get(url);
      console.log("API Response for active projects:", response.data);
      
      // Double-check with client-side filtering as a safeguard
      const activeProjects = response.data.filter(p => p.stage === 'active');
      console.log(`Filtered to ${activeProjects.length} active projects`);
      
      setAvailableProjects(activeProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load available projects");
    } finally {
      setProjectsLoading(false);
    }
  };

  // Handle project selection change
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    
    // Reset any errors
    setError('');
    
    // If a project was selected, set a default requested credit
    if (projectId) {
      const selectedProjectData = availableProjects.find(p => p._id === projectId);
      if (selectedProjectData) {
        setRequestedCredit('1'); // Default value
      }
    }
  };

  // Handle credit input change
  const handleCreditChange = (e) => {
    setRequestedCredit(e.target.value);
    // Reset any errors
    setError('');
  };

  // Handle project submission
  const handleSubmit = async () => {
    // Validate inputs
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }

    if (!requestedCredit) {
      setError('Please enter requested credits');
      return;
    }

    const creditValue = Number(requestedCredit);
    if (isNaN(creditValue) || creditValue <= 0) {
      setError('Credit must be a positive number');
      return;
    }

    setLoading(true);
    try {
      // Find selected project details from available projects
      const projectDetails = availableProjects.find(p => p._id === selectedProject);
      
      if (!projectDetails) {
        throw new Error('Selected project not found');
      }

      // Submit project
      const response = await dispatch(
        submitStudentProject(
          studentID,
          subjectID,
          outcomeID,
          {
            name: projectDetails.name,
            requestedCredit: creditValue,
            projectNumber: projectDetails.projectNumber // Include project number
          }
        )
      );

      console.log('Project submission response:', response);

      // Create notification for teacher
      await dispatch(
        createNotification({
          message: `New project "${projectDetails.name}" (${projectDetails.projectNumber || 'No ID'}) submitted for ${outcomeTopic}`,
          studentID: studentID,
          subjectID: subjectID,
          outcomeID: outcomeID,
          projectName: projectDetails.name,
          projectNumber: projectDetails.projectNumber,
          creditRequested: creditValue,
          read: false,
          date: new Date().toISOString()
        })
      );

      // Show success notification
      setNotification({
        open: true,
        message: 'Project submitted successfully!',
        severity: 'success'
      });

      // Reset form
      setSelectedProject('');
      setRequestedCredit('');
      
      // Call callback if provided
      if (onProjectSubmitted) {
        onProjectSubmitted();
      }
    } catch (err) {
      console.error("Error submitting project:", err);
      setNotification({
        open: true,
        message: `Failed to submit project: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Submit Your Project
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="project-select-label">Project Name</InputLabel>
          <Select
            labelId="project-select-label"
            value={selectedProject}
            onChange={handleProjectChange}
            label="Project Name"
            disabled={projectsLoading || loading || availableProjects.length === 0}
          >
            <MenuItem value="">
              <em>Select a project</em>
            </MenuItem>
            {availableProjects.map((project) => (
              <MenuItem key={project._id} value={project._id}>
                {project.name} {project.projectNumber ? `(${project.projectNumber})` : ''}
              </MenuItem>
            ))}
          </Select>
          {availableProjects.length === 0 && !projectsLoading && (
            <Typography variant="caption" color="error">
              No active projects available
            </Typography>
          )}
        </FormControl>
        
        <TextField
          label="Credit Requested"
          type="number"
          value={requestedCredit}
          onChange={handleCreditChange}
          disabled={loading || !selectedProject}
          InputProps={{
            inputProps: { min: 0.1, step: 0.1 }
          }}
        />
        
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          onClick={handleSubmit}
          disabled={loading || projectsLoading || !selectedProject || !requestedCredit || availableProjects.length === 0}
        >
          ADD
        </Button>
      </Box>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectSelector;