import React, { useEffect } from 'react';
import {  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, TextField, AccordionDetails } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';

const StudentHomePage = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { subjectsList } = useSelector((state) => state.sclass);

  const classID = currentUser.sclassName._id;

  useEffect(() => {
    dispatch(getUserDetails(currentUser._id, "Student"));
    dispatch(getSubjectList(classID, "ClassSubjects"));
  }, [dispatch, currentUser._id, classID]);

  return (
   

     
        <AccordionDetails>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#1976d2' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Compulsory or Not</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Topic</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Learning Outcome</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Learning Outcome Information</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Credits</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Project</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Confirmed By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjectsList && subjectsList.map((subject) => (
                  <TableRow key={subject._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>
                      <Switch checked={subject.isCompulsory} disabled />
                      {subject.isCompulsory ? 'Compulsory' : 'Not Compulsory'}
                    </TableCell>
                    <TableCell>
                      <TextField defaultValue={subject.topic} variant="outlined" size="small" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField defaultValue={subject.learningOutcome} variant="outlined" size="small" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField defaultValue={subject.additionalInfo} variant="outlined" size="small" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField defaultValue={subject.credits} variant="outlined" size="small" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField defaultValue={subject.project} variant="outlined" size="small" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField defaultValue={subject.confirmedBy} variant="outlined" size="small" fullWidth />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
  );
};

export default StudentHomePage;
