import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography,
  IconButton
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { submitStudentProject } from '../../../redux/studentRelated/studentHandle';

// This component can be used in the student dashboard to submit projects
const ProjectSubmissionForm = ({ studentID, subjectID, outcomeID, outcomeTopic }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [requestedCredit, setRequestedCredit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!projectName || !requestedCredit) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await dispatch(submitStudentProject(
        studentID, 
        subjectID, 
        outcomeID, 
        {
          name: projectName,
          requestedCredit: Number(requestedCredit)
        }
      ));

      // Reset form and close dialog
      setProjectName('');
      setRequestedCredit('');
      setOpen(false);
      alert('Project submitted successfully!');
      
      // You can add a callback here to refresh the projects list if needed
      
    } catch (error) {
      alert(`Error submitting project: ${error.message}`);
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
          <Typography variant="body2" paragraph sx={{ mt: 1 }}>
            Your project will be reviewed by your teacher. Once approved, you'll receive the requested credits.
          </Typography>
          
          <TextField
            fullWidth
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Requested Credits"
            type="number"
            value={requestedCredit}
            onChange={(e) => setRequestedCredit(e.target.value)}
            margin="normal"
            required
            inputProps={{ min: 1 }}
            helperText="Enter the number of credits you're requesting for this project"
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
            {loading ? 'Submitting...' : 'Submit Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectSubmissionForm;