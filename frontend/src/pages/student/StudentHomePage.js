import { Container, Grid, Paper } from "@mui/material";
import styled from "styled-components";
import CountUp from "react-countup";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";

const StudentHomePage = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [studentData, setStudentData] = useState([]);
    const [totalApprovedCredits, setTotalApprovedCredits] = useState(0);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const studentID = currentUser?._id || currentUser?.student?._id;
                if (studentID) {
                    console.log("Fetching data for student ID:", studentID);
                    const response = await axios.get(
                        `http://localhost:5000/api/students/${studentID}/subjects`
                    );
                    console.log("Student data received:", response.data);
                    setStudentData(response.data);
                    
                    // Calculate total approved credits
                    let credits = 0;
                    response.data.forEach(subject => {
                        subject.outcomes?.forEach(outcome => {
                            const approvedProjects = outcome.projects?.filter(
                                p => p.status && p.status.toLowerCase() === "approved"
                            ) || [];
                            
                            approvedProjects.forEach(project => {
                                const credit = project.approvedCredit !== undefined
                                    ? Number(project.approvedCredit)
                                    : Number(project.requestedCredit);
                                
                                credits += !isNaN(credit) ? credit : 0;
                            });
                        });
                    });
                    
                    setTotalApprovedCredits(parseFloat(credits.toFixed(2)));
                }
            } catch (error) {
                console.error("Error fetching student subjects:", error);
            }
        };

        fetchStudentData();
    }, [currentUser]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <Title>Total Subjects</Title>
                        <Data start={0} end={studentData?.length || 0} duration={2.5} />
                    </StyledPaper>
                </Grid>
                
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <Title>Total Approved Credits</Title>
                        <Data start={0} end={totalApprovedCredits} duration={2.5} decimals={1} />
                    </StyledPaper>
                </Grid>
                
                
            </Grid>
        </Container>
    );
};

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

export default StudentHomePage;