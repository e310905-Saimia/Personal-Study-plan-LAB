import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Paper,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { getAllStudents } from "../../../redux/studentRelated/studentHandle";
import { registerUser } from "../../../redux/userRelated/userHandle";
import Popup from "../../../components/Popup";

const ShowStudents = () => {
  const dispatch = useDispatch();
  const { studentsList, loading } = useSelector((state) => state.student);
  const { currentUser } = useSelector((state) => state.user);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllStudents(currentUser._id));
    }
  }, [currentUser?._id, dispatch]);

  // Extract name from email
  const formatNameFromEmail = (email) => {
    if (!email) return "Unknown";
    const namePart = email.split("@")[0]; // Extract part before '@'
    const words = namePart.split("."); // Split by '.'
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  // Open modal
  const handleOpen = () => setOpen(true);

  // Close modal
  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setPassword("");
  };

  // Handle Add Student
  const handleAddStudent = () => {
    if (!email || !password) {
      setMessage("Please fill out both fields!");
      setShowPopup(true);
      return;
    }

    const studentData = {
      email,
      password,
      role: "Student",
      teacherID: currentUser._id,
    };

    dispatch(registerUser(studentData, "Student"))
      .then(() => {
        setMessage("Student added successfully!");
        setShowPopup(true);
        handleClose();
        dispatch(getAllStudents(currentUser._id)); // Refresh student list
      })
      .catch(() => {
        setMessage("Failed to add student. Please try again.");
        setShowPopup(true);
      });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <IconButton color="primary" onClick={handleOpen} title="Add New Student">
          <PersonAddAlt1Icon />
        </IconButton>
      </Box>

      <Paper>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(studentsList) && studentsList.length > 0 ? (
                  studentsList.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>{student.name ? student.name : formatNameFromEmail(student.email)}</TableCell>
                      <TableCell>{student.email}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal for adding new student */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddStudent} color="primary">
            Add Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popup for success or failure messages */}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Box>
  );
};

export default ShowStudents;
