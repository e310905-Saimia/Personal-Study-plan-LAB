import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Collapse,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { deleteStudentProject } from '../redux/studentRelated/studentHandle';

// Import the updated ProjectSelector
import ProjectSelector from './ProjectSelector';

const MyProjects = ({ studentID, subjectID, outcomeID, outcomeTopic }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  
  const [expanded, setExpanded] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    projectId: null,
    projectName: ''
  });

  // Fetch student's projects for this outcome
  const fetchProjects = async () => {
    setLoading(true);
    try {
      console.log(`Fetching projects for studentID: ${studentID}, subjectID: ${subjectID}, outcomeID: ${outcomeID}`);
      const response = await axios.get(
        `http://localhost:5000/api/students/${studentID}/subjects/${subjectID}/outcomes/${outcomeID}/projects`
      );
      console.log('Projects fetched:', response.data);
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects on initial render
  useEffect(() => {
    if (studentID && subjectID && outcomeID) {
      fetchProjects();
    }
  }, [studentID, subjectID, outcomeID]);

  // Toggle expansion of My Projects section
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (projectId, projectName) => {
    setDeleteDialog({
      open: true,
      projectId,
      projectName
    });
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      projectId: null,
      projectName: ''
    });
  };

  // Delete a project
  const handleDeleteProject = async () => {
    if (!deleteDialog.projectId) return;
    
    try {
      await dispatch(
        deleteStudentProject(
          studentID,
          subjectID,
          outcomeID,
          deleteDialog.projectId
        )
      );
      
      // Refresh projects list
      fetchProjects();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Get status color for chips
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "success";
      case "rejected": return "error";
      default: return "warning";
    }
  };

  // Format date to local date string
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Paper sx={{ mb: 3 }}>
      {/* Header with toggle */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2,
          cursor: 'pointer',
          bgcolor: '#f5f5f5',
          borderRadius: '4px 4px 0 0'
        }}
        onClick={toggleExpand}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          My Projects
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      
      {/* Collapsible content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2 }}>
          {/* Project Selector Component */}
          <ProjectSelector 
            studentID={studentID}
            subjectID={subjectID}
            outcomeID={outcomeID}
            outcomeTopic={outcomeTopic}
            onProjectSubmitted={fetchProjects}
          />
          
          {/* Projects Table */}
          <TableContainer sx={{ mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                  <TableCell>SN</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Requested Credit</TableCell>
                  <TableCell>Approved Credit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assessment</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : projects && projects.length > 0 ? (
                  projects.map((project, index) => (
                    <TableRow key={project._id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.requestedCredit}</TableCell>
                      <TableCell>
                        {project.status?.toLowerCase() === "approved" 
                          ? (project.approvedCredit !== undefined 
                              ? project.approvedCredit 
                              : project.requestedCredit)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={project.status || "Pending"}
                          color={getStatusColor(project.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {project.status === "Approved" || project.status === "Rejected" ? (
                          <Box>
                            <Typography variant="body2">
                              By: {project.assessedBy || "Teacher"}
                            </Typography>
                            {project.assessment && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                "{project.assessment}"
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            Awaiting assessment
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(project.submissionDate)}
                      </TableCell>
                      <TableCell>
                        {(project.status === "Pending" || !project.status) && (
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(project._id, project.name)}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No projects submitted yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Collapse>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete project "{deleteDialog.projectName}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MyProjects;