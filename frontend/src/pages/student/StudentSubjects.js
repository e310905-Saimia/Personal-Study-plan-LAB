import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  createNotification,
  fetchNotifications,
} from "../../redux/noticeRelated/notificationSlice";
import { getSubjectList } from "../../redux/subjectrelated/subjectHandle";
import { submitStudentProject } from "../../redux/studentRelated/studentHandle";
import {
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { ExpandMore, Delete, Add, Visibility } from "@mui/icons-material";

const StudentSubjects = () => {
  const dispatch = useDispatch();
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
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);
  // State variables for delete confirmation
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [currentOutcome, setCurrentOutcome] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);

  const [availableProjects, setAvailableProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const fetchAvailableProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/projects/active"
      );
      console.log("Available projects from teacher:", response.data);
      setAvailableProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching available projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };
  // Call this in useEffect
  useEffect(() => {
    fetchAvailableProjects();
  }, []);

  const getStudentName = (currentUser) => {
    // Try to get the name from various possible locations
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.student?.name) return currentUser.student.name;

    // If no name found, try to format name from email
    const email = currentUser?.email || currentUser?.student?.email;
    if (email) {
      // Format name from email (e.g., john.doe@example.com -> John Doe)
      const namePart = email.split("@")[0];
      return namePart
        .split(".")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ");
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
      setLoading(true);
      try {
        const studentID = currentUser?._id || currentUser?.student?._id;
        if (studentID) {
          console.log("Fetching data for student ID:", studentID);
          const response = await axios.get(
            `http://localhost:5000/api/students/${studentID}/subjects`
          );
          console.log("Student data received:", response.data);
          setStudentData(response.data);
        }
      } catch (error) {
        console.error("Error fetching student subjects:", error);
        setNotification({
          open: true,
          message: "Failed to load subjects. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
    dispatch(fetchNotifications());
  }, [dispatch, currentUser]);

  // Add this debugging useEffect to log approved projects
  useEffect(() => {
    if (studentData && studentData.length > 0) {
      console.log("Checking approved projects and credits:");
      studentData.forEach((subject) => {
        console.log(`Subject: ${subject.name}`);
        let subjectTotalCredits = 0;

        subject.outcomes?.forEach((outcome) => {
          console.log(`  Outcome: ${outcome.topic}`);

          const approvedProjects =
            outcome.projects?.filter(
              (p) => p.status && p.status.toLowerCase() === "approved"
            ) || [];

          approvedProjects.forEach((project) => {
            const credit =
              project.approvedCredit !== undefined
                ? Number(project.approvedCredit)
                : Number(project.requestedCredit);

            console.log(
              `    Approved Project: ${project.name}, Credit: ${credit}`
            );
            subjectTotalCredits += !isNaN(credit) ? credit : 0;
          });
        });

        console.log(
          `  Total approved credits for subject: ${subjectTotalCredits}`
        );
      });
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
    if (!studentData || studentData.length === 0) {
      return [];
    }

    // Convert IDs to strings for safer comparison
    const subjectIdStr = String(subjectId);
    const outcomeIdStr = String(outcomeId);

    // Find the subject in student data
    const studentSubject = studentData.find(
      (subject) => String(subject.subjectId) === subjectIdStr
    );

    if (!studentSubject) {
      return [];
    }

    // Find the outcome in the subject
    const outcome = studentSubject.outcomes.find(
      (outcome) => String(outcome.outcomeId) === outcomeIdStr
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

  // Modified handleAddProject function without duplicate check
  const handleAddProject = async (outcome, subject) => {
    const outcomeId = outcome.outcomeId || outcome._id;
    const subjectId = subject.subjectId || subject._id;

    // Validation checks
    if (!projects[outcomeId]?.name || !projects[outcomeId]?.credit) {
      setNotification({
        open: true,
        message: "Please fill in all fields!",
        severity: "error",
      });
      return;
    }

    // Validate credit is a positive number
    const creditValue = Number(projects[outcomeId]?.credit);
    if (isNaN(creditValue) || creditValue < 0.1 || creditValue > 10) {
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
    
    // Removed the duplicate check code block
    
    // Set loading
    setLoading(true);

    try {
      // STEP 1: First create the actual project in the student's record
      console.log("Submitting project with data:", {
        name: projects[outcomeId].name,
        requestedCredit: creditValue,
      });

      await dispatch(
        submitStudentProject(studentID, subjectId, outcomeId, {
          name: projects[outcomeId].name,
          requestedCredit: creditValue,
        })
      );

      // STEP 2: Then create the notification for the teacher
      const notificationData = {
        message: `${getStudentName(currentUser)} submitted project "${
          projects[outcomeId].name
        }" for ${outcome.topic} in ${subject.name}`,
        studentID: studentID,
        subjectID: subjectId,
        outcomeID: outcomeId,
        projectName: projects[outcomeId].name,
        creditRequested: creditValue,
        read: false,
        date: new Date().toISOString(),
      };

      await dispatch(createNotification(notificationData));

      // Update local state and show success message
      setProjects((prev) => ({
        ...prev,
        [outcomeId]: {
          ...prev[outcomeId],
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
      const response = await axios.get(
        `http://localhost:5000/api/students/${studentID}/subjects`
      );
      setStudentData(response.data);

      // Refresh other data too
      dispatch(getSubjectList());
      dispatch(fetchNotifications());
    } catch (error) {
      console.error("Project submission error:", error);
      setNotification({
        open: true,
        message: `Failed to submit project: ${
          error?.response?.data?.message || error.message || "Unknown error"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // New handleDeleteProject function that opens the confirmation dialog
  const handleDeleteProject = (project, outcome, subject) => {
    setProjectToDelete(project);
    setCurrentOutcome(outcome);
    setCurrentSubject(subject);
    setConfirmDialogOpen(true);
  };

  // Updated confirmDeleteProject function with consistent ID handling
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

    setLoading(true);
    try {
      // Call the API to delete the project
      await axios.delete(
        `http://localhost:5000/api/students/${studentID}/subjects/${currentSubject.subjectId}/outcomes/${currentOutcome.outcomeId}/projects/${projectToDelete._id}`
      );

      // Update the local studentData state
      if (studentData) {
        const updatedData = studentData.map((subject) => {
          if (subject.subjectId === currentSubject.subjectId) {
            const updatedOutcomes = subject.outcomes.map((outcome) => {
              if (outcome.outcomeId === currentOutcome.outcomeId) {
                return {
                  ...outcome,
                  projects: outcome.projects.filter(
                    (p) => p._id !== projectToDelete._id
                  ),
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
        message: `Failed to delete project: ${
          error?.response?.data?.message || error.message || "Unknown error"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
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

  // Helper function to calculate total approved credits for a subject
  const calculateTotalApprovedCredits = (subject) => {
    if (!subject || !subject.outcomes) return 0;

    let totalApprovedCredits = 0;
    subject.outcomes.forEach((outcome) => {
      if (outcome.projects && outcome.projects.length > 0) {
        outcome.projects.forEach((project) => {
          // Only count projects that have "Approved" status (case insensitive)
          if (project.status && project.status.toLowerCase() === "approved") {
            // First try to use approvedCredit, if not available use requestedCredit
            const creditValue =
              project.approvedCredit !== undefined
                ? Number(project.approvedCredit)
                : Number(project.requestedCredit);

            // Add to total only if it's a valid number
            if (!isNaN(creditValue)) {
              totalApprovedCredits += creditValue;
            }
          }
        });
      }
    });

    // Return the total with maximum 2 decimal places
    return parseFloat(totalApprovedCredits.toFixed(2));
  };

  const calculateGrandTotalCredits = () => {
    if (!studentData || studentData.length === 0) return 0;

    let grandTotal = 0;
    studentData.forEach((subject) => {
      grandTotal += calculateTotalApprovedCredits(subject);
    });

    return parseFloat(grandTotal.toFixed(2));
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
            Total Approved Credits: {calculateGrandTotalCredits()}
          </Typography>
        </Box>
      </Box>

      {loading || notificationsLoading ? (
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
                  <TableCell align="right">Approved Credits</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentData &&
                  studentData.length > 0 &&
                  studentData.map((subject) => (
                    <React.Fragment key={subject.subjectId}>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            onClick={() =>
                              toggleExpandSubject(subject.subjectId)
                            }
                          >
                            <ExpandMore />
                          </IconButton>
                        </TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell align="right">
                          {calculateTotalApprovedCredits(subject)}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell
                          colSpan={3}
                          sx={{ padding: 0, border: "none" }}
                        >
                          <Collapse
                            in={expandedSubject === subject.subjectId}
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
                                    key={outcome.outcomeId}
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
                                              {/* Replace the TextField for project name with this Select component */}
                                              <FormControl
                                                sx={{ minWidth: 200 }}
                                              >
                                                <InputLabel id="project-select-label">
                                                  Project Name
                                                </InputLabel>
                                                <Select
                                                  labelId="project-select-label"
                                                  value={
                                                    projects[outcome.outcomeId]
                                                      ?.name || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleProjectChange(
                                                      outcome.outcomeId,
                                                      "name",
                                                      e.target.value
                                                    )
                                                  }
                                                  label="Project Name"
                                                  disabled={projectsLoading}
                                                  size="small"
                                                >
                                                  <MenuItem value="">
                                                    <em>Select a project</em>
                                                  </MenuItem>
                                                  {availableProjects.map(
                                                    (project) => (
                                                      <MenuItem
                                                        key={project._id}
                                                        value={project.name}
                                                      >
                                                        {project.name}
                                                      </MenuItem>
                                                    )
                                                  )}
                                                </Select>
                                              </FormControl>
                                              <TextField
                                                label="Credit Requested"
                                                variant="outlined"
                                                type="number"
                                                size="small"
                                                value={
                                                  projects[outcome.outcomeId]
                                                    ?.credit || ""
                                                }
                                                onChange={(e) =>
                                                  handleProjectChange(
                                                    outcome.outcomeId,
                                                    "credit",
                                                    e.target.value
                                                  )
                                                }
                                                inputProps={{
                                                  min: 0.1,
                                                  max: 10,
                                                  step: 0.1,
                                                }}
                                                helperText="Value must be between 0.1 and 10"
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
                                                      Requested Credit
                                                    </TableCell>
                                                    <TableCell>
                                                      Approved Credit
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
                                                    const studentProjects =
                                                      getStudentProjects(
                                                        subject.subjectId,
                                                        outcome.outcomeId
                                                      );
                                                    return studentProjects.length >
                                                      0 ? (
                                                      studentProjects.map(
                                                        (project, index) => (
                                                          <TableRow
                                                            key={
                                                              project._id ||
                                                              index
                                                            }
                                                          >
                                                            <TableCell>
                                                              {index + 1}
                                                            </TableCell>
                                                            <TableCell>
                                                              {project.name}
                                                            </TableCell>
                                                            <TableCell>
                                                              {
                                                                project.requestedCredit
                                                              }
                                                            </TableCell>
                                                            <TableCell>
                                                              {project.status?.toLowerCase() ===
                                                              "approved"
                                                                ? project.approvedCredit !==
                                                                  undefined
                                                                  ? project.approvedCredit
                                                                  : project.requestedCredit
                                                                : "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                              <Chip
                                                                size="small"
                                                                label={getStatusLabel(
                                                                  project.status
                                                                )}
                                                                color={getStatusColor(
                                                                  project.status
                                                                )}
                                                              />
                                                            </TableCell>
                                                            <TableCell>
                                                              {project.status ===
                                                                "Approved" ||
                                                              project.status ===
                                                                "Rejected" ? (
                                                                <Box>
                                                                  <Typography variant="body2">
                                                                    By:{" "}
                                                                    {project.assessedBy ||
                                                                      "Teacher"}
                                                                  </Typography>
                                                                  {project.assessment && (
                                                                    <Typography
                                                                      variant="body2"
                                                                      sx={{
                                                                        mt: 0.5,
                                                                      }}
                                                                    >
                                                                      "
                                                                      {
                                                                        project.assessment
                                                                      }
                                                                      "
                                                                    </Typography>
                                                                  )}
                                                                </Box>
                                                              ) : (
                                                                <Typography>
                                                                  Awaiting
                                                                  assessment
                                                                </Typography>
                                                              )}
                                                            </TableCell>
                                                            <TableCell>
                                                              {project.submissionDate
                                                                ? new Date(
                                                                    project.submissionDate
                                                                  )
                                                                    .toLocaleDateString(
                                                                      "en-GB",
                                                                      {
                                                                        day: "2-digit",
                                                                        month:
                                                                          "2-digit",
                                                                        year: "numeric",
                                                                      }
                                                                    )
                                                                    .split("/")
                                                                    .join(".")
                                                                : "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                              {(project.status ===
                                                                "Pending" ||
                                                                !project.status) && (
                                                                <IconButton
                                                                  onClick={() =>
                                                                    handleDeleteProject(
                                                                      project,
                                                                      outcome,
                                                                      subject
                                                                    )
                                                                  }
                                                                >
                                                                  <Delete color="error" />
                                                                </IconButton>
                                                              )}
                                                            </TableCell>
                                                          </TableRow>
                                                        )
                                                      )
                                                    ) : (
                                                      <TableRow>
                                                        <TableCell
                                                          colSpan={8}
                                                          align="center"
                                                        >
                                                          No projects submitted
                                                          yet.
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
                {(!studentData || studentData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No subjects assigned to you yet.
                    </TableCell>
                  </TableRow>
                )}
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
            Are you sure you want to delete this project? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteProject}
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
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