import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Paper,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import {
  ExpandMore,
  Visibility,
  Add,
  Edit,
  Delete,
  Check,
  Close,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import {
  getStudentSubjects,
  updateProjectAssessment,
} from "../../../redux/studentRelated/studentHandle";
import { fetchNotifications } from "../../../redux/noticeRelated/notificationSlice";

const formatNameFromEmail = (email) => {
  if (!email) return "Student";
  const namePart = email.split("@")[0];
  return namePart
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

// Calculate total approved credits for a specific outcome
const calculateOutcomeCredits = (outcome) => {
  if (!outcome || !outcome.projects) return 0;
  
  return outcome.projects.reduce((total, project) => {
    if (project.status === "Approved" && project.approvedCredit) {
      return total + Number(project.approvedCredit);
    }
    return total;
  }, 0);
};

// Calculate total approved credits for a specific subject
const calculateSubjectCredits = (subject) => {
  if (!subject || !subject.outcomes) return 0;
  
  return subject.outcomes.reduce((total, outcome) => {
    return total + calculateOutcomeCredits(outcome);
  }, 0);
};

const calculateTotalApprovedCredits = (studentData) => {
  if (!studentData || !Array.isArray(studentData)) return 0;
  
  return studentData.reduce((total, subject) => {
    if (!subject.outcomes) return total;
    
    const subjectTotal = subject.outcomes.reduce((outcomeTotal, outcome) => {
      if (!outcome.projects) return outcomeTotal;
      
      const outcomeCredits = outcome.projects.reduce((projectTotal, project) => {
        if (project.status === "Approved" && project.approvedCredit) {
          return projectTotal + Number(project.approvedCredit);
        }
        return projectTotal;
      }, 0);
      
      return outcomeTotal + outcomeCredits;
    }, 0);
    
    return total + subjectTotal;
  }, 0);
};

const StudentProgress = () => {
  const { studentID } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const [totalApprovedCredits, setTotalApprovedCredits] = useState(0);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialogs state
  const [openRequirements, setOpenRequirements] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: "", // "subject", "outcome", "requirement", "project"
    id: null,
    name: "",
  });

  // Edit/Add dialogs state
  const [subjectDialog, setSubjectDialog] = useState({
    open: false,
    isEdit: false,
    data: { name: "" }, // Removed credits
    subjectId: null,
  });

  const [outcomeDialog, setOutcomeDialog] = useState({
    open: false,
    isEdit: false,
    data: {
      topic: "",
      minCredits: 0.1,
      maxCredits: 1,
      compulsory: true,
      requirements: [],
    },
    subjectId: null,
    outcomeId: null,
  });

  const [requirementDialog, setRequirementDialog] = useState({
    open: false,
    requirements: [],
    subjectId: null,
    outcomeId: null,
  });

  const [projectDialog, setProjectDialog] = useState({
    open: false,
    data: {
      name: "",
      requestedCredit: 1,
      approvedCredit: 0,
      status: "Pending",
      assessment: "",
    },
    subjectId: null,
    outcomeId: null,
    projectId: null,
  });

  // Get filtered data based on search query and status filter
  const getFilteredData = useCallback(() => {
    if (!studentData) return [];

    // Check for type-based filtering keywords
    const isFilteringByType = 
      searchQuery.toLowerCase() === "subject" || 
      searchQuery.toLowerCase() === "subjects" ||
      searchQuery.toLowerCase() === "outcome" || 
      searchQuery.toLowerCase() === "outcomes" ||
      searchQuery.toLowerCase() === "project" || 
      searchQuery.toLowerCase() === "projects";

    // If we're not using special keywords, do the normal filtering
    if (!isFilteringByType && searchQuery === "" && statusFilter === "all") {
      return studentData; // Return all data when no filters applied
    }

    const isSubjectFilter = 
      searchQuery.toLowerCase() === "subject" || 
      searchQuery.toLowerCase() === "subjects";
    
    const isOutcomeFilter = 
      searchQuery.toLowerCase() === "outcome" || 
      searchQuery.toLowerCase() === "outcomes";
    
    const isProjectFilter = 
      searchQuery.toLowerCase() === "project" || 
      searchQuery.toLowerCase() === "projects";

    return studentData
      .map((subject) => {
        // First check if subject name matches normal search query
        const subjectMatches = !isFilteringByType ? 
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) : 
          isSubjectFilter;

        // Filter outcomes
        const filteredOutcomes = subject.outcomes
          ? subject.outcomes
              .map((outcome) => {
                // Check if outcome topic matches search query
                const outcomeMatches = !isFilteringByType ? 
                  outcome.topic.toLowerCase().includes(searchQuery.toLowerCase()) : 
                  isOutcomeFilter;

                // Filter projects
                const filteredProjects = outcome.projects
                  ? outcome.projects.filter((project) => {
                      // Check if project name matches search query
                      const projectMatches = !isFilteringByType ? 
                        project.name.toLowerCase().includes(searchQuery.toLowerCase()) : 
                        isProjectFilter;

                      // Apply status filter
                      const statusMatches =
                        statusFilter === "all" ||
                        (statusFilter === "pending" &&
                          (!project.status || project.status === "Pending")) ||
                        (statusFilter === "approved" &&
                          project.status === "Approved") ||
                        (statusFilter === "rejected" &&
                          project.status === "Rejected");

                      return (projectMatches || outcomeMatches || subjectMatches) && statusMatches;
                    })
                  : [];

                // Keep outcome if it has matching projects or matches the search query itself
                return {
                  ...outcome,
                  projects: filteredProjects,
                  _show: filteredProjects.length > 0 || outcomeMatches || (isOutcomeFilter && !isFilteringByType),
                };
              })
              .filter((outcome) => outcome._show)
          : [];

        // Keep subject if it has matching outcomes or matches the search query itself
        return {
          ...subject,
          outcomes: filteredOutcomes,
          _show: filteredOutcomes.length > 0 || subjectMatches || (isSubjectFilter && !isFilteringByType),
        };
      })
      .filter((subject) => subject._show);
  }, [studentData, searchQuery, statusFilter]);

  // Fetch student data
  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching data for student ID:", studentID);
      const response = await axios.get(
        `http://localhost:5000/api/students/${studentID}/subjects`
      );

      console.log("Student data received:", response.data);
      setStudentData(response.data);
      const totalCredits = calculateTotalApprovedCredits(response.data);
      setTotalApprovedCredits(totalCredits);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student subjects:", err);
      setError("Failed to load student data. Please try again.");
      setLoading(false);
    }
  }, [studentID]);

  // Initial data load
  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const getStudentName = useCallback(async () => {
    try {
      console.log(`Fetching student details for ID: ${studentID}`);
      
      // Direct API call to get student details
      const response = await axios.get(`http://localhost:5000/api/students/${studentID}`);
      
      console.log("Full student response:", response.data);
  
      // Check for name in various possible locations
      if (response.data) {
        // First, check for a direct name
        if (response.data.name) {
          console.log("Found name directly:", response.data.name);
          return response.data.name;
        }
  
        // Check for nested student object
        if (response.data.student && response.data.student.name) {
          console.log("Found name in nested student object:", response.data.student.name);
          return response.data.student.name;
        }
  
        // If no name, try email
        if (response.data.email) {
          console.log("Formatting name from email:", response.data.email);
          return formatNameFromEmail(response.data.email);
        }
  
        // Check for nested email
        if (response.data.student && response.data.student.email) {
          console.log("Formatting name from nested email:", response.data.student.email);
          return formatNameFromEmail(response.data.student.email);
        }
      }
  
      // Fallback to formatting email from studentData if available
      if (studentData && studentData.length > 0) {
        const firstSubject = studentData[0];
        if (firstSubject.studentEmail) {
          console.log("Formatting name from studentData email:", firstSubject.studentEmail);
          return formatNameFromEmail(firstSubject.studentEmail);
        }
      }
  
      // Last resort
      return "Student";
    } catch (err) {
      console.error("Error fetching student name:", err);
      return "Student";
    }
  }, [studentID, studentData]);
  
  // Load student name
  useEffect(() => {
    const loadStudentName = async () => {
      try {
        const name = await getStudentName();
        console.log("Retrieved student name:", name);
        setStudentName(name);
      } catch (error) {
        console.error("Error loading student name:", error);
        setStudentName("Student");
      }
    };

    loadStudentName();
  }, [getStudentName]);

  // Handle requirements dialog
  const handleOpenRequirements = (requirements, subjectId, outcomeId) => {
    setSelectedRequirements(requirements || []);
    setRequirementDialog({
      open: true,
      requirements: requirements || [],
      subjectId,
      outcomeId,
    });
  };

  // Subject management functions
  const handleAddSubject = () => {
    setSubjectDialog({
      open: true,
      isEdit: false,
      data: { name: "" },
      subjectId: null,
    });
  };

  const handleEditSubject = (subject) => {
    setSubjectDialog({
      open: true,
      isEdit: true,
      data: { name: subject.name },
      subjectId: subject.subjectId,
    });
  };

  const handleDeleteSubject = (subjectId, subjectName) => {
    setDeleteDialog({
      open: true,
      type: "subject",
      id: subjectId,
      name: subjectName,
    });
  };

  // Outcome management functions
  const handleAddOutcome = (subjectId) => {
    setOutcomeDialog({
      open: true,
      isEdit: false,
      data: {
        topic: "",
        minCredits: 0.1,
        maxCredits: 1,
        compulsory: true,
        requirements: [],
      },
      subjectId,
      outcomeId: null,
    });
  };

  const handleEditOutcome = (outcome, subjectId) => {
    setOutcomeDialog({
      open: true,
      isEdit: true,
      data: {
        topic: outcome.topic,
        minCredits: outcome.minCredits || 0.1,
        maxCredits: outcome.maxCredits || 1,
        compulsory: outcome.compulsory || false,
        requirements: outcome.requirements || [],
      },
      subjectId,
      outcomeId: outcome.outcomeId,
    });
  };

  const handleDeleteOutcome = (subjectId, outcomeId, outcomeName) => {
    setDeleteDialog({
      open: true,
      type: "outcome",
      id: outcomeId,
      name: outcomeName,
      subjectId,
    });
  };

  // Project assessment functions
  const handleProjectAssessment = (project, outcome, subject) => {
    setProjectDialog({
      open: true,
      data: {
        name: project.name,
        requestedCredit: project.requestedCredit,
        approvedCredit: project.approvedCredit || project.requestedCredit,
        status: project.status || "Pending",
        assessment: project.assessment || "",
      },
      subjectId: subject.subjectId,
      outcomeId: outcome.outcomeId,
      projectId: project._id,
    });
  };

  // Save functions
  const handleSaveSubject = async () => {
    try {
      setLoading(true);

      const { data, isEdit, subjectId } = subjectDialog;

      if (isEdit) {
        // Update existing subject
        await axios.put(
          `http://localhost:5000/api/students/${studentID}/subjects/${subjectId}`,
          data
        );
      } else {
        // Add new subject
        await axios.post(
          `http://localhost:5000/api/students/${studentID}/subjects`,
          data
        );
      }

      setSubjectDialog({ ...subjectDialog, open: false });
      fetchStudentData();
    } catch (error) {
      console.error("Error saving subject:", error);
      setError("Failed to save subject. Please try again.");
      setLoading(false);
    }
  };

  const handleSaveOutcome = async () => {
    try {
      setLoading(true);

      const { data, isEdit, subjectId, outcomeId } = outcomeDialog;

      if (isEdit) {
        // Update existing outcome
        await axios.put(
          `http://localhost:5000/api/students/${studentID}/subjects/${subjectId}/outcomes/${outcomeId}`,
          data
        );
      } else {
        // Add new outcome
        await axios.post(
          `http://localhost:5000/api/students/${studentID}/subjects/${subjectId}/outcomes`,
          data
        );
      }

      setOutcomeDialog({ ...outcomeDialog, open: false });
      fetchStudentData();
    } catch (error) {
      console.error("Error saving outcome:", error);
      setError("Failed to save outcome. Please try again.");
      setLoading(false);
    }
  };

  const handleSaveRequirements = async () => {
    try {
      setLoading(true);

      const { requirements, subjectId, outcomeId } = requirementDialog;

      await axios.put(
        `http://localhost:5000/api/students/${studentID}/subjects/${subjectId}/outcomes/${outcomeId}`,
        { requirements }
      );

      setRequirementDialog({ ...requirementDialog, open: false });
      fetchStudentData();
    } catch (error) {
      console.error("Error saving requirements:", error);
      setError("Failed to save requirements. Please try again.");
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      setLoading(true);

      const { data, subjectId, outcomeId, projectId } = projectDialog;

      await dispatch(
        updateProjectAssessment(studentID, subjectId, outcomeId, projectId, {
          approvedCredit: Number(data.approvedCredit),
          assessedBy: currentUser?.name || "Teacher",
          status: data.status,
          assessment: data.assessment,
        })
      );

      dispatch(fetchNotifications());
      setProjectDialog({ ...projectDialog, open: false });
      fetchStudentData();
    } catch (error) {
      console.error("Error updating project:", error);
      setError("Failed to update project. Please try again.");
      setLoading(false);
    }
  };

  // Delete confirmation handler
  const confirmDelete = async () => {
    try {
      setLoading(true);

      const { type, id, subjectId } = deleteDialog;

      switch (type) {
        case "subject":
          await axios.delete(
            `http://localhost:5000/api/students/${studentID}/subjects/${id}`
          );
          break;
        case "outcome":
          await axios.delete(
            `http://localhost:5000/api/students/${studentID}/subjects/${subjectId}/outcomes/${id}`
          );
          break;
        case "project":
          await axios.delete(
            `http://localhost:5000/api/students/${studentID}/subjects/${subjectId}/outcomes/${deleteDialog.outcomeId}/projects/${id}`
          );
          break;
        default:
          break;
      }

      setDeleteDialog({
        open: false,
        type: "",
        id: null,
        name: "",
        subjectId: null,
        outcomeId: null,
      });

      fetchStudentData();
    } catch (error) {
      console.error("Error deleting:", error);
      setError(`Failed to delete ${deleteDialog.type}. Please try again.`);
      setLoading(false);
    }
  };

  // Helper function to get status color
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

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header with total credits and add subject button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {studentName}'s Subjects and Projects
          </Typography>
          <Typography 
            variant="h6" 
            color="primary" 
            sx={{ fontWeight: 'bold' }}
          >
            Total Approved Credits: {totalApprovedCredits.toFixed(1)}
          </Typography>
        </Box>
  
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddSubject}
        >
          Add Subject
        </Button>
      </Box>
      
      {/* Search and filter controls */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Search bar */}
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="search-input">Search subjects, outcomes, or projects</InputLabel>
          <OutlinedInput
            id="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            label="Search subjects, outcomes, or projects"
          />
        </FormControl>

        {/* Status filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Project Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Project Status"
            startAdornment={
              <InputAdornment position="start">
                <FilterIcon />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All Projects</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Error message if any */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#ffebee" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Student Info Card */}
      {!loading && studentName !== "Student" && (
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f0f7ff",
          }}
        >
          <Typography variant="h5" sx={{ mr: 2 }}>
            {studentName}
          </Typography>
          <Chip label="Student" color="primary" size="small" />
        </Paper>
      )}
      
      {/* Subject list with filtered data */}
      {!loading && studentData && (
        <Box>
          {(() => {
            const filteredData = getFilteredData();
            return filteredData.length > 0 ? (
              filteredData.map((subject) => (
                <Paper
                  key={subject.subjectId}
                  elevation={2}
                  sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}
                >
                  {/* Subject header with actions */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      bgcolor: "#f5f5f5",
                    }}
                  >
                    <Typography variant="h6">{subject.name}</Typography>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {/* Display subject total credits */}
                      <Typography 
                        variant="h6" 
                        color="primary"
                        sx={{ mr: 3, fontWeight: 'bold' }}
                      >
                        {calculateSubjectCredits(subject).toFixed(1)}
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => handleAddOutcome(subject.subjectId)}
                        sx={{ mr: 1 }}
                      >
                        Add Outcome
                      </Button>

                      <IconButton
                        color="primary"
                        onClick={() => handleEditSubject(subject)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDeleteSubject(subject.subjectId, subject.name)
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Outcomes */}
                  <Box sx={{ p: 0 }}>
                    {subject.outcomes && subject.outcomes.length > 0 ? (
                      subject.outcomes.map((outcome) => (
                        <Accordion key={outcome.outcomeId}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Typography sx={{ flexGrow: 1 }}>
                                {outcome.topic}
                              </Typography>
                              
                              {/* Display outcome total credits */}
                              <Typography 
                                color="primary"
                                sx={{ mr: 2, fontWeight: 'bold' }}
                              >
                                {calculateOutcomeCredits(outcome).toFixed(1)}
                              </Typography>
                              
                              <Chip
                                label={
                                  outcome.compulsory ? "Compulsory" : "Optional"
                                }
                                color={outcome.compulsory ? "primary" : "default"}
                                size="small"
                                sx={{ mr: 2 }}
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            {/* Outcome actions */}
                            <Box sx={{ display: "flex", mb: 2, gap: 1 }}>
                              <Button
                                variant="outlined"
                                startIcon={<Visibility />}
                                onClick={() =>
                                  handleOpenRequirements(
                                    outcome.requirements,
                                    subject.subjectId,
                                    outcome.outcomeId
                                  )
                                }
                              >
                                Manage Requirements
                              </Button>

                              <IconButton
                                color="primary"
                                onClick={() =>
                                  handleEditOutcome(outcome, subject.subjectId)
                                }
                              >
                                <Edit />
                              </IconButton>

                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleDeleteOutcome(
                                    subject.subjectId,
                                    outcome.outcomeId,
                                    outcome.topic
                                  )
                                }
                              >
                                <Delete />
                              </IconButton>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Projects section */}
                            <Typography variant="subtitle1" gutterBottom>
                              Projects:
                            </Typography>

                            {outcome.projects && outcome.projects.length > 0 ? (
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: "#f9f9f9" }}>
                                      <TableCell>Project Name</TableCell>
                                      <TableCell>Requested Credit</TableCell>
                                      <TableCell>Status</TableCell>
                                      <TableCell>Approved Credit</TableCell>
                                      <TableCell>Assessed By</TableCell>
                                      <TableCell>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {outcome.projects.map((project) => (
                                      <TableRow key={project._id}>
                                        <TableCell>{project.name}</TableCell>
                                        <TableCell>
                                          {project.requestedCredit}
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            label={project.status || "Pending"}
                                            color={getStatusColor(project.status)}
                                            size="small"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          {project.status === "Approved"
                                            ? project.approvedCredit ||
                                              project.requestedCredit
                                            : "-"}
                                        </TableCell>
                                        <TableCell>
                                          {project.assessedBy || "-"}
                                        </TableCell>
                                        <TableCell>
                                          <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() =>
                                              handleProjectAssessment(
                                                project,
                                                outcome,
                                                subject
                                              )
                                            }
                                          >
                                            <Edit />
                                          </IconButton>

                                          <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() =>
                                              setDeleteDialog({
                                                open: true,
                                                type: "project",
                                                id: project._id,
                                                name: project.name,
                                                subjectId: subject.subjectId,
                                                outcomeId: outcome.outcomeId,
                                              })
                                            }
                                          >
                                            <Delete />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No projects submitted yet.
                              </Typography>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      ))
                    ) : (
                      <Box sx={{ p: 2, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          No outcomes found for this subject.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              ))
            ) : (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography>
                  {searchQuery || statusFilter !== "all"
                    ? "No results match your search or filter criteria."
                    : "No subjects assigned to this student."}
                </Typography>
              </Paper>
            );
          })()}
        </Box>
      )}
      
      {/* Subject Dialog (Add/Edit) */}
      <Dialog
        open={subjectDialog.open}
        onClose={() => setSubjectDialog({ ...subjectDialog, open: false })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {subjectDialog.isEdit ? "Edit Subject" : "Add Subject"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject Name"
            fullWidth
            value={subjectDialog.data.name}
            onChange={(e) =>
              setSubjectDialog({
                ...subjectDialog,
                data: { ...subjectDialog.data, name: e.target.value },
              })
            }
            sx={{ mb: 2, mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSubjectDialog({ ...subjectDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSubject}
            variant="contained"
            color="primary"
            disabled={!subjectDialog.data.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Outcome Dialog (Add/Edit) */}
      <Dialog
        open={outcomeDialog.open}
        onClose={() => setOutcomeDialog({ ...outcomeDialog, open: false })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {outcomeDialog.isEdit ? "Edit Outcome" : "Add Outcome"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topic"
            fullWidth
            value={outcomeDialog.data.topic}
            onChange={(e) =>
              setOutcomeDialog({
                ...outcomeDialog,
                data: { ...outcomeDialog.data, topic: e.target.value },
              })
            }
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            margin="dense"
            label="Minimum Credits"
            type="number"
            fullWidth
            value={outcomeDialog.data.minCredits}
            onChange={(e) =>
              setOutcomeDialog({
                ...outcomeDialog,
                data: {
                  ...outcomeDialog.data,
                  minCredits: Number(e.target.value),
                },
              })
            }
            InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Maximum Credits"
            type="number"
            fullWidth
            value={outcomeDialog.data.maxCredits}
            onChange={(e) =>
              setOutcomeDialog({
                ...outcomeDialog,
                data: {
                  ...outcomeDialog.data,
                  maxCredits: Number(e.target.value),
                },
              })
            }
            InputProps={{
              inputProps: { min: outcomeDialog.data.minCredits, step: 0.1 },
            }}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={outcomeDialog.data.compulsory}
                onChange={(e) =>
                  setOutcomeDialog({
                    ...outcomeDialog,
                    data: {
                      ...outcomeDialog.data,
                      compulsory: e.target.checked,
                    },
                  })
                }
                color="primary"
              />
            }
            label="Compulsory"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOutcomeDialog({ ...outcomeDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveOutcome}
            variant="contained"
            color="primary"
            disabled={
              !outcomeDialog.data.topic ||
              outcomeDialog.data.minCredits <= 0 ||
              outcomeDialog.data.maxCredits < outcomeDialog.data.minCredits
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Requirements Dialog */}
      <Dialog
        open={requirementDialog.open}
        onClose={() =>
          setRequirementDialog({ ...requirementDialog, open: false })
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Manage Requirements</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Requirements (One per line)"
            value={requirementDialog.requirements.join("\n")}
            onChange={(e) =>
              setRequirementDialog({
                ...requirementDialog,
                requirements: e.target.value
                  .split("\n")
                  .filter((r) => r.trim() !== ""),
              })
            }
            placeholder="Enter each requirement on a new line"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setRequirementDialog({ ...requirementDialog, open: false })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRequirements}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Project Assessment Dialog */}
      <Dialog
        open={projectDialog.open}
        onClose={() => setProjectDialog({ ...projectDialog, open: false })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Assess Project</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2, mt: 1 }}>
            Project: {projectDialog.data.name}
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            Requested Credit: {projectDialog.data.requestedCredit}
          </Typography>

          <TextField
            select
            fullWidth
            label="Status"
            value={projectDialog.data.status}
            onChange={(e) =>
              setProjectDialog({
                ...projectDialog,
                data: { ...projectDialog.data, status: e.target.value },
              })
            }
            sx={{ mb: 2 }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Approved Credits"
            type="number"
            value={projectDialog.data.approvedCredit}
            onChange={(e) =>
              setProjectDialog({
                ...projectDialog,
                data: {
                  ...projectDialog.data,
                  approvedCredit: Number(e.target.value),
                },
              })
            }
            InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
            disabled={projectDialog.data.status !== "Approved"}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Assessment Comments"
            multiline
            rows={4}
            value={projectDialog.data.assessment}
            onChange={(e) =>
              setProjectDialog({
                ...projectDialog,
                data: { ...projectDialog.data, assessment: e.target.value },
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setProjectDialog({ ...projectDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProject}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {deleteDialog.type}: "
            {deleteDialog.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProgress;