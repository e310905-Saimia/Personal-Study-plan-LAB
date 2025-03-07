import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { ExpandMore, Visibility } from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const StudentCompetencies = () => {
  const { studentID } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openRequirements, setOpenRequirements] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState([]);

  // Utility function to format name from email
  const formatNameFromEmail = (email) => {
    if (!email) return 'Student';
    const namePart = email.split('@')[0];
    return namePart
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "success";
      case "rejected": return "error";
      default: return "warning";
    }
  };

  // Open requirements dialog
  const handleOpenRequirements = (requirements) => {
    setSelectedRequirements(requirements || []);
    setOpenRequirements(true);
  };

  // Fetch student competencies
  useEffect(() => {
    const fetchStudentCompetencies = async () => {
      try {
        setLoading(true);
        
        // Log the studentID to verify
        console.log('Fetching competencies for studentID:', studentID);

        // Fetch subjects data
        const subjectsResponse = await axios.get(
          `http://localhost:5000/api/students/${studentID}/subjects`
        );
        
        // Log subjects response
        console.log('Subjects Response:', subjectsResponse.data);

        // Fetch student details
        const studentDetailsResponse = await axios.get(
          `http://localhost:5000/api/students/${studentID}`
        );
        
        // Log student details
        console.log('Student Details Response:', studentDetailsResponse.data);

        // Combine student details with subjects data
        const combinedData = {
          ...studentDetailsResponse.data,
          subjects: subjectsResponse.data
        };

        setStudentData(combinedData);
        setLoading(false);
      } catch (err) {
        console.error('Detailed error fetching student competencies:', err);
        
        // More detailed error handling
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Server Error: ${err.response.status} - ${err.response.data.message || 'Failed to load student competencies'}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response received from server. Please check your network connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError('Error setting up the request. Please try again.');
        }
        
        setLoading(false);
      }
    };

    fetchStudentCompetencies();
  }, [studentID]);

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!studentData?.subjects) return 0;

    const totalSubjects = studentData.subjects.length;
    const completedSubjects = studentData.subjects.filter(subject => 
      subject.outcomes.every(outcome => 
        outcome.projects && 
        outcome.projects.some(project => project.status === 'Approved')
      )
    ).length;

    return Math.round((completedSubjects / totalSubjects) * 100);
  };

  // Calculate total approved credits
  const calculateTotalApprovedCredits = () => {
    if (!studentData?.subjects) return 0;

    return studentData.subjects.reduce((total, subject) => {
      const subjectCredits = subject.outcomes.reduce((subTotal, outcome) => {
        const approvedProjectCredits = outcome.projects
          ?.filter(project => project.status === 'Approved')
          .reduce((projTotal, project) => projTotal + (project.requestedCredit || 0), 0);
        return subTotal + (approvedProjectCredits || 0);
      }, 0);
      return total + subjectCredits;
    }, 0);
  };

  // Loading state
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh" 
        p={3}
      >
        <Typography color="error" variant="h6" gutterBottom>
          Error Loading Student Competencies
        </Typography>
        <Typography color="error" variant="body1" align="center">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Student Competencies
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
        >
          Back to Students
        </Button>
      </Box>

      {/* Student Overview Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">
                {studentData.name || formatNameFromEmail(studentData.email)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {studentData.email}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>
                Total Subjects: {studentData.subjects.length}
              </Typography>
              <Typography>
                Total Approved Credits: {calculateTotalApprovedCredits()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>
                Overall Progress: {calculateOverallProgress()}%
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Subjects and Outcomes */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Outcomes</TableCell>
                <TableCell>Progress</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentData.subjects.map((subject) => (
                <TableRow key={subject.subjectId}>
                  <TableCell>{subject.subjectName}</TableCell>
                  <TableCell>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>View Outcomes</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {subject.outcomes.map((outcome) => (
                          <Box key={outcome.outcomeId} sx={{ mb: 2 }}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                {outcome.topic}
                              </Typography>
                              {outcome.requirements && outcome.requirements.length > 0 && (
                                <Button
                                  variant="outlined"
                                  startIcon={<Visibility />}
                                  size="small"
                                  onClick={() => handleOpenRequirements(outcome.requirements)}
                                >
                                  View Requirements
                                </Button>
                              )}
                            </Box>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Project</TableCell>
                                    <TableCell>Credit</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Assessment</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {outcome.projects?.map((project) => (
                                    <TableRow key={project._id}>
                                      <TableCell>{project.name}</TableCell>
                                      <TableCell>{project.requestedCredit}</TableCell>
                                      <TableCell>
                                        <Chip 
                                          size="small" 
                                          label={project.status || 'Pending'} 
                                          color={getStatusColor(project.status)}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {project.status === 'Approved' || project.status === 'Rejected' ? (
                                          <Box>
                                            <Typography variant="body2">
                                              By: {project.assessedBy || "Teacher"}
                                            </Typography>
                                            {project.assessment && (
                                              <Typography
                                                variant="body2"
                                                sx={{ mt: 0.5, fontStyle: 'italic' }}
                                              >
                                                "{project.assessment}"
                                              </Typography>
                                            )}
                                          </Box>
                                        ) : (
                                          <Typography variant="body2">Awaiting assessment</Typography>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                  <TableCell>
                    {/* Progress Calculation */}
                    <Chip 
                      label={`${
                        Math.round(
                          (subject.outcomes.filter(outcome => 
                            outcome.projects?.some(p => p.status === 'Approved')
                          ).length / subject.outcomes.length) * 100
                      ) || 0}%`} 
                      color="primary" 
                      variant="outlined" 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Requirements Dialog */}
      <Dialog
        open={openRequirements}
        onClose={() => setOpenRequirements(false)}
      >
        <DialogTitle>Requirements</DialogTitle>
        <DialogContent>
          {selectedRequirements.length > 0
            ? selectedRequirements.map((req, index) => (
                <Typography key={index} sx={{ mt: 1 }}>
                  • {req}
                </Typography>
              ))
            : "No requirements available."}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudentCompetencies;