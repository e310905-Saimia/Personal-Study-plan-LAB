import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ExpandMore, ExpandLess, CloudUpload, UploadFile } from "@mui/icons-material";
import { getSubjectList, updateSubject, updateOutcome, addOutcome } from "../../../redux/subjectrelated/subjectHandle";
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
  Tabs,
  Tab,
  Switch,
  Typography
} from "@mui/material";

// Helper function to determine if an outcome is compulsory
const isCompulsory = (outcome) => {
  return String(outcome?.compulsory) === 'true' || outcome?.compulsory === true;
};

const ShowSubjects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjects = [], loading } = useSelector((state) => state.subject);

  // Filter state
  const [outcomeFilter, setOutcomeFilter] = useState("all"); // all, compulsory, optional

  useEffect(() => {
    dispatch(getSubjectList());
  }, [dispatch]);

  // State for Expanding Outcomes
  const [expandedSubject, setExpandedSubject] = useState(null);
  const toggleExpand = (subjectID) => {
    setExpandedSubject(expandedSubject === subjectID ? null : subjectID);
  };

  // State for Editing Subjects
  const [openEdit, setOpenEdit] = useState(false);
  const [editSubject, setEditSubject] = useState({
    id: "",
    name: "",
    credits: "",
  });

  // State for Adding Outcomes
  const [openOutcome, setOpenOutcome] = useState(false);
  const [selectedSubjectID, setSelectedSubjectID] = useState(null);
  const [newOutcome, setNewOutcome] = useState({
    topic: "",
    project: "",
    credits: "",
    compulsory: true, // Default to compulsory
  });

  // State for Editing Outcomes
  const [openEditOutcome, setOpenEditOutcome] = useState(false);
  const [editOutcome, setEditOutcome] = useState({
    subjectID: "",
    outcomeID: "",
    topic: "",
    project: "",
    credits: "",
    compulsory: true,
  });

  // Requirements Dialog State
  const [openRequirements, setOpenRequirements] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [requirementText, setRequirementText] = useState("");
  const [updatingRequirements] = useState(false);

  // Open Edit Subject Dialog
  const handleEdit = (subject) => {
    setEditSubject({
      id: subject._id,
      name: subject.name,
      credits: subject.credits,
    });
    setOpenEdit(true);
  };

  const handleAddOutcome = (subjectID) => {
    setSelectedSubjectID(subjectID);
    setNewOutcome({ 
      topic: "", 
      project: "", 
      credits: "", 
      compulsory: outcomeFilter === "compulsory" || outcomeFilter === "all" 
    }); 
    setOpenOutcome(true);
  };
  
  // Open Edit Outcome Dialog
  const handleEditOutcome = (subjectID, outcome) => {
    if (!outcome) {
      console.error("No outcome found.");
      return;
    }
    
    // Use helper function to determine compulsory status
    const outcomeCompulsory = isCompulsory(outcome);
    console.log(`Opening edit dialog for ${outcome.topic}, compulsory=${outcomeCompulsory}`);
    
    setEditOutcome({
      subjectID,
      outcomeID: outcome._id || "",
      topic: outcome.topic || "",
      project: outcome.project || "",
      credits: outcome.credits || "",
      compulsory: outcomeCompulsory,
    });
    
    setOpenEditOutcome(true);
  };

  const handleSubmitOutcome = () => {
    if (!newOutcome.topic || !newOutcome.project || !newOutcome.credits) {
      alert("Please fill all required fields!");
      return;
    }

    dispatch(addOutcome(selectedSubjectID, newOutcome))
      .then(() => {
        dispatch(getSubjectList()); // Refresh subjects after adding an outcome
        setOpenOutcome(false);
        setNewOutcome({ 
          topic: "", 
          project: "", 
          credits: "", 
          compulsory: outcomeFilter === "compulsory" || outcomeFilter === "all" 
        }); 
      })
      .catch(error => {
        console.error("Failed to add outcome:", error);
      });
  };

  const handleSubmitEditOutcome = () => {
    // Ensure we have a valid subjectID and outcomeID
    if (!editOutcome.subjectID || !editOutcome.outcomeID) {
      console.error("Missing subject ID or outcome ID");
      return;
    }

    // Dispatch updateOutcome action with proper compulsory value
    dispatch(
      updateOutcome(editOutcome.subjectID, editOutcome.outcomeID, {
        topic: editOutcome.topic,
        project: editOutcome.project,
        credits: editOutcome.credits,
        compulsory: editOutcome.compulsory
      })
    ).then(() => {
      // Force a complete refresh to ensure we get the latest data
      dispatch(getSubjectList());
      setOpenEditOutcome(false);
    }).catch(error => {
      console.error("Error updating outcome:", error);
    });
  };

  // Close Dialogs
  const handleCloseEdit = () => setOpenEdit(false);

  // Submit Subject Edit
  const handleSubmitEdit = () => {
    dispatch(
      updateSubject(editSubject.id, {
        name: editSubject.name,
        credits: editSubject.credits,
      })
    );
    setOpenEdit(false);
  };

  const handleOutcomeClick = (subjectId, outcome) => {
    setSelectedOutcome({ ...outcome, subjectId });
    setRequirementText(outcome.requirements?.join("\n") || "");
    setOpenRequirements(true);
  };

  const handleUpdateRequirement = () => {
    if (!selectedOutcome) return;
    
    // Convert text to array before saving
    const updatedRequirements = requirementText.split("\n").filter((req) => req.trim() !== "");

    // Preserve the compulsory status using our helper function
    const outcomeCompulsory = isCompulsory(selectedOutcome);

    dispatch(
      updateOutcome(selectedOutcome.subjectId, selectedOutcome._id, { 
        requirements: updatedRequirements,
        compulsory: outcomeCompulsory
      })
    ).then(() => {
      setOpenRequirements(false);
      dispatch(getSubjectList()); // Refresh data
    });
  };

  // Navigate to CSV import page
  const handleImportCSV = () => {
    navigate("/Teacher/subjects/import");
  };

  // Handle filter change using Tabs
  const handleFilterChange = (event, newValue) => {
    setOutcomeFilter(newValue);
  };

  // Filter outcomes based on current filter
  const filterOutcomes = (outcomes) => {
    if (outcomeFilter === "all") {
      return outcomes;
    } else if (outcomeFilter === "compulsory") {
      return outcomes.filter(outcome => isCompulsory(outcome));
    } else if (outcomeFilter === "optional") {
      return outcomes.filter(outcome => !isCompulsory(outcome));
    }
    return outcomes;
  };

  // Handle compulsory toggle change in edit dialog
  const handleCompulsoryToggle = (e) => {
    const toggled = e.target.checked;
    console.log("Toggle changed to:", toggled);
    setEditOutcome(prev => ({ 
      ...prev, 
      compulsory: toggled 
    }));
  };

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button variant="contained" onClick={() => navigate("/Teacher/subjects/add")}>
              ADD SUBJECT
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleImportCSV}
              startIcon={<CloudUpload />}
            >
              IMPORT CSV
            </Button>
          </Box>

          {/* Simple tabs without badges */}
          <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
            <Tabs
              value={outcomeFilter}
              onChange={handleFilterChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="ALL" value="all" />
              <Tab label="COMPULSORY" value="compulsory" />
              <Tab label="OPTIONAL" value="optional" />
            </Tabs>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="5%"></TableCell>
                  <TableCell>Topic</TableCell>
                  <TableCell align="right">Credits</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.length > 0 ? (
                  subjects.map((subject) => {
                    // Only show subjects that have outcomes matching the current filter when not in "all" mode
                    const filteredOutcomes = filterOutcomes(subject.outcomes);
                    if (outcomeFilter !== "all" && filteredOutcomes.length === 0) {
                      return null;
                    }
                    
                    return (
                      <React.Fragment key={subject._id}>
                        <TableRow>
                          <TableCell>
                            <IconButton onClick={() => toggleExpand(subject._id)}>
                              {expandedSubject === subject._id ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </TableCell>
                          <TableCell
                            sx={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}
                            onClick={() => toggleExpand(subject._id)}
                          >
                            {subject.name}
                          </TableCell>
                          <TableCell align="right">{subject.credits}</TableCell>
                          <TableCell align="right">
                            <Button variant="outlined" color="primary" size="small" onClick={() => handleEdit(subject)}>
                              EDIT
                            </Button>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell colSpan={4} sx={{ padding: 0, border: "none" }}>
                            <Collapse in={expandedSubject === subject._id} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 3, pb: 1 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                  <Typography sx={{ fontWeight: "bold" }}>
                                    Outcomes: {outcomeFilter !== "all" && ` Showing ${outcomeFilter}`}
                                  </Typography>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    {/* Import Outcomes button */}
                                    <Button 
                                      variant="outlined" 
                                      size="small" 
                                      startIcon={<UploadFile />}
                                      onClick={() => navigate(`/Teacher/subjects/${subject._id}/outcomes/import`)}
                                    >
                                      Import Outcomes
                                    </Button>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleAddOutcome(subject._id)}
                                    >
                                      ADD OUTCOME
                                    </Button>
                                  </Box>
                                </Box>
                                {filteredOutcomes.length > 0 ? (
                                  <TableContainer>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Topic</TableCell>
                                          <TableCell>Project</TableCell>
                                          <TableCell>Credits</TableCell>
                                          <TableCell>Type</TableCell>
                                          <TableCell>Actions</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {filteredOutcomes.map((outcome, index) => (
                                          <TableRow key={index}>
                                            <TableCell
                                              onClick={() => handleOutcomeClick(subject._id, outcome)}
                                              sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                                            >
                                              {outcome.topic}
                                            </TableCell>
                                            <TableCell>{outcome.project}</TableCell>
                                            <TableCell>{outcome.credits}</TableCell>
                                            <TableCell>
                                              {/* Use string comparison to avoid type issues */}
                                              {isCompulsory(outcome) ? "Compulsory" : "Optional"}
                                            </TableCell>
                                            <TableCell>
                                              <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleEditOutcome(subject._id, outcome)}
                                              >
                                                EDIT
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                ) : (
                                  <Typography variant="body2" sx={{ p: 2 }}>
                                    No {outcomeFilter} outcomes found for this subject.
                                  </Typography>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
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
        </>
      )}

      {/* Edit Subject Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Edit Subject</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject Name"
            margin="dense"
            value={editSubject.name}
            onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Credits"
            margin="dense"
            type="number"
            value={editSubject.credits}
            onChange={(e) => setEditSubject({ ...editSubject, credits: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleSubmitEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Outcome Dialog - FIXED */}
      <Dialog open={openEditOutcome} onClose={() => setOpenEditOutcome(false)}>
        <DialogTitle>Edit Outcome</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Topic"
            margin="dense"
            value={editOutcome.topic}
            onChange={(e) => setEditOutcome({ ...editOutcome, topic: e.target.value })}
          />
          <TextField
            fullWidth
            label="Project"
            margin="dense"
            value={editOutcome.project}
            onChange={(e) => setEditOutcome({ ...editOutcome, project: e.target.value })}
          />
          <TextField
            fullWidth
            label="Credits"
            type="number"
            margin="dense"
            value={editOutcome.credits}
            onChange={(e) => setEditOutcome({ ...editOutcome, credits: e.target.value })}
          />
          
          {/* Simplified toggle for compulsory status */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Switch
              checked={isCompulsory(editOutcome)}
              onChange={handleCompulsoryToggle}
              color="primary"
              inputProps={{ 'aria-label': 'Compulsory outcome toggle' }}
            />
            <Typography>Compulsory Outcome</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditOutcome(false)}>Cancel</Button>
          <Button onClick={handleSubmitEditOutcome} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Outcome Dialog */}
      <Dialog open={openOutcome} onClose={() => setOpenOutcome(false)}>
        <DialogTitle>Add Outcome</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Topic"
            margin="dense"
            onChange={(e) => setNewOutcome({ ...newOutcome, topic: e.target.value })}
          />
          <TextField
            fullWidth
            label="Project"
            margin="dense"
            onChange={(e) => setNewOutcome({ ...newOutcome, project: e.target.value })}
          />
          <TextField
            fullWidth
            label="Credits"
            type="number"
            margin="dense"
            onChange={(e) => setNewOutcome({ ...newOutcome, credits: e.target.value })}
          />
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Switch
              checked={isCompulsory(newOutcome)}
              onChange={(e) => setNewOutcome({ ...newOutcome, compulsory: e.target.checked })}
              color="primary"
              inputProps={{ 'aria-label': 'Compulsory outcome toggle' }}
            />
            <Typography>Compulsory Outcome</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOutcome(false)}>Cancel</Button>
          <Button onClick={handleSubmitOutcome} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Requirements Dialog */}
      <Dialog open={openRequirements} onClose={() => setOpenRequirements(false)} fullWidth maxWidth="md">
        <DialogTitle>Outcome Requirements</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              {selectedOutcome?.topic}
              {selectedOutcome && (
                <span style={{ marginLeft: '10px', fontStyle: 'italic' }}>
                  ({isCompulsory(selectedOutcome) ? "Compulsory" : "Optional"})
                </span>
              )}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Enter Requirements (One per line)"
            value={requirementText}
            onChange={(e) => setRequirementText(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Box sx={{ fontSize: "0.9rem", color: "#666", paddingLeft: 1 }}>
            Example: <br />
            - Opiskelija osaa tunnistaa yleisimmät hitsausvirheet, kuten huokoset, halkeamat ja epätäydelliset tunkeumat.<br />
            - Opiskelija osaa ehdottaa sopivia korjaustoimenpiteitä havaittujen hitsausvirheiden korjaamiseksi.<br />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequirements(false)}>Cancel</Button>
          <Button onClick={handleUpdateRequirement} color="primary" disabled={updatingRequirements}>
            {updatingRequirements ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShowSubjects;