import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  Paper, 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button
} from "@mui/material";
import { ExpandMore, Check, Close } from "@mui/icons-material";
import { processProjectNotification } from "../../../redux/noticeRelated/notificationSlice";

const StudentProgress = () => {
  const dispatch = useDispatch();
  const { studentID } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch student subjects
  const fetchStudentSubjects = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${studentID}/subjects`);
      setStudentData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student subjects:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [studentID]);

  useEffect(() => {
    fetchStudentSubjects();
  }, [fetchStudentSubjects]); 

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "success";
      case "rejected": return "error";
      default: return "warning";
    }
  };

  // Handle project assessment
  const handleAssessProject = async (status) => {
    if (!selectedProject) return;

    try {
      // Find the corresponding notification
      const notificationsResponse = await axios.get('http://localhost:5000/api/notifications');
      const matchingNotification = notificationsResponse.data.find(
        notif => 
          notif.studentID === studentID &&
          notif.subjectID === selectedProject.subjectID &&
          notif.outcomeID === selectedProject.outcomeID &&
          notif.projectName === selectedProject.projectName
      );

      if (!matchingNotification) {
        console.error("No matching notification found");
        return;
      }

      // Process the notification using Redux action
      await dispatch(
        processProjectNotification({
          notificationId: matchingNotification._id,
          status,
          approvedCredits: Number(selectedProject.approvedCredit),
          teacherComment: selectedProject.teacherComments,
          teacherName: 'Teacher' // You might want to get actual teacher name
        })
      ).unwrap();

      // Refresh student subjects and close dialog
      await fetchStudentSubjects();
      setSelectedProject(null);
    } catch (error) {
      console.error("Error assessing project:", error);
    }
  };

  // Open assessment dialog
  const handleOpenAssessment = (subject, outcome, project) => {
    setSelectedProject({
      studentID,
      subjectID: subject.subjectId,
      outcomeID: outcome.outcomeId,
      projectName: project.name,
      topicName: outcome.topic,
      requestedCredit: project.requestedCredit,
      approvedCredit: project.requestedCredit,
      teacherComments: ''
    });
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Subjects and Projects
      </Typography>
      
      {studentData && studentData.length > 0 ? (
        studentData.map((subject) => (
          <Paper key={subject.subjectId} sx={{ marginBottom: 2, padding: 2 }}>
            <Typography variant="h6">
              {subject.name} (Credits: {subject.credits})
            </Typography>
            
            {subject.outcomes && subject.outcomes.length > 0 ? (
              subject.outcomes.map((outcome) => (
                <Accordion key={outcome.outcomeId} sx={{ marginTop: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>
                      {outcome.topic} - {outcome.project}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      Credits: {outcome.credits}
                      {outcome.compulsory ? " (Compulsory)" : " (Optional)"}
                    </Typography>
                    
                    {outcome.requirements && outcome.requirements.length > 0 && (
                      <Box sx={{ marginTop: 1 }}>
                        <Typography variant="subtitle2">Requirements:</Typography>
                        {outcome.requirements.map((req, index) => (
                          <Typography key={index} variant="body2">
                            • {req}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    
                    {outcome.projects && outcome.projects.length > 0 && (
                      <TableContainer sx={{ marginTop: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Project Name</TableCell>
                              <TableCell>Requested Credit</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Submission Date</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {outcome.projects.map((project, projectIndex) => (
                              <TableRow key={projectIndex}>
                                <TableCell>{project.name}</TableCell>
                                <TableCell>{project.requestedCredit}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={project.status}
                                    color={getStatusColor(project.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {new Date(project.submissionDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {project.status === 'Pending' && (
                                    <Button 
                                      variant="contained" 
                                      color="primary" 
                                      size="small"
                                      onClick={() => handleOpenAssessment(subject, outcome, project)}
                                    >
                                      Process
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No outcomes found for this subject
              </Typography>
            )}
          </Paper>
        ))
      ) : (
        <Typography>No subjects found for this student</Typography>
      )}

      {/* Project Approval Dialog */}
      {selectedProject && (
        <Dialog
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Project Approval</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>Project:</strong> {selectedProject.projectName}
            </DialogContentText>
            <DialogContentText sx={{ mb: 2 }}>
              <strong>Message:</strong> Student submitted project "{selectedProject.projectName}" for {selectedProject.topicName}
            </DialogContentText>

            <TextField
              fullWidth
              label="Approved Credits"
              type="number"
              value={selectedProject.approvedCredit}
              onChange={(e) => setSelectedProject(prev => ({
                ...prev, 
                approvedCredit: e.target.value
              }))}
              margin="dense"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Teacher Comments"
              multiline
              rows={4}
              value={selectedProject.teacherComments}
              onChange={(e) => setSelectedProject(prev => ({
                ...prev, 
                teacherComments: e.target.value
              }))}
              margin="dense"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleAssessProject('Rejected')}
              color="error"
              startIcon={<Close />}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleAssessProject('Approved')}
              color="success"
              startIcon={<Check />}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default StudentProgress;