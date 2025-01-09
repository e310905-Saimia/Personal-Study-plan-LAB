import React, { useEffect, useState } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Switch, Button } from '@mui/material';
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';


const TeacherHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails } = useSelector((state) => state.sclass);

    const classID = currentUser.teachSclass?._id;
    const subjectID = currentUser.teachSubject?._id;

    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (subjectID) dispatch(getSubjectDetails(subjectID, "Subject"));
        if (classID) dispatch(getClassStudents(classID));
    }, [dispatch, subjectID, classID]);

    useEffect(() => {
        if (Array.isArray(subjectDetails)) {
            setRows(subjectDetails);
        }
    }, [subjectDetails]);

    const addRow = () => {
        const newRow = {
            id: Date.now(),
            isCompulsory: false,
            topic: '',
            learningOutcome: '',
            additionalInfo: '',
            credits: '',
            project: '',
            confirmedBy: ''
        };
        setRows([...rows, newRow]);
    };

    const deleteRow = (id) => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleChange = (id, field, value) => {
        setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#008000', borderRadius: '12px' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Compulsory or Not</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Topic</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Learning Outcome</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Learning Outcome Information</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Credits</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Project</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Confirmed By</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(rows) && rows.map((row) => (
                                <TableRow key={row.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                                    <TableCell>
                                        <Switch
                                            checked={row.isCompulsory}
                                            onChange={(e) => handleChange(row.id, 'isCompulsory', e.target.checked)}
                                        />
                                        {row.isCompulsory ? 'Compulsory' : 'Not Compulsory'}
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={row.topic}
                                            onChange={(e) => handleChange(row.id, 'topic', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={row.learningOutcome}
                                            onChange={(e) => handleChange(row.id, 'learningOutcome', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={row.additionalInfo}
                                            onChange={(e) => handleChange(row.id, 'additionalInfo', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={row.credits}
                                            onChange={(e) => handleChange(row.id, 'credits', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={row.project}
                                            onChange={(e) => handleChange(row.id, 'project', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={row.confirmedBy}
                                            onChange={(e) => handleChange(row.id, 'confirmedBy', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={row.project}
                                            onChange={(e) => handleChange(row.id, 'Date', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => deleteRow(row.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    variant="contained"
                    sx={{ mt: 2, backgroundColor: '#00416d', color: '#fff' }}
                    onClick={addRow}
                >
                    Add New Row
                </Button>
            </Paper>
        </Container>
    );
};

export default TeacherHomePage;
