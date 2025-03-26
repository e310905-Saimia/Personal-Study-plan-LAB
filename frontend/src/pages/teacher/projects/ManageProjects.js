import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  DialogContentText,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import SearchBar from "../../../components/SearchBar";

const ManageProjects = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add filter stage with default "ALL"
  const [activeTab, setActiveTab] = useState("ALL");
  
  // Add search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Form state
  const [projectData, setProjectData] = useState({
    name: "",
    projectNumber: "",
    stage: "active",
    startDate: new Date().toISOString().split("T")[0],
  });

  // Filter projects based on search term and active tab
  const filterProjects = (projectsToFilter, term, tab) => {
    // First filter by tab/stage
    let result = projectsToFilter;
    
    if (tab !== "ALL") {
      // Map UI tab name to database stage value
      let dbStage;
      switch (tab) {
        case "ACTIVE":
          dbStage = "active";
          break;
        case "IN-PROGRESS":
          dbStage = "in-progress";
          break;
        case "CLOSED":
          dbStage = "closed";
          break;
        default:
          dbStage = tab.toLowerCase();
      }
      
      result = result.filter(project => project.stage === dbStage);
    }
    
    // Then filter by search term if it exists
    if (term) {
      const lowercaseTerm = term.toLowerCase();
      result = result.filter(project => 
        project.name.toLowerCase().includes(lowercaseTerm) ||
        (project.projectNumber && project.projectNumber.toLowerCase().includes(lowercaseTerm))
      );
    }
    
    setFilteredProjects(result);
  };

  // Handle search change
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    filterProjects(projects, term, activeTab);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Always fetch all projects to get correct counts
      const url = "http://localhost:5000/api/projects";
      console.log("Fetching all projects for counts");
      const response = await axios.get(url);

      // Add default values for new fields
      const formattedProjects = response.data.map((project) => ({
        ...project,
        projectNumber:
          project.projectNumber || generateUniqueProjectNumber(project),
        stage: project.stage || "active",
        startDate: project.startDate || new Date().toISOString().split("T")[0],
      }));

      setProjects(formattedProjects);
      
      // Initialize filtered projects
      filterProjects(formattedProjects, searchTerm, activeTab);
      
    } catch (error) {
      console.error("Error fetching projects:", error);
      setNotification({
        open: true,
        message: "Failed to load projects",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate a unique project number for existing projects without one
  const generateUniqueProjectNumber = (project) => {
    const createdYear = project.createdAt
      ? new Date(project.createdAt).getFullYear()
      : new Date().getFullYear();

    const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit number
    return `${createdYear}-${randomNum}`;
  };

  useEffect(() => {
    fetchProjects();
  }, []);
  
  // Effect to refilter projects when tab changes
  useEffect(() => {
    if (projects.length > 0) {
      filterProjects(projects, searchTerm, activeTab);
    }
  }, [activeTab]);

  const handleOpenDialog = (project = null) => {
    if (project) {
      setEditMode(true);
      setSelectedProject(project);
      setProjectData({
        name: project.name,
        projectNumber: project.projectNumber,
        stage: project.stage || "active",
        startDate: project.startDate || new Date().toISOString().split("T")[0],
      });
    } else {
      setEditMode(false);
      setSelectedProject(null);
      setProjectData({
        name: "",
        projectNumber: generateProjectNumber(),
        stage: "active",
        startDate: new Date().toISOString().split("T")[0],
      });
    }
    setOpenDialog(true);
  };

  // Function to generate a project number in format YYYY-NNN
  const generateProjectNumber = () => {
    const year = new Date().getFullYear();
    // Find the highest existing project number for this year
    const lastNumber = projects.reduce((max, project) => {
      if (
        project.projectNumber &&
        project.projectNumber.startsWith(`${year}-`)
      ) {
        const num = parseInt(project.projectNumber.split("-")[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    // Create new number with padding (001, 002, etc.)
    return `${year}-${String(lastNumber + 1).padStart(3, "0")}`;
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedProject(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate fields
    if (!projectData.name) {
      setNotification({
        open: true,
        message: "Project name is required",
        severity: "error",
      });
      return;
    }

    try {
      const teacherID = currentUser?._id || "";
      setLoading(true);

      if (editMode && selectedProject) {
        // Update existing project
        await axios.put(
          `http://localhost:5000/api/projects/${selectedProject._id}`,
          {
            name: projectData.name,
            teacherID,
            projectNumber: projectData.projectNumber,
            stage: projectData.stage,
            startDate: projectData.startDate,
          }
        );

        setNotification({
          open: true,
          message: "Project updated successfully",
          severity: "success",
        });
      } else {
        // Create new project
        await axios.post("http://localhost:5000/api/projects", {
          name: projectData.name,
          teacherID,
          projectNumber: projectData.projectNumber,
          stage: projectData.stage,
          startDate: projectData.startDate,
        });

        setNotification({
          open: true,
          message: "Project created successfully",
          severity: "success",
        });
      }

      // Close dialog and refresh projects
      handleCloseDialog();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      setNotification({
        open: true,
        message: error.response?.data?.message || "Failed to save project",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (project) => {
    setSelectedProject(project);
    setOpenDeleteDialog(true);
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/projects/${selectedProject._id}/soft`
      );

      setNotification({
        open: true,
        message: "Project deleted successfully",
        severity: "success",
      });

      fetchProjects();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      setNotification({
        open: true,
        message: "Failed to delete project",
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Get count of projects by stage
  const getProjectCountByStage = (stage) => {
    if (stage === "ALL") {
      return projects.length;
    }
    
    // The problem is here - we need to map the UI tab names to database values
    let dbStage;
    switch (stage) {
      case "ACTIVE":
        dbStage = "active";
        break;
      case "IN-PROGRESS":
        dbStage = "in-progress";
        break;
      case "CLOSED":
        dbStage = "closed";
        break;
      default:
        dbStage = stage.toLowerCase();
    }
    
    return projects.filter(project => project.stage === dbStage).length;
  };
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get color for stage chip
  const getStageColor = (stage) => {
    switch (stage) {
      case "active":
        return "success";
      case "in-progress":
        return "primary";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  // Get display name for stage
  const getStageName = (stage) => {
    switch (stage) {
      case "active":
        return "Active";
      case "in-progress":
        return "In Progress";
      case "closed":
        return "Closed";
      default:
        return stage
          ? stage.charAt(0).toUpperCase() + stage.slice(1)
          : "Unknown";
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
        <Typography variant="h4">Project List</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Project
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <SearchBar 
          onSearchChange={handleSearchChange}
          placeholder="Search projects by name or project number"
        />
      </Box>

      {/* Toggle navigation similar to notifications */}
      <Box sx={{ mb: 3, borderBottom: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", overflowX: "auto" }}>
          <Box
            onClick={() => setActiveTab("ALL")}
            sx={{
              px: 2,
              py: 1.5,
              cursor: "pointer",
              borderBottom: activeTab === "ALL" ? "2px solid #1976d2" : "none",
              color: activeTab === "ALL" ? "#1976d2" : "inherit",
              fontWeight: activeTab === "ALL" ? "bold" : "normal",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box component="span" sx={{ mr: 1 }}>
              ALL
            </Box>
            <Chip
              label={getProjectCountByStage("ALL")}
              size="small"
              sx={{
                bgcolor: "#e3f2fd",
                color: "#1976d2",
                height: "20px",
                fontSize: "0.75rem",
              }}
            />
          </Box>

          <Box
            onClick={() => setActiveTab("ACTIVE")}
            sx={{
              px: 2,
              py: 1.5,
              cursor: "pointer",
              borderBottom:
                activeTab === "ACTIVE" ? "2px solid #4caf50" : "none",
              color: activeTab === "ACTIVE" ? "#4caf50" : "inherit",
              fontWeight: activeTab === "ACTIVE" ? "bold" : "normal",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box component="span" sx={{ mr: 1 }}>
              ACTIVE
            </Box>
            <Chip
              label={getProjectCountByStage("ACTIVE")}
              size="small"
              sx={{
                bgcolor: "#e8f5e9",
                color: "#4caf50",
                height: "20px",
                fontSize: "0.75rem",
              }}
            />
          </Box>

          <Box
            onClick={() => setActiveTab("IN-PROGRESS")}
            sx={{
              px: 2,
              py: 1.5,
              cursor: "pointer",
              borderBottom:
                activeTab === "IN-PROGRESS" ? "2px solid #2196f3" : "none",
              color: activeTab === "IN-PROGRESS" ? "#2196f3" : "inherit",
              fontWeight: activeTab === "IN-PROGRESS" ? "bold" : "normal",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box component="span" sx={{ mr: 1 }}>
              IN PROGRESS
            </Box>
            <Chip
              label={getProjectCountByStage("IN-PROGRESS")}
              size="small"
              sx={{
                bgcolor: "#e3f2fd",
                color: "#2196f3",
                height: "20px",
                fontSize: "0.75rem",
              }}
            />
          </Box>

          {/* CLOSED Tab */}
          <Box
            onClick={() => setActiveTab("CLOSED")}
            sx={{
              px: 2,
              py: 1.5,
              cursor: "pointer",
              borderBottom:
                activeTab === "CLOSED" ? "2px solid #9e9e9e" : "none",
              color: activeTab === "CLOSED" ? "#9e9e9e" : "inherit",
              fontWeight: activeTab === "CLOSED" ? "bold" : "normal",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box component="span" sx={{ mr: 1 }}>
              CLOSED
            </Box>
            <Chip
              label={getProjectCountByStage("CLOSED")}
              size="small"
              sx={{
                bgcolor: "#f5f5f5",
                color: "#9e9e9e",
                height: "20px",
                fontSize: "0.75rem",
              }}
            />
          </Box>
        </Box>
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Name</TableCell>
                <TableCell>Project Number</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {searchTerm 
                      ? `No projects found matching "${searchTerm}"`
                      : activeTab === "ALL"
                        ? "No projects found. Add your first project."
                        : `No ${activeTab.toLowerCase()} projects found.`}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.projectNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStageName(project.stage)}
                        color={getStageColor(project.stage)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(project.startDate)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(project)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(project)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Project Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editMode ? "Edit Project" : "Add New Project"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Project Name"
              name="name"
              value={projectData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Project Number"
              name="projectNumber"
              value={projectData.projectNumber}
              onChange={handleInputChange}
              margin="normal"
              required
              disabled={!editMode}
              helperText={!editMode ? "Auto-generated project number" : ""}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="stage-select-label">Project Stage</InputLabel>
              <Select
                labelId="stage-select-label"
                name="stage"
                value={projectData.stage}
                onChange={handleInputChange}
                label="Project Stage"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={projectData.startDate}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : editMode ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the project "{selectedProject?.name}
            " ({selectedProject?.projectNumber})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProject}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
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
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageProjects;