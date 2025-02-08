import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { AccountCircle, School } from "@mui/icons-material";
import styled from "styled-components";
import { useSelector } from "react-redux";
import Popup from "../components/Popup";

const ChooseUser = () => {
  const navigate = useNavigate();
  const { status, currentUser, currentRole } = useSelector(
    (state) => state.user
  );

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Teacher") {
      navigate("/Teacherlogin");
    } else if (user === "Student") {
      navigate("/Studentlogin");
    }
  };

  useEffect(() => {
    if (status === "success" || currentUser !== null) {
      if (currentRole === "Teacher") {
        navigate("/Teacher/dashboard");
      } else if (currentRole === "Student") {
        navigate("/Student/dashboard");
      }
    } else if (status === "error") {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledContainer>
      <Container>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <div onClick={() => navigateHandler("Teacher")}>
              <StyledPaper elevation={3}>
                <Box mb={2}>
                  <AccountCircle fontSize="large" />
                </Box>
                <StyledTypography>Teacher</StyledTypography>
                Login as a teacher to create courses and track student progress.
              </StyledPaper>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <div onClick={() => navigateHandler("Student")}>
              <StyledPaper elevation={3}>
                <Box mb={2}>
                  <School fontSize="large" />
                </Box>
                <StyledTypography>Student</StyledTypography>
                Login as a student to explore course materials and assignments.
              </StyledPaper>
            </div>
          </Grid>
        </Grid>
      </Container>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
      >
        <CircularProgress color="inherit" />
        Please Wait
      </Backdrop>
      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  background: linear-gradient(to bottom, #411d70, #19118b);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const StyledPaper = styled(Paper)`
  padding: 20px;
  text-align: center;
  background-color: #1f1f38;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;

  &:hover {
    background-color: #2c2c6c;
    color: white;
  }
`;

const StyledTypography = styled.h2`
  margin-bottom: 10px;
`;

export default ChooseUser;
