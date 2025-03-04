import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getStudentSubjects, updateProjectAssessment } from "../../../redux/studentRelated/studentHandle";
import {
    Paper, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Accordion, AccordionSummary, AccordionDetails, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { ExpandMore, Visibility, Check } from "@mui/icons-material";

const StudentProgress = () => {
    const { studentID } = useParams();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.student);
    const [subjects, setSubjects] = useState([]);
    const [openRequirements, setOpenRequirements] = useState(false);
    const [selectedRequirements, setSelectedRequirements] = useState([]);
    const [approvalData, setApprovalData] = useState({}); // Holds credit approvals
    const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dispatch(getStudentSubjects(studentID));
                setSubjects(data || []);
            } catch (error) {
                console.error("Error fetching student subjects:", error);
            }
        };
        
        fetchData();
    }, [dispatch, studentID, refreshKey]);

    // Open Requirements Dialog
    const handleOpenRequirements = (requirements) => {
        setSelectedRequirements(requirements || []);
        setOpenRequirements(true);
    };

    // Handle Credit Approval Change
    const handleApprovalChange = (outcomeID, projectID, field, value) => {
        setApprovalData((prev) => ({
            ...prev,
            [`${outcomeID}-${projectID}`]: {
                ...(prev[`${outcomeID}-${projectID}`] || {}),
                [field]: value,
            },
        }));
    };

    // Approve Project
    const handleApproveProject = async (subjectID, outcomeID, projectID) => {
        const dataKey = `${outcomeID}-${projectID}`;
        const { approvedCredit, assessedBy } = approvalData[dataKey] || {};
        
        if (!approvedCredit || !assessedBy) {
            alert("Please enter credit and assessed by!");
            return;
        }

        try {
            await dispatch(updateProjectAssessment(
                studentID,
                subjectID,
                outcomeID,
                projectID,
                { 
                    approvedCredit,
                    assessedBy,
                    status: 'Approved',
                    assessment: 'Project meets requirements'
                }
            ));
            
            alert("Project approved successfully!");
            // Trigger a refresh of the data
            setRefreshKey(old => old + 1);
        } catch (error) {
            alert(`Error approving project: ${error.message}`);
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Student Progress
            </Typography>
            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Subject</TableCell>
                                    <TableCell align="right">Credits</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subjects.length > 0 ? (
                                    subjects.map((subject) => (
                                        <React.Fragment key={subject.subjectId}>
                                            <TableRow>
                                                <TableCell colSpan={2}>
                                                    <Accordion>
                                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                                            <Typography variant="h6">{subject.name}</Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            {subject.outcomes.map((outcome) => (
                                                                <Accordion key={outcome.outcomeId} sx={{ mb: 1 }}>
                                                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                                                        <Typography>{outcome.topic}</Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails>
                                                                        {/* View Requirements */}
                                                                        <Button
                                                                            variant="outlined"
                                                                            startIcon={<Visibility />}
                                                                            sx={{ mb: 2 }}
                                                                            onClick={() => handleOpenRequirements(outcome.requirements)}
                                                                        >
                                                                            View Requirements
                                                                        </Button>

                                                                        {/* Project Submissions */}
                                                                        <TableContainer>
                                                                            <Table>
                                                                                <TableHead>
                                                                                    <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                                                                                        <TableCell>SN</TableCell>
                                                                                        <TableCell>Project Name</TableCell>
                                                                                        <TableCell>Requested Credit</TableCell>
                                                                                        <TableCell>Assessed By</TableCell>
                                                                                        <TableCell>Approved Credit</TableCell>
                                                                                        <TableCell>Status</TableCell>
                                                                                        <TableCell>Action</TableCell>
                                                                                    </TableRow>
                                                                                </TableHead>
                                                                                <TableBody>
                                                                                    {outcome.projects && outcome.projects.length > 0 ? (
                                                                                        outcome.projects.map((project, index) => (
                                                                                            <TableRow key={project._id}>
                                                                                                <TableCell>{index + 1}</TableCell>
                                                                                                <TableCell>{project.name}</TableCell>
                                                                                                <TableCell>{project.requestedCredit}</TableCell>
                                                                                                <TableCell>
                                                                                                    {project.status === 'Pending' ? (
                                                                                                        <TextField
                                                                                                            label="Assessed By"
                                                                                                            variant="outlined"
                                                                                                            size="small"
                                                                                                            value={approvalData[`${outcome.outcomeId}-${project._id}`]?.assessedBy || ""}
                                                                                                            onChange={(e) => handleApprovalChange(
                                                                                                                outcome.outcomeId,
                                                                                                                project._id,
                                                                                                                "assessedBy",
                                                                                                                e.target.value
                                                                                                            )}
                                                                                                        />
                                                                                                    ) : (
                                                                                                        project.assessedBy || "N/A"
                                                                                                    )}
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                    {project.status === 'Pending' ? (
                                                                                                        <TextField
                                                                                                            label="Approved Credit"
                                                                                                            type="number"
                                                                                                            variant="outlined"
                                                                                                            size="small"
                                                                                                            value={approvalData[`${outcome.outcomeId}-${project._id}`]?.approvedCredit || ""}
                                                                                                            onChange={(e) => handleApprovalChange(
                                                                                                                outcome.outcomeId,
                                                                                                                project._id,
                                                                                                                "approvedCredit",
                                                                                                                e.target.value
                                                                                                            )}
                                                                                                        />
                                                                                                    ) : (
                                                                                                        project.approvedCredit || "N/A"
                                                                                                    )}
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                    {project.status}
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                    {project.status === 'Pending' && (
                                                                                                        <IconButton 
                                                                                                            color="success" 
                                                                                                            onClick={() => handleApproveProject(
                                                                                                                subject.subjectId, 
                                                                                                                outcome.outcomeId, 
                                                                                                                project._id
                                                                                                            )}
                                                                                                        >
                                                                                                            <Check />
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
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            ))}
                                                        </AccordionDetails>
                                                    </Accordion>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            No subjects found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Requirements Pop-up Dialog */}
            <Dialog open={openRequirements} onClose={() => setOpenRequirements(false)}>
                <DialogTitle>Requirements</DialogTitle>
                <DialogContent>
                    {selectedRequirements.length > 0
                        ? selectedRequirements.map((req, index) => <Typography key={index}>• {req}</Typography>)
                        : "No requirements available."}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRequirements(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentProgress;