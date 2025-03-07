import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Box,
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
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getAllStudents } from "../../../redux/studentRelated/studentHandle";
import { registerUser } from "../../../redux/userRelated/userHandle";
import Popup from "../../../components/Popup";
import SearchBar from "../../../components/SearchBar";

const ShowStudents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { studentsList, loading } = useSelector((state) => state.student);
  const { currentUser } = useSelector((state) => state.user);

  // State for filtered students and search term
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Initial load and filtering
  useEffect(() => {
    if (!loading) {
      dispatch(getAllStudents());
    }
  }, [dispatch, loading]);

  // Update filtered students when studentsList changes
  useEffect(() => {
    if (studentsList) {
      const filtered = studentsList.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [studentsList, searchTerm]);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  // Extract name from email if no name is stored in DB
  const formatNameFromEmail = (email) => {
    if (!email) return "Unknown";
    const namePart = email.split("@")[0];
    const words = namePart.split(".");
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Open modal
  const handleOpen = () => setOpen(true);

  // Close modal
  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setPassword("");
  };

  // Handle search change
  const handleSearchChange = (term) => {
    setSearchTerm(term);
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
        dispatch(getAllStudents());
      })
      .catch(() => {
        setMessage("Failed to add student. Please try again.");
        setShowPopup(true);
      });
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <SearchBar 
          onSearchChange={handleSearchChange}
          placeholder="Search students by name or email"
        />
      </Box>

      <Paper>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(filteredStudents) && filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell
                        sx={{ 
                          cursor: "pointer", 
                          color: "blue",
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => 
                          navigate(`/Teacher/dashboard/students/${student._id}/subjects`)
                        }
                      >
                        {student.name
                          ? student.name
                          : formatNameFromEmail(student.email)}
                      </TableCell>

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

      {/* Floating Add Student Button */}
      <Fab color="primary" sx={styles.fabButton} onClick={handleOpen}>
        <AddIcon />
      </Fab>

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
      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </Box>
  );
};

// Floating Button Styles
const styles = {
  fabButton: {
    position: "fixed",
    bottom: 20,
    right: 20,
  },
};

export default ShowStudents;