import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  TextField,
  CssBaseline,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import bgpic from "../../assets/designlogin.jpg";
import { LightPurpleButton } from "../../components/buttonStyles";
import { registerUser } from "../../redux/userRelated/userHandle";
import styled from "styled-components";
import Popup from "../../components/Popup";

const defaultTheme = createTheme();

const TeacherRegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state for user authentication
  const { status, response } = useSelector((state) => state.user);

  // Local states
  const [toggle, setToggle] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [teacherNameError, setTeacherNameError] = useState(false);

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    const name = event.target.teacherName.value.trim();
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    if (!name || !email || !password) {
      if (!name) setTeacherNameError(true);
      if (!email) setEmailError(true);
      if (!password) setPasswordError(true);
      return;
    }

    const fields = { name, email, password };

    setLoader(true);
    // Fix: Add "Teacher" role parameter to registerUser function call
    dispatch(registerUser(fields, "Teacher"));
  };

  // Handle input changes and reset errors
  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === "email") setEmailError(false);
    if (name === "password") setPasswordError(false);
    if (name === "teacherName") setTeacherNameError(false);
  };

  // Handle navigation and popup messages
  useEffect(() => {
    if (status === "success") {
      setLoader(false);
      setMessage("Registration successful! Redirecting to login...");
      setShowPopup(true);

      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate("/Teacherlogin");
      }, 2000);
    } else if (status === "failed") {
      setLoader(false);
      setMessage(response || "Registration failed. Please try again.");
      setShowPopup(true);
    }
  }, [status, response, navigate]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, color: "#2c2143" }}>
              Teacher Registration
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Register as a teacher to manage your school system.
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 2 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="teacherName"
                label="Enter your name"
                name="teacherName"
                autoComplete="name"
                autoFocus
                error={teacherNameError}
                helperText={teacherNameError && "Name is required"}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Enter your email"
                name="email"
                autoComplete="email"
                error={emailError}
                helperText={emailError && "Email is required"}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={toggle ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                error={passwordError}
                helperText={passwordError && "Password is required"}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setToggle(!toggle)}>
                        {toggle ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Grid
                container
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
              </Grid>
              <LightPurpleButton
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {loader ? <CircularProgress size={24} color="inherit" /> : "Register"}
              </LightPurpleButton>
              <Grid container>
                <Grid>
                  Already have an account?
                </Grid>
                <Grid item sx={{ ml: 2 }}>
                  <StyledLink to="/Teacherlogin">Log in</StyledLink>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${bgpic})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </Grid>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </ThemeProvider>
  );
};

export default TeacherRegisterPage;

const StyledLink = styled(Link)`
  margin-top: 9px;
  text-decoration: none;
  color: #7f56da;
`;