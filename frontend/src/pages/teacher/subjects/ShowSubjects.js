import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getSubjectList,
  updateSubject,
  deleteSubject,
  addOutcome,
} from "../../../redux/subjectrelated/subjectHandle";
import {
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Collapse,
  IconButton,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { uploadCSV } from "../../../redux/subjectrelated/subjectCSVHandle";




const ShowSubjects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjects = [], loading } = useSelector((state) => state.subject);

  useEffect(() => {
    dispatch(getSubjectList());
  }, [dispatch]);

  // useEffect(() => {
  //   if (!loading) {
  //     dispatch(getSubjectList());
  //   }
  // }, [dispatch, loading]);
  // ✅ State for Expanding Outcomes
  const [expandedSubject, setExpandedSubject] = useState(null);

  // ✅ Toggle Expansion
  const toggleExpand = (subjectID) => {
    setExpandedSubject(expandedSubject === subjectID ? null : subjectID);
  };

  // ✅ State for Editing Subjects
  const [openEdit, setOpenEdit] = useState(false);
  const [editSubject, setEditSubject] = useState({
    id: "",
    name: "",
    credits: "",
  });

  // ✅ State for Adding Outcomes
  const [openOutcome, setOpenOutcome] = useState(false);
  const [selectedSubjectID, setSelectedSubjectID] = useState(null);
  const [newOutcome, setNewOutcome] = useState({
    topic: "",
    project: "",
    credits: "",
  });


  
  // ✅ Open Edit Dialog
  const handleEdit = (subject) => {
    setEditSubject({
      id: subject._id,
      name: subject.name,
      credits: subject.credits,
    });
    setOpenEdit(true);
  };

  // ✅ Open Add Outcome Dialog
  const handleAddOutcome = (subjectID) => {
    setSelectedSubjectID(subjectID);
    setOpenOutcome(true);
  };

  // ✅ Close Dialogs
  const handleCloseEdit = () => setOpenEdit(false);
  const handleCloseOutcome = () => setOpenOutcome(false);

  // ✅ Submit Subject Edit
  const handleSubmitEdit = () => {
    dispatch(
      updateSubject(editSubject.id, {
        name: editSubject.name,
        credits: editSubject.credits,
      })
    );
    setOpenEdit(false);
  };

  // ✅ Submit New Outcome
  const handleSubmitOutcome = () => {
    if (!newOutcome.topic || !newOutcome.project || !newOutcome.credits) {
      alert("Please fill all fields!");
      return;
    }

    dispatch(addOutcome(selectedSubjectID, newOutcome)).then(() =>
      dispatch(getSubjectList())
    ); // Refresh subjects after adding an outcome
    setOpenOutcome(false);
    setNewOutcome({ topic: "", project: "", credits: "" }); // Reset input fields
  };

  // ✅ Handle Delete
  // const handleDelete = (subjectID) => {
  //   if (window.confirm("Are you sure you want to delete this subject?")) {
  //     dispatch(deleteSubject(subjectID)).then(() => dispatch(getSubjectList())); // Refresh subjects after delete
  //   }
  // };


  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/Teacher/subjects/add")}
            >
              Add Subject
            </Button>
            
          </Box> */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Button variant="contained" onClick={() => navigate("/Teacher/subjects/add")}>
                            Add Subject
                        </Button>
                    </Box>
          <Button
              variant="contained"
             
            >
              Import CSV
            </Button>

          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell> </TableCell> {/* Left-side toggle button */}
                    <TableCell>Topic</TableCell>
                    <TableCell align="right">Credits</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <React.Fragment key={subject._id}>
                        {/* ✅ Subject Row */}
                        <TableRow>
                          <TableCell>
                            <IconButton
                              onClick={() => toggleExpand(subject._id)}
                            >
                              {expandedSubject === subject._id ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell
                            sx={{
                              textDecoration: "underline",
                              color: "blue",
                              cursor: "pointer",
                            }}
                            onClick={() => toggleExpand(subject._id)}
                          >
                            {subject.name}
                          </TableCell>
                          <TableCell align="right">{subject.credits}</TableCell>
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              onClick={() => handleEdit(subject)}
                            >
                              EDIT
                            </Button>
                            &nbsp;
                            {/* <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleDelete(subject._id)}
                            >
                              DELETE
                            </Button> */}
                          </TableCell>
                        </TableRow>

                        {/* ✅ Collapsible Outcomes Section */}
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            sx={{ padding: 0, border: "none" }}
                          >
                            <Collapse
                              in={expandedSubject === subject._id}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box
                                sx={{
                                  margin: 2,
                                  padding: 2,
                                  background: "#f5f5f5",
                                  borderRadius: 2,
                                }}
                              >
                                <strong>Outcomes:</strong>
                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{ marginLeft: 2, marginBottom: 1 }}
                                  onClick={() => handleAddOutcome(subject._id)}
                                >
                                  Add Outcome
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{ marginLeft: 2, marginBottom: 1 }}
                                  onClick={() => handleAddOutcome(subject._id)}
                                >
                                    Import CSV
                                </Button>

                                <TableContainer>
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Topic</TableCell>
                                        <TableCell>Project</TableCell>
                                        <TableCell align="right">Credits</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {subject.outcomes.map(
                                        (outcome, index) => (
                                          <TableRow key={index}>
                                            <TableCell>
                                              {outcome.topic}
                                            </TableCell>
                                            <TableCell>
                                              {outcome.project}
                                            </TableCell>
                                            <TableCell>
                                              {outcome.credits}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                      
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No subjects found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* ✅ Edit Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Edit Subject</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject Name"
            margin="dense"
            value={editSubject.name}
            onChange={(e) =>
              setEditSubject({ ...editSubject, name: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Credits"
            margin="dense"
            type="number"
            value={editSubject.credits}
            onChange={(e) =>
              setEditSubject({ ...editSubject, credits: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleSubmitEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Add Outcome Dialog */}
      <Dialog open={openOutcome} onClose={handleCloseOutcome}>
        <DialogTitle>Add Outcome</DialogTitle>
        <DialogContent>
          <TextField
            label="Topic"
            fullWidth
            margin="dense"
            onChange={(e) =>
              setNewOutcome({ ...newOutcome, topic: e.target.value })
            }
          />
          <TextField
            label="Project"
            fullWidth
            margin="dense"
            onChange={(e) =>
              setNewOutcome({ ...newOutcome, project: e.target.value })
            }
          />
          <TextField
            label="Credits"
            type="number"
            fullWidth
            margin="dense"
            onChange={(e) =>
              setNewOutcome({ ...newOutcome, credits: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOutcome}>Cancel</Button>
          <Button onClick={handleSubmitOutcome} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShowSubjects;


