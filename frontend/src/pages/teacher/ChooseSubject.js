import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, TableBody, TableContainer, TableHead, Typography, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects } from '../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../redux/teacherRelated/teacherHandle';
import { GreenButton } from '../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const ChooseSubject = ({ situation }) => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [teacherID, setTeacherID] = useState('');
    const [loader, setLoader] = useState(false);

    const { subjectsList, loading } = useSelector((state) => state.sclass);

    useEffect(() => {
        if (situation === 'Teacher') {
            setTeacherID(params.teacherID);
            dispatch(getTeacherFreeClassSubjects(params.classID));
        }
    }, [dispatch, params, situation]);

    if (loading) return <div>Loading...</div>;

    const updateSubjectHandler = (teacherId, teachSubject) => {
        setLoader(true);
        dispatch(updateTeachSubject(teacherId, teachSubject));
        navigate('/Teacher/teachers');
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom>
                Choose a Subject
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>#</StyledTableCell>
                            <StyledTableCell align="center">Subject Name</StyledTableCell>
                            <StyledTableCell align="center">Subject Code</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {subjectsList.map((subject, index) => (
                            <StyledTableRow key={subject._id}>
                                <StyledTableCell>{index + 1}</StyledTableCell>
                                <StyledTableCell align="center">{subject.subName}</StyledTableCell>
                                <StyledTableCell align="center">{subject.subCode}</StyledTableCell>
                                <StyledTableCell align="center">
                                    <GreenButton
                                        variant="contained"
                                        onClick={() => updateSubjectHandler(teacherID, subject._id)}
                                        disabled={loader}
                                    >
                                        {loader ? 'Loading...' : 'Choose'}
                                    </GreenButton>
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default ChooseSubject;
