import { Container, Grid, Paper } from "@mui/material";
import styled from "styled-components";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getSubjectList } from "../../redux/subjectrelated/subjectHandle";

const StudentHomePage = () => {
    const dispatch = useDispatch();
    const subjectsList = useSelector((state) => state.subject?.subjects || []);

    useEffect(() => {
        dispatch(getSubjectList());
    }, [dispatch]);

    console.log("Fetched subjectsList:", subjectsList); // Debugging log

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={4}>
                    <StyledPaper>
                        <Title>Total Subjects</Title>
                        <Data start={0} end={subjectsList?.length || 0} duration={2.5} />
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
