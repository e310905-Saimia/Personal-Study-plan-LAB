import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNotification, fetchNotifications } from "../../redux/noticeRelated/notificationSlice";
import { getSubjectList } from "../../redux/subjectrelated/subjectHandle";
import {
    Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Collapse, IconButton, Card, Divider, Accordion, AccordionSummary, AccordionDetails, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress, Chip
} from "@mui/material";
import { ExpandMore, Delete, Add, Visibility, Refresh } from "@mui/icons-material";

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const { subjects = [], loading: subjectsLoading } = useSelector((state) => state.subject);
    const { notifications = [], loading: notificationsLoading } = useSelector((state) => state.notification);
    const { currentUser } = useSelector((state) => state.user);
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [projects, setProjects] = useState({});
    const [openRequirements, setOpenRequirements] = useState(false);
    const [selectedRequirements, setSelectedRequirements] = useState([]);
    const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(getSubjectList());
        dispatch(fetchNotifications());
    }, [dispatch]);

    // Process notifications to get project status
    useEffect(() => {
        if (notifications.length > 0) {
            // Create a map of projects by outcomeID
            const projectsMap = {};
            
            notifications.forEach(notif => {
                if (notif.outcomeID && notif.projectName) {
                    // Initialize the outcome in our map if it doesn't exist
                    if (!projectsMap[notif.outcomeID]) {
                        projectsMap[notif.outcomeID] = {
                            list: []
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
                        date: new Date(notif.date).toISOString().split('T')[0],
                        teacherComment: notif.teacherComment,
                        processedDate: notif.processedDate ? new Date(notif.processedDate).toISOString().split('T')[0] : null
                    });
                }
            });
            
            // Update our projects state with this data
            setProjects(prevProjects => {
                const newProjects = { ...prevProjects };
                
                // For each outcome in our map
                Object.keys(projectsMap).forEach(outcomeID => {
                    // Initialize if needed
                    if (!newProjects[outcomeID]) {
                        newProjects[outcomeID] = { 
                            list: [],
                            name: "", 
                            credit: "" 
                        };
                    }
                    
                    // Set the list of projects
                    newProjects[outcomeID].list = projectsMap[outcomeID].list;
                });
                
                return newProjects;
            });
        }
    }, [notifications]);

    const toggleExpandSubject = (subjectID) => {
        setExpandedSubject(expandedSubject === subjectID ? null : subjectID);
    };

    const handleProjectChange = (outcomeID, field, value) => {
        setProjects(prev => ({
            ...prev,
            [outcomeID]: { ...prev[outcomeID], [field]: value }
        }));
    };

    const handleAddProject = async (outcome, subject) => {
        // Validate project details
        if (!projects[outcome._id]?.name || !projects[outcome._id]?.credit) {
            setNotification({
                open: true,
                message: "Please fill in all fields!",
                severity: "error"
            });
            return;
        }
    
        // DETAILED DEBUGGING
        console.log("FULL Current User Object:", currentUser);
        console.log("Student ID Candidates:", {
            '_id': currentUser?._id,
            'student._id': currentUser?.student?._id,
            'student.id': currentUser?.student?.id
        });
    
        const newProject = {
            name: projects[outcome._id]?.name,
            credit: projects[outcome._id]?.credit,
            assessedBy: "", 
            date: new Date().toISOString().split('T')[0],
        };
    
        // Try multiple potential student ID sources
        const studentID = 
            currentUser?._id || 
            currentUser?.student?._id || 
            currentUser?.student?.id;
    
        // Prepare notification data
        const notificationData = {
            message: `${currentUser?.name || currentUser?.student?.name || 'A student'} submitted project "${newProject.name}" for ${outcome.topic} in ${subject.name}`,
            studentID: studentID,  // Use the extracted student ID
            subjectID: subject._id,
            outcomeID: outcome._id,
            projectName: newProject.name,
            creditRequested: Number(newProject.credit),
            read: false,
            date: new Date().toISOString()
        };
    
        try {
            // Validate that studentID exists before sending
            if (!notificationData.studentID) {
                throw new Error("Student ID is missing. Please log in again.");
            }
    
            // Dispatch the create notification action
            const result = await dispatch(createNotification(notificationData)).unwrap();
    
            // Update local state for projects
            setProjects(prev => ({
                ...prev,
                [outcome._id]: {
                    ...prev[outcome._id],
                    name: "",
                    credit: ""
                }
            }));
    
            setNotification({
                open: true,
                message: "Project submitted successfully! Teacher has been notified.",
                severity: "success"
            });
        } catch (error) {
            console.error("Notification creation FULL error:", error);
            setNotification({
                open: true,
                message: `Failed to notify teacher: ${error.message}`,
                severity: "error"
            });
        }
    };

    const handleDeleteProject = (outcomeID, index) => {
        setProjects(prev => ({
            ...prev,
            [outcomeID]: {
                ...prev[outcomeID],
                list: prev[outcomeID]?.list.filter((_, i) => i !== index)
            }
        }));
    };

    const handleOpenRequirements = (requirements) => {
        setSelectedRequirements(requirements || []);
        setOpenRequirements(true);
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const refreshData = async () => {
        setRefreshing(true);
        try {
            await dispatch(fetchNotifications()).unwrap();
            await dispatch(getSubjectList()).unwrap();
            setNotification({
                open: true,
                message: "Data refreshed successfully!",
                severity: "success"
            });
        } catch (error) {
            setNotification({
                open: true,
                message: "Failed to refresh data. Please try again.",
                severity: "error"
            });
        } finally {
            setRefreshing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'warning';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            default: return 'Pending';
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Student Subjects
                </Typography>
                <Button 
                    startIcon={<Refresh />} 
                    onClick={refreshData} 
                    variant="outlined" 
                    disabled={refreshing}
                >
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
            </Box>
            
            {(subjectsLoading || notificationsLoading) && !refreshing ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
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
                                {subjects.length > 0 && subjects.map((subject) => (
                                    <React.Fragment key={subject._id}>
                                        <TableRow>
                                            <TableCell>
                                                <IconButton onClick={() => toggleExpandSubject(subject._id)}>
                                                    <ExpandMore />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{subject.name}</TableCell>
                                            <TableCell align="right">{subject.credits}</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell colSpan={3} sx={{ padding: 0, border: "none" }}>
                                                <Collapse in={expandedSubject === subject._id} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 2, padding: 2, background: "#f5f5f5", borderRadius: 2 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                                                            Outcomes:
                                                        </Typography>

                                                        {subject.outcomes.length > 0 && subject.outcomes.map((outcome) => (
                                                            <Accordion key={outcome._id} sx={{ marginBottom: 1 }}>
                                                                <AccordionSummary expandIcon={<ExpandMore />}>
                                                                    <Typography variant="h6">
                                                                        {outcome.topic}
                                                                    </Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    <Button
                                                                        variant="outlined"
                                                                        startIcon={<Visibility />}
                                                                        sx={{ mt: 2 }}
                                                                        onClick={() => handleOpenRequirements(outcome.requirements)}
                                                                    >
                                                                        View Requirements
                                                                    </Button>

                                                                    <Accordion sx={{ mt: 2, boxShadow: 0, backgroundColor: "#f9f9f9" }}>
                                                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                                                            <Typography variant="subtitle1" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                                                                                My Projects
                                                                            </Typography>
                                                                        </AccordionSummary>
                                                                        <AccordionDetails>
                                                                            <Card sx={{ backgroundColor: "#ffffff", borderRadius: 2, boxShadow: 1, p: 2 }}>
                                                                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                                                                                    Submit Your Project
                                                                                </Typography>
                                                                                <Divider sx={{ mb: 2 }} />

                                                                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                                                                    <TextField
                                                                                        label="Project Name"
                                                                                        variant="outlined"
                                                                                        size="small"
                                                                                        value={projects[outcome._id]?.name || ""}
                                                                                        onChange={(e) => handleProjectChange(outcome._id, "name", e.target.value)}
                                                                                    />
                                                                                    <TextField
                                                                                        label="Credit Requested"
                                                                                        variant="outlined"
                                                                                        type="number"
                                                                                        size="small"
                                                                                        value={projects[outcome._id]?.credit || ""}
                                                                                        onChange={(e) => handleProjectChange(outcome._id, "credit", e.target.value)}
                                                                                    />
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        color="primary"
                                                                                        startIcon={<Add />}
                                                                                        onClick={() => handleAddProject(outcome, subject)}
                                                                                    >
                                                                                        Add
                                                                                    </Button>
                                                                                </Box>

                                                                                <TableContainer>
                                                                                    <Table>
                                                                                        <TableHead>
                                                                                            <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                                                                                                <TableCell>SN</TableCell>
                                                                                                <TableCell>Project Name</TableCell>
                                                                                                <TableCell>Credit</TableCell>
                                                                                                <TableCell>Status</TableCell>
                                                                                                <TableCell>Assessment</TableCell>
                                                                                                <TableCell>Submission Date</TableCell>
                                                                                                <TableCell>Action</TableCell>
                                                                                            </TableRow>
                                                                                        </TableHead>
                                                                                        <TableBody>
                                                                                            {projects[outcome._id]?.list?.length > 0 ? (
                                                                                                projects[outcome._id].list.map((project, index) => (
                                                                                                    <TableRow key={index}>
                                                                                                        <TableCell>{index + 1}</TableCell>
                                                                                                        <TableCell>{project.name}</TableCell>
                                                                                                        <TableCell>
                                                                                                            {project.status === 'approved' 
                                                                                                                ? project.approvedCredits 
                                                                                                                : project.credit}
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                            <Chip 
                                                                                                                label={getStatusLabel(project.status)} 
                                                                                                                color={getStatusColor(project.status)}
                                                                                                                size="small"
                                                                                                            />
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                            {project.status === 'approved' ? (
                                                                                                                <Box>
                                                                                                                    <Typography variant="body2">
                                                                                                                        By: {project.assessedBy || 'Teacher'}
                                                                                                                    </Typography>
                                                                                                                    {project.teacherComment && (
                                                                                                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                                                                                            "{project.teacherComment}"
                                                                                                                        </Typography>
                                                                                                                    )}
                                                                                                                </Box>
                                                                                                            ) : project.status === 'rejected' ? (
                                                                                                                <Box>
                                                                                                                    <Typography variant="body2">
                                                                                                                        By: {project.assessedBy || 'Teacher'}
                                                                                                                    </Typography>
                                                                                                                    {project.teacherComment && (
                                                                                                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                                                                                            "{project.teacherComment}"
                                                                                                                        </Typography>
                                                                                                                    )}
                                                                                                                </Box>
                                                                                                            ) : (
                                                                                                                "Awaiting assessment"
                                                                                                            )}
                                                                                                        </TableCell>
                                                                                                        <TableCell>{project.date || "-"}</TableCell>
                                                                                                        <TableCell>
                                                                                                            {project.status === 'pending' && (
                                                                                                                <IconButton onClick={() => handleDeleteProject(outcome._id, index)}>
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
                                                                                            )}
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
            <Dialog open={openRequirements} onClose={() => setOpenRequirements(false)}>
                <DialogTitle>Requirements</DialogTitle>
                <DialogContent>
                    {selectedRequirements.length > 0 ? (
                        selectedRequirements.map((req, index) => (
                            <Typography key={index} sx={{ mt: 1 }}>• {req}</Typography>
                        ))
                    ) : (
                        "No requirements available."
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRequirements(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={6000} 
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentSubjects;