import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Backdrop,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Person, School } from "@mui/icons-material";
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
    <Box
      sx={{
        background: "linear-gradient(135deg,rgba(38, 118, 171, 0.99) 0%, #1e0a5c 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: "center",
            mb: 6,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "white",
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Select your role to continue
          </Typography>
          
        </Box>

        <Grid
          container
          spacing={4}
          justifyContent="center"
          sx={{ maxWidth: "900px", mx: "auto" }}
        >
          <Grid item xs={12} sm={6}>
            <Card
              onClick={() => navigateHandler("Teacher")}
              sx={{
                height: "100%",
                borderRadius: "16px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                overflow: "hidden",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
                  "& .icon-wrapper": {
                    background: "#4a26ab",
                    transform: "scale(1.1)",
                  },
                },
              }}
            >
              <Box
                className="icon-wrapper"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#5e35b1",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  margin: "30px auto 10px",
                  transition: "all 0.3s ease",
                }}
              >
                <Person sx={{ fontSize: 42, color: "white" }} />
              </Box>
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{ fontWeight: 600, mb: 2, color: "#333" }}
                >
                  Teacher
                </Typography>
                
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card
              onClick={() => navigateHandler("Student")}
              sx={{
                height: "100%",
                borderRadius: "16px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                overflow: "hidden",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
                  "& .icon-wrapper": {
                    background: "#4a26ab",
                    transform: "scale(1.1)",
                  },
                },
              }}
            >
              <Box
                className="icon-wrapper"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#5e35b1",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  margin: "30px auto 10px",
                  transition: "all 0.3s ease",
                }}
              >
                <School sx={{ fontSize: 42, color: "white" }} />
              </Box>
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{ fontWeight: 600, mb: 2, color: "#333" }}
                >
                  Student
                </Typography>
                
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>Please Wait</Typography>
        </Box>
      </Backdrop>
      
      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </Box>
  );
};

export default ChooseUser;