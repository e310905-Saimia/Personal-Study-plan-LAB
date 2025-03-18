import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  createNotification,
  fetchNotifications,
} from "../../redux/noticeRelated/notificationSlice";
import { getSubjectList } from "../../redux/subjectrelated/subjectHandle";
import { submitStudentProject, getStudentSubjects } from "../../redux/studentRelated/studentHandle";
import {
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Collapse,
  IconButton,
  Card,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  ExpandMore,
  Delete,
  Add,
  Visibility,
  Refresh,
} from "@mui/icons-material";

const StudentSubjects = () => {
  const dispatch = useDispatch();
  const { subjects = [], loading: subjectsLoading } = useSelector(
    (state) => state.subject
  );
  const { notifications = [], loading: notificationsLoading } = useSelector(
    (state) => state.notification
  );
  const { currentUser } = useSelector((state) => state.user);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [projects, setProjects] = useState({});
  const [openRequirements, setOpenRequirements] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [refreshing, setRefreshing] = useState(false);
  const [studentData, setStudentData] = useState(null);
  // New state variables for delete confirmation
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [currentOutcome, setCurrentOutcome] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);

  const getStudentName = (currentUser) => {
    // Try to get the name from various possible locations
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.student?.name) return currentUser.student.name;
    
    // If no name found, try to format name from email
    const email = currentUser?.email || currentUser?.student?.email;
    if (email) {
      // Format name from email (e.g., john.doe@example.com -> John Doe)
      const namePart = email.split('@')[0];
      return namePart
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }
    
    // If all else fails
    return "Student";
  };

  useEffect(() => {
    dispatch(getSubjectList());
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentID = currentUser?._id || currentUser?.student?._id;
        if (studentID) {
          console.log("Fetching data for student ID:", studentID);
          
          // Use direct axios call instead of going through Redux
          // This matches how data is fetched after adding a project
          const response = await axios.get(`http://localhost:5000/api/students/${studentID}/subjects`);
          console.log("Student data received:", response.data);
          
          // Set the data directly without going through Redux
          setStudentData(response.data);
          
          // Also dispatch to Redux to keep state in sync
          dispatch(getStudentSubjects(studentID));
        }
      } catch (error) {
        console.error("Error fetching student subjects:", error);
      }
    };
    
    // Call the fetch function
    fetchStudentData();
    
    // Add a second fetch after a short delay to ensure data is loaded
    // This helps with some race conditions that might be occurring
    const timer = setTimeout(() => {
      fetchStudentData();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [dispatch, currentUser]);
  
  // Add this debugging useEffect to track when studentData changes
  useEffect(() => {
    if (studentData) {
      console.log("studentData updated, contains", studentData.length, "subjects");
      
      // Check if any projects exist in the data
      let totalProjects = 0;
      studentData.forEach(subject => {
        subject.outcomes?.forEach(outcome => {
          if (outcome.projects && outcome.projects.length > 0) {
            totalProjects += outcome.projects.length;
          }
        });
      });
      
      console.log("Total projects found in studentData:", totalProjects);
    }
  }, [studentData]);
  // Process notifications to get project status
  useEffect(() => {
    if (notifications.length > 0) {
      // Create a map of projects by outcomeID
      const projectsMap = {};

      notifications.forEach((notif) => {
        if (notif.outcomeID && notif.projectName) {
          // Initialize the outcome in our map if it doesn't exist
          if (!projectsMap[notif.outcomeID]) {
            projectsMap[notif.outcomeID] = {
              list: [],
            };
          }

          // Add this project to the list
          projectsMap[notif.outcomeID].list.push({
            id: notif._id,
            name: notif.projectName,
            credit: notif.creditRequested,
            approvedCredits: notif.approvedCredits || 0,
            status: notif.status,
            assessedBy: notif.assessedBy || "",
            date: new Date(notif.date).toISOString().split("T")[0],
            teacherComment: notif.teacherComment,
            processedDate: notif.processedDate
              ? new Date(notif.processedDate).toISOString().split("T")[0]
              : null,
          });
        }
      });

      // Update our projects state with this data
      setProjects((prevProjects) => {
        const newProjects = { ...prevProjects };

        // For each outcome in our map
        Object.keys(projectsMap).forEach((outcomeID) => {
          // Initialize if needed
          if (!newProjects[outcomeID]) {
            newProjects[outcomeID] = {
              list: [],
              name: "",
              credit: "",
            };
          }

          // Set the list of projects
          newProjects[outcomeID].list = projectsMap[outcomeID].list;
        });

        return newProjects;
      });
    }
  }, [notifications]);

  const getStudentProjects = (subjectId, outcomeId) => {
    if (!studentData) {
      return [];
    }
    
    // Convert IDs to strings for safer comparison
    const subjectIdStr = String(subjectId);
    const outcomeIdStr = String(outcomeId);
    
    // Find the subject in student data
    const studentSubject = studentData.find(
      subject => String(subject.subjectId) === subjectIdStr
    );
    
    if (!studentSubject) {
      return [];
    }
    
    // Find the outcome in the subject
    const outcome = studentSubject.outcomes.find(
      outcome => String(outcome.outcomeId) === outcomeIdStr
    );
    
    if (!outcome) {
      return [];
    }
    
    // Return the projects for this outcome (with safeguard)
    return outcome.projects || [];
  };

  const toggleExpandSubject = (subjectID) => {
    setExpandedSubject(expandedSubject === subjectID ? null : subjectID);
  };

  const handleProjectChange = (outcomeID, field, value) => {
    setProjects((prev) => ({
      ...prev,
      [outcomeID]: { ...prev[outcomeID], [field]: value },
    }));
  };

  // Improved handleAddProject function
  const handleAddProject = async (outcome, subject) => {
    // Validate project details
    if (!projects[outcome._id]?.name || !projects[outcome._id]?.credit) {
      setNotification({
        open: true,
        message: "Please fill in all fields!",
        severity: "error",
      });
      return;
    }
  
    // Validate credit is a positive number
    const creditValue = Number(projects[outcome._id]?.credit);
    if (isNaN(creditValue) || creditValue <= 0) {
      setNotification({
        open: true,
        message: "Credit must be a positive number!",
        severity: "error",
      });
      return;
    }
  
    const studentID = currentUser?._id || currentUser?.student?._id;
    
    // Error handling for missing studentID
    if (!studentID) {
      setNotification({
        open: true,
        message: "Unable to identify student. Please try logging in again.",
        severity: "error",
      });
      return;
    }
  
    // Show loading state
    setRefreshing(true);
  
    try {
      // STEP 1: First create the actual project in the student's record
      console.log("Submitting project with data:", {
        name: projects[outcome._id].name,
        requestedCredit: creditValue
      });
      
      await dispatch(
        submitStudentProject(studentID, subject._id, outcome._id, {
          name: projects[outcome._id].name,
          requestedCredit: creditValue
        })
      );
  
      // STEP 2: Then create the notification for the teacher
      const notificationData = {
        message: `${getStudentName(currentUser)} submitted project "${projects[outcome._id].name}" for ${outcome.topic} in ${subject.name}`,
        studentID: studentID,
        subjectID: subject._id,
        outcomeID: outcome._id,
        projectName: projects[outcome._id].name,
        creditRequested: creditValue,
        read: false,
        date: new Date().toISOString()
      };
      
      await dispatch(createNotification(notificationData));
  
      // Update local state and show success message
      setProjects((prev) => ({
        ...prev,
        [outcome._id]: {
          ...prev[outcome._id],
          name: "",
          credit: "",
        },
      }));
  
      setNotification({
        open: true,
        message: "Project submitted successfully! Teacher has been notified.",
        severity: "success",
      });
      
      // Refresh student data directly
      const response = await axios.get(`http://localhost:5000/api/students/${studentID}/subjects`);
      setStudentData(response.data);
      
      // Refresh other data too
      dispatch(getSubjectList());
      dispatch(fetchNotifications());
      
    } catch (error) {
      console.error("Project submission error:", error);
      setNotification({
        open: true,
        message: `Failed to submit project: ${error?.response?.data?.message || error.message || "Unknown error"}`,
        severity: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // New handleDeleteProject function that opens the confirmation dialog
  const handleDeleteProject = (project, outcome, subject) => {
    setProjectToDelete(project);
    setCurrentOutcome(outcome);
    setCurrentSubject(subject);
    setConfirmDialogOpen(true);
  };

  // New confirmDeleteProject function that actually performs the deletion
  const confirmDeleteProject = async () => {
    if (!projectToDelete || !currentOutcome || !currentSubject) {
      setConfirmDialogOpen(false);
      return;
    }
    
    const studentID = currentUser?._id || currentUser?.student?._id;
    if (!studentID) {
      setNotification({
        open: true,
        message: "Unable to identify student. Please try logging in again.",
        severity: "error",
      });
      setConfirmDialogOpen(false);
      return;
    }
    
    setRefreshing(true);
    try {
      // Call the API to delete the project
      await axios.delete(
        `http://localhost:5000/api/students/${studentID}/subjects/${currentSubject._id}/outcomes/${currentOutcome._id}/projects/${projectToDelete._id}`
      );
      
      // Update the local studentData state
      if (studentData) {
        const updatedData = studentData.map(subject => {
          if (subject.subjectId.toString() === currentSubject._id.toString()) {
            const updatedOutcomes = subject.outcomes.map(outcome => {
              if (outcome.outcomeId.toString() === currentOutcome._id.toString()) {
                return {
                  ...outcome,
                  projects: outcome.projects.filter(p => p._id !== projectToDelete._id)
                };
              }
              return outcome;
            });
            return { ...subject, outcomes: updatedOutcomes };
          }
          return subject;
        });
        
        setStudentData(updatedData);
      }
      
      setNotification({
        open: true,
        message: "Project deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      setNotification({
        open: true,
        message: `Failed to delete project: ${error?.response?.data?.message || error.message || "Unknown error"}`,
        severity: "error",
      });
    } finally {
      setRefreshing(false);
      setConfirmDialogOpen(false);
      setProjectToDelete(null);
      setCurrentOutcome(null);
      setCurrentSubject(null);
    }
  };

  const handleOpenRequirements = (requirements) => {
    setSelectedRequirements(requirements || []);
    setOpenRequirements(true);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Improved refreshData function - refreshes from API directly
  // const refreshData = async () => {
  //   setRefreshing(true);
  //   try {
  //     // Get the student ID
  //     const studentID = currentUser?._id || currentUser?.student?._id;
      
  //     // Fetch notifications and subjects
  //     await dispatch(fetchNotifications());
  //     await dispatch(getSubjectList());
      
  //     // Also refresh student-specific data if needed
  //     if (studentID) {
  //       const response = await axios.get(`http://localhost:5000/api/students/${studentID}/subjects`);
  //       setStudentData(response.data);
  //     }
      
  //     setNotification({
  //       open: true,
  //       message: "Data refreshed successfully!",
  //       severity: "success",
  //     });
  //   } catch (error) {
  //     console.error("Error refreshing data:", error);
  //     setNotification({
  //       open: true,
  //       message: "Failed to refresh data. Please try again.",
  //       severity: "error",
  //     });
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };

  // Status helper functions
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Student Subjects
        </Typography>
        {/* <Button
          startIcon={<Refresh />}
          onClick={refreshData}
          variant="outlined"
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Button> */}
      </Box>

      {(subjectsLoading || notificationsLoading) && !refreshing ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell> </TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell align="right">Credits</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.length > 0 &&
                  subjects.map((subject) => (
                    <React.Fragment key={subject._id}>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            onClick={() => toggleExpandSubject(subject._id)}
                          >
                            <ExpandMore />
                          </IconButton>
                        </TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell align="right">{subject.credits}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell
                          colSpan={3}
                          sx={{ padding: 0, border: "none" }}
                        >
                          <Collapse
                            in={expandedSubject === subject._id}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{
                                margin: 2,
                                padding: 2,
                                background: "#f5f5f5",
                                borderRadius: 2,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold", mb: 1 }}
                              >
                                Outcomes:
                              </Typography>

                              {subject.outcomes.length > 0 &&
                                subject.outcomes.map((outcome) => (
                                  <Accordion
                                    key={outcome._id}
                                    sx={{ marginBottom: 1 }}
                                  >
                                    <AccordionSummary
                                      expandIcon={<ExpandMore />}
                                    >
                                      <Typography variant="h6">
                                        {outcome.topic}
                                      </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Button
                                        variant="outlined"
                                        startIcon={<Visibility />}
                                        sx={{ mt: 2 }}
                                        onClick={() =>
                                          handleOpenRequirements(
                                            outcome.requirements
                                          )
                                        }
                                      >
                                        View Requirements
                                      </Button>

                                      <Accordion
                                        sx={{
                                          mt: 2,
                                          boxShadow: 0,
                                          backgroundColor: "#f9f9f9",
                                        }}
                                      >
                                        <AccordionSummary
                                          expandIcon={<ExpandMore />}
                                        >
                                          <Typography
                                            variant="subtitle1"
                                            sx={{
                                              color: "#1976d2",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            My Projects
                                          </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                          <Card
                                            sx={{
                                              backgroundColor: "#ffffff",
                                              borderRadius: 2,
                                              boxShadow: 1,
                                              p: 2,
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              sx={{ fontWeight: "bold", mb: 2 }}
                                            >
                                              Submit Your Project
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />

                                            <Box
                                              sx={{
                                                display: "flex",
                                                gap: 2,
                                                mb: 2,
                                              }}
                                            >
                                              <TextField
                                                label="Project Name"
                                                variant="outlined"
                                                size="small"
                                                value={
                                                  projects[outcome._id]?.name ||
                                                  ""
                                                }
                                                onChange={(e) =>
                                                  handleProjectChange(
                                                    outcome._id,
                                                    "name",
                                                    e.target.value
                                                  )
                                                }
                                              />
                                              <TextField
                                                label="Credit Requested"
                                                variant="outlined"
                                                type="number"
                                                size="small"
                                                value={
                                                  projects[outcome._id]
                                                    ?.credit || ""
                                                }
                                                onChange={(e) =>
                                                  handleProjectChange(
                                                    outcome._id,
                                                    "credit",
                                                    e.target.value
                                                  )
                                                }
                                              />
                                              <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<Add />}
                                                onClick={() =>
                                                  handleAddProject(
                                                    outcome,
                                                    subject
                                                  )
                                                }
                                              >
                                                Add
                                              </Button>
                                            </Box>

                                            <TableContainer>
                                              <Table>
                                                <TableHead>
                                                  <TableRow
                                                    sx={{
                                                      backgroundColor:
                                                        "#e0e0e0",
                                                    }}
                                                  >
                                                    <TableCell>SN</TableCell>
                                                    <TableCell>
                                                      Project Name
                                                    </TableCell>
                                                    <TableCell>
                                                      Credit
                                                    </TableCell>
                                                    <TableCell>
                                                      Status
                                                    </TableCell>
                                                    <TableCell>
                                                      Assessment
                                                    </TableCell>
                                                    <TableCell>
                                                      Submission Date
                                                    </TableCell>
                                                    <TableCell>
                                                      Action
                                                    </TableCell>
                                                  </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                  {(() => {
                                                    const studentProjects = getStudentProjects(subject._id, outcome._id);
                                                    return studentProjects.length > 0 ? (
                                                      studentProjects.map((project, index) => (
                                                        <TableRow key={project._id || index}>
                                                          <TableCell>{index + 1}</TableCell>
                                                          <TableCell>{project.name}</TableCell>
                                                          <TableCell>{project.requestedCredit}</TableCell>
                                                          <TableCell>
                                                            <Chip
                                                              size="small"
                                                              label={getStatusLabel(project.status)}
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
                                                                  <Typography
                                                                    variant="body2"
                                                                    sx={{ mt: 0.5 }}
                                                                  >
                                                                    "{project.assessment}"
                                                                  </Typography>
                                                                )}
                                                              </Box>
                                                            ) : (
                                                              <Typography>Awaiting assessment</Typography>
                                                            )}
                                                          </TableCell>
                                                          <TableCell>
                                                            {project.submissionDate
                                                              ? new Date(project.submissionDate).toISOString().split("T")[0]
                                                              : "-"}
                                                          </TableCell>
                                                          <TableCell>
                                                            {(project.status === "Pending" || !project.status) && (
                                                              <IconButton
                                                                onClick={() =>
                                                                  handleDeleteProject(project, outcome, subject)
                                                                }
                                                              >
                                                                <Delete color="error" />
                                                              </IconButton>
                                                            )}
                                                          </TableCell>
                                                        </TableRow>
                                                      ))
                                                    ) : (
                                                      <TableRow>
                                                        <TableCell colSpan={7} align="center">
                                                          No projects submitted yet.
                                                        </TableCell>
                                                      </TableRow>
                                                    );
                                                  })()}
                                                </TableBody>
                                              </Table>
                                            </TableContainer>
                                          </Card>
                                        </AccordionDetails>
                                      </Accordion>
                                    </AccordionDetails>
                                  </Accordion>
                                ))}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

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
        <DialogActions>
          <Button onClick={() => setOpenRequirements(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Project Deletion"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteProject} 
            color="error" 
            disabled={refreshing}
            startIcon={refreshing ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentSubjects;