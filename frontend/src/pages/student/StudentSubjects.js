import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSubjectList } from "../../redux/subjectrelated/subjectHandle";
import {
    Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Collapse, IconButton
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const { subjects = [], loading } = useSelector((state) => state.subject);
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [expandedOutcome, setExpandedOutcome] = useState(null);

    useEffect(() => {
        dispatch(getSubjectList());
    }, [dispatch]);

    const toggleExpandSubject = (subjectID) => {
        setExpandedSubject(expandedSubject === subjectID ? null : subjectID);
    };

    const toggleExpandOutcome = (outcomeID) => {
        setExpandedOutcome(expandedOutcome === outcomeID ? null : outcomeID);
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Student Subjects
            </Typography>
            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell> </TableCell> {/* Expand Icon */}
                                    <TableCell>Subject</TableCell>
                                    <TableCell align="right">Credits</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subjects.length > 0 ? (
                                    subjects.map((subject) => (
                                        <React.Fragment key={subject._id}>
                                            {/* ✅ Subject Row */}
                                            <TableRow>
                                                <TableCell>
                                                    <IconButton onClick={() => toggleExpandSubject(subject._id)}>
                                                        {expandedSubject === subject._id ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>{subject.name}</TableCell>
                                                <TableCell align="right">{subject.credits}</TableCell>
                                            </TableRow>

                                            {/* ✅ Collapsible Section for Outcomes */}
                                            <TableRow>
                                                <TableCell colSpan={3} sx={{ padding: 0, border: "none" }}>
                                                    <Collapse in={expandedSubject === subject._id} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 2, padding: 2, background: "#f5f5f5", borderRadius: 2 }}>
                                                            <Typography variant="subtitle1">Outcomes:</Typography>
                                                            <TableContainer>
                                                                <Table>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell> </TableCell>
                                                                            <TableCell>Topic</TableCell>
                                                                            <TableCell>Project</TableCell>
                                                                            <TableCell align="right">Credits</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {subject.outcomes.length > 0 ? (
                                                                            subject.outcomes.map((outcome) => (
                                                                                <React.Fragment key={outcome._id}>
                                                                                    {/* ✅ Outcome Row */}
                                                                                    <TableRow sx={{ backgroundColor: "#E0E0E0", cursor: "pointer" }} onClick={() => toggleExpandOutcome(outcome._id)}>
                                                                                        <TableCell>
                                                                                            <IconButton>
                                                                                                {expandedOutcome === outcome._id ? <ExpandLess /> : <ExpandMore />}
                                                                                            </IconButton>
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ textDecoration: "underline", color: "blue" }}>
                                                                                            {outcome.topic}
                                                                                        </TableCell>
                                                                                        <TableCell>{outcome.project}</TableCell>
                                                                                        <TableCell align="right">{outcome.credits}</TableCell>
                                                                                    </TableRow>

                                                                                    {/* ✅ Collapsible Subsection for Assessment Details */}
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={4} sx={{ padding: 0, border: "none" }}>
                                                                                            <Collapse in={expandedOutcome === outcome._id} timeout="auto" unmountOnExit>
                                                                                                <Box sx={{ margin: 2, padding: 2, background: "#f5f5f5", borderRadius: 2 }}>
                                                                                                    <Typography variant="subtitle2">Assessment Details</Typography>
                                                                                                    <TableContainer>
                                                                                                        <Table>
                                                                                                            <TableHead>
                                                                                                                <TableRow>
                                                                                                                    <TableCell>Name</TableCell>
                                                                                                                    <TableCell>Credit</TableCell>
                                                                                                                    <TableCell>Assessed By</TableCell>
                                                                                                                    <TableCell>Date</TableCell>
                                                                                                                </TableRow>
                                                                                                            </TableHead>
                                                                                                            <TableBody>
                                                                                                                {outcome.assessments && outcome.assessments.length > 0 ? (
                                                                                                                    outcome.assessments.map((assessment, index) => (
                                                                                                                        <TableRow key={index}>
                                                                                                                            <TableCell>{assessment.name}</TableCell>
                                                                                                                            <TableCell>{assessment.credit}</TableCell>
                                                                                                                            <TableCell>{assessment.assessedBy}</TableCell>
                                                                                                                            <TableCell>{assessment.date}</TableCell>
                                                                                                                        </TableRow>
                                                                                                                    ))
                                                                                                                ) : (
                                                                                                                    <TableRow>
                                                                                                                        <TableCell colSpan={4} align="center">
                                                                                                                            No assessments available.
                                                                                                                        </TableCell>
                                                                                                                    </TableRow>
                                                                                                                )}
                                                                                                            </TableBody>
                                                                                                        </Table>
                                                                                                    </TableContainer>
                                                                                                </Box>
                                                                                            </Collapse>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                </React.Fragment>
                                                                            ))
                                                                        ) : (
                                                                            <TableRow>
                                                                                <TableCell colSpan={4} align="center">
                                                                                    No outcomes available.
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            No subjects available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default StudentSubjects;
