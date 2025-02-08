import { Container, Grid, Paper } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";

import styled from 'styled-components';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

// ✅ FIXED: Import unique action names and corrected functions
import { fetchClasses as fetchSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';

const TeacherHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { classes } = useSelector((state) => state.sclass); // ✅ Corrected property name to `classes`
    const { teachersList } = useSelector((state) => state.teacher);

    const { currentUser } = useSelector(state => state.user);
    const teacherID = currentUser?._id || ""; // ✅ Added null-safe check for `currentUser`

    // ✅ Corrected dispatch functions and ensured unique actions
    useEffect(() => {
        if (teacherID) {
            dispatch(getAllStudents(teacherID));   // Fetch students
            dispatch(fetchSclasses(teacherID));   // Fetch classes
            dispatch(getAllTeachers(teacherID));  // Fetch teachers
        }
    }, [teacherID, dispatch]);

    const numberOfStudents = studentsList?.length || 0; // ✅ Added fallback for length
    const numberOfClasses = classes?.length || 0; // ✅ Updated to match `classes` from state
    const numberOfTeachers = teachersList?.length || 0; // ✅ Added fallback for length

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <img src={Students} alt="Students" />
                        <Title>Total Students</Title>
                        <Data start={0} end={numberOfStudents} duration={2.5} />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <img src={Classes} alt="Classes" />
                        <Title>Total Classes</Title>
                        <Data start={0} end={numberOfClasses} duration={5} />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <img src={Teachers} alt="Teachers" />
                        <Title>Total Teachers</Title>
                        <Data start={0} end={numberOfTeachers} duration={2.5} />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <SeeNotice />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

// Styled Components
const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

export default TeacherHomePage;
