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
    const { subjects, loading } = useSelector((state) => state.subject);
    const [openRequirements, setOpenRequirements] = useState(false);
    const [selectedRequirements, setSelectedRequirements] = useState([]);
    const [approvalData, setApprovalData] = useState({}); // Holds credit approvals

    useEffect(() => {
        dispatch(getStudentSubjects(studentID));
    }, [dispatch, studentID]);

    // ✅ Open Requirements Dialog
    const handleOpenRequirements = (requirements) => {
        setSelectedRequirements(requirements || []);
        setOpenRequirements(true);
    };

    // ✅ Handle Credit Approval Change
    const handleApprovalChange = (outcomeID, projectIndex, field, value) => {
        setApprovalData((prev) => ({
            ...prev,
            [outcomeID]: {
                ...(prev[outcomeID] || {}),
                [projectIndex]: {
                    ...(prev[outcomeID]?.[projectIndex] || {}),
                    [field]: value,
                },
            },
        }));
    };

    // ✅ Approve Project
    const handleApproveProject = (subjectID, outcomeID, projectIndex) => {
        const { credit, assessedBy } = approvalData[outcomeID]?.[projectIndex] || {};
        if (!credit || !assessedBy) {
            alert("Please enter credit and assessed by!");
            return;
        }

        dispatch(updateProjectAssessment(subjectID, outcomeID, projectIndex, { credit, assessedBy }))
            .then(() => {
                alert("Project Approved!");
                dispatch(getStudentSubjects(studentID)); // Refresh data
            });
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
                                        <React.Fragment key={subject._id}>
                                            <TableRow>
                                                <TableCell colSpan={2}>
                                                    <Accordion>
                                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                                            <Typography variant="h6">{subject.name}</Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            {subject.outcomes.map((outcome) => (
                                                                <Accordion key={outcome._id} sx={{ mb: 1 }}>
                                                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                                                        <Typography>{outcome.topic}</Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails>
                                                                        {/* ✅ View Requirements */}
                                                                        <Button
                                                                            variant="outlined"
                                                                            startIcon={<Visibility />}
                                                                            sx={{ mb: 2 }}
                                                                            onClick={() => handleOpenRequirements(outcome.requirements)}
                                                                        >
                                                                            View Requirements
                                                                        </Button>

                                                                        {/* ✅ Project Submissions */}
                                                                        <TableContainer>
                                                                            <Table>
                                                                                <TableHead>
                                                                                    <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                                                                                        <TableCell>SN</TableCell>
                                                                                        <TableCell>Project Name</TableCell>
                                                                                        <TableCell>Requested Credit</TableCell>
                                                                                        <TableCell>Assessed By</TableCell>
                                                                                        <TableCell>Approved Credit</TableCell>
                                                                                        <TableCell>Action</TableCell>
                                                                                    </TableRow>
                                                                                </TableHead>
                                                                                <TableBody>
                                                                                    {outcome.projects?.length > 0 ? (
                                                                                        outcome.projects.map((project, index) => (
                                                                                            <TableRow key={index}>
                                                                                                <TableCell>{index + 1}</TableCell>
                                                                                                <TableCell>{project.name}</TableCell>
                                                                                                <TableCell>{project.credit}</TableCell>
                                                                                                <TableCell>
                                                                                                    <TextField
                                                                                                        label="Assessed By"
                                                                                                        variant="outlined"
                                                                                                        size="small"
                                                                                                        value={approvalData[outcome._id]?.[index]?.assessedBy || ""}
                                                                                                        onChange={(e) => handleApprovalChange(outcome._id, index, "assessedBy", e.target.value)}
                                                                                                    />
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                    <TextField
                                                                                                        label="Approved Credit"
                                                                                                        type="number"
                                                                                                        variant="outlined"
                                                                                                        size="small"
                                                                                                        value={approvalData[outcome._id]?.[index]?.credit || ""}
                                                                                                        onChange={(e) => handleApprovalChange(outcome._id, index, "credit", e.target.value)}
                                                                                                    />
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                    <IconButton color="success" onClick={() => handleApproveProject(subject._id, outcome._id, index)}>
                                                                                                        <Check />
                                                                                                    </IconButton>
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                        ))
                                                                                    ) : (
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={6} align="center">
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

            {/* ✅ Requirements Pop-up Dialog */}
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
