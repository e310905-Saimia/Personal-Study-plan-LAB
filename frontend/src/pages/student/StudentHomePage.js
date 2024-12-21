import React, { useEffect } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Switch, TextField } from '@mui/material';
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#2E7D32' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Compulsory or Not</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Topic</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Learning Outcome</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Learning Outcome Information</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Credits</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Project</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Confirmed By</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjectsList && subjectsList.map((subject) => (
              <TableRow key={subject._id}>
                <TableCell>
                  <Switch defaultChecked={subject.isCompulsory} />
                  {subject.isCompulsory ? 'Compulsory' : 'Not Compulsory'}
                </TableCell>
                <TableCell>
                  <TextField defaultValue={subject.topic} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <TextField defaultValue={subject.learningOutcome} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <TextField defaultValue={subject.additionalInfo} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <TextField defaultValue={subject.credits} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <TextField defaultValue={subject.project} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <TextField defaultValue={subject.confirmedBy} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="success" sx={{ mr: 1 }}>Edit</Button>
                  <Button variant="contained" color="error">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="contained" color="primary" sx={{ mt: 2 }}>Add New Row</Button>
    </Container>
  );
};

export default StudentHomePage;
