import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const ErrorPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        bgcolor: "#f4f4f4",
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "5rem", fontWeight: "bold", color: "#333" }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ color: "#555", mb: 2 }}>
        Oops! Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: "#777", mb: 3 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/"
        sx={{ textTransform: "none", fontSize: "1rem", padding: "10px 20px" }}
      >
        Go Back to Home
      </Button>
    </Box>
  );
};

export default ErrorPage;
