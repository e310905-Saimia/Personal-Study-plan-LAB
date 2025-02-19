import { Container, Grid, Paper, Typography } from "@mui/material";
import styled from "styled-components";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

// ✅ Recharts imports for graph
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getSubjectList } from "../../redux/subjectrelated/subjectHandle";
import { getAllStudents } from "../../redux/studentRelated/studentHandle";

const TeacherHomePage = () => {
  const dispatch = useDispatch();
  const studentsList = useSelector((state) => state.student?.studentsList || []); 
  const subjectsList = useSelector((state) => state.subject?.subjects || []);

  const { currentUser } = useSelector((state) => state.user);
  const teacherID = currentUser?._id || "";

  useEffect(() => {
    if (teacherID) {
      dispatch(getAllStudents(teacherID)); 
      dispatch(getSubjectList(teacherID)); 
    }
  }, [teacherID, dispatch]);

  const numberOfStudents = studentsList?.length || 0;
  const numberOfSubjects = subjectsList?.length || 0;

  // ✅ Chart data
  const data = [
    { name: "Students", count: numberOfStudents },
    { name: "Subjects", count: numberOfSubjects },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* ✅ Summary Cards */}
        <Grid item xs={12} md={4} lg={4}>
          <StyledPaper>
            <Title>Total Students</Title>
            <Data start={0} end={numberOfStudents} duration={2.5} />
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
          <StyledPaper>
            <Title>Total Subjects</Title>
            <Data start={0} end={numberOfSubjects} duration={5} />
          </StyledPaper>
        </Grid>

        {/* ✅ Bar Chart */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" align="center">
              Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        
      </Grid>
    </Container>
  );
};

// ✅ Styled Components
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
  font-size: calc(1.3rem + 0.6vw);
  color: green;
`;

export default TeacherHomePage;

