// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   getSubjectList,
//   updateSubject,
//   updateOutcome,
//   addOutcome
// } from "../../../redux/subjectrelated/subjectHandle";
// import {
//   Paper,
//   Box,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Collapse,
//   IconButton,
// } from "@mui/material";
// import { ExpandMore, ExpandLess } from "@mui/icons-material";

// const ShowSubjects = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { subjects = [], loading } = useSelector((state) => state.subject);

//   useEffect(() => {
//     dispatch(getSubjectList());
//   }, [dispatch]);

//   // ✅ State for Expanding Outcomes
//   const [expandedSubject, setExpandedSubject] = useState(null);
//   const toggleExpand = (subjectID) => {
//     setExpandedSubject(expandedSubject === subjectID ? null : subjectID);
//   };

//   // ✅ State for Editing Subjects
//   const [openEdit, setOpenEdit] = useState(false);
//   const [editSubject, setEditSubject] = useState({
//     id: "",
//     name: "",
//     credits: "",
//   });

//   // ✅ State for Adding Outcomes
//   const [openOutcome, setOpenOutcome] = useState(false);
//   const [selectedSubjectID, setSelectedSubjectID] = useState(null);
//   const [newOutcome, setNewOutcome] = useState({
//     topic: "",
//     project: "",
//     credits: "",
//   });
//   // ✅ State for Editing Outcomes
//   const [openEditOutcome, setOpenEditOutcome] = useState(false);
//   const [editOutcome, setEditOutcome] = useState({
//     topic: "",
//     project: "",
//     credits: "",
//   });


//   // ✅ Open Edit Subject Dialog
//   const handleEdit = (subject) => {
//     setEditSubject({
//       id: subject._id,
//       name: subject.name,
//       credits: subject.credits,
//     });
//     setOpenEdit(true);
//   };

//   const handleAddOutcome = (subjectID) => {
//     setSelectedSubjectID(subjectID);
//     setNewOutcome({ topic: "", project: "", credits: "" }); // Reset fields
//     setOpenOutcome(true);
//   };
//   // ✅ Open Edit Outcome Dialog
//   const handleEditOutcome = (subjectID, outcome) => {
//     if (!outcome) {
//       console.error("No outcome found.");
//       return;
//     }
//     setEditOutcome({
//       subjectID,
//       outcomeID: outcome._id || "",
//       topic: outcome.topic || "",
//       project: outcome.project || "",
//       credits: outcome.credits || "",
//     });
//     setOpenEditOutcome(true);
//   };


//   const handleSubmitOutcome = () => {
//     if (!newOutcome.topic || !newOutcome.project || !newOutcome.credits) {
//       alert("Please fill all fields!");
//       return;
//     }

//     dispatch(addOutcome(selectedSubjectID, newOutcome)).then(() =>
//       dispatch(getSubjectList())
//     ); // Refresh subjects after adding an outcome

//     setOpenOutcome(false);
//     setNewOutcome({ topic: "", project: "", credits: "" }); // Reset fields
//   };
  
//   const handleSubmitEditOutcome = () => {
//     // Ensure we have a valid subjectID and outcomeID
//     if (!editOutcome.subjectID || !editOutcome.outcomeID) {
//       console.error("No outcome found.");
//       return;
//     }
  
//     // Dispatch updateOutcome action (Make sure this exists in your Redux actions)
//     dispatch(
//       updateOutcome(editOutcome.subjectID, editOutcome.outcomeID, {
//         topic: editOutcome.topic,
//         project: editOutcome.project,
//         credits: editOutcome.credits,
//       })
//     );
  
//     setOpenEditOutcome(false);
//   };
  

//   // ✅ Close Dialogs
//   const handleCloseEdit = () => setOpenEdit(false);

//   // ✅ Submit Subject Edit
//   const handleSubmitEdit = () => {
//     dispatch(
//       updateSubject(editSubject.id, {
//         name: editSubject.name,
//         credits: editSubject.credits,
//       })
//     );
//     setOpenEdit(false);
//   };


//   return (
//     <>
//       {loading ? (
//         <div>Loading...</div>
//       ) : (
//         <>
//           <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
//             <Button variant="contained" onClick={() => navigate("/Teacher/subjects/add")}>
//               Add Subject
//             </Button>
//           </Box>

//           <Paper sx={{ width: "100%", overflow: "hidden" }}>
//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell> </TableCell>
//                     <TableCell>Topic</TableCell>
//                     <TableCell align="right">Credits</TableCell>
//                     <TableCell align="right">Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {subjects.length > 0 ? (
//                     subjects.map((subject) => (
//                       <React.Fragment key={subject._id}>
//                         <TableRow>
//                           <TableCell>
//                             <IconButton onClick={() => toggleExpand(subject._id)}>
//                               {expandedSubject === subject._id ? <ExpandLess /> : <ExpandMore />}
//                             </IconButton>
//                           </TableCell>
//                           <TableCell sx={{ textDecoration: "underline", color: "blue", cursor: "pointer" }} onClick={() => toggleExpand(subject._id)}>
//                             {subject.name}
//                           </TableCell>
//                           <TableCell align="right">{subject.credits}</TableCell>
//                           <TableCell align="right">
//                             <Button variant="outlined" onClick={() => handleEdit(subject)}>EDIT</Button>
//                           </TableCell>
//                         </TableRow>

//                         <TableRow>
//                           <TableCell colSpan={4} sx={{ padding: 0, border: "none" }}>
//                             <Collapse in={expandedSubject === subject._id} timeout="auto" unmountOnExit>
//                               <Box sx={{ margin: 2, padding: 2, background: "#f5f5f5", borderRadius: 2 }}>
//                                 <strong>Outcomes:</strong>
//                                 <Button
//                                   variant="contained"
//                                   size="small"
//                                   sx={{ marginLeft: 2, marginBottom: 1 }}
//                                   onClick={() => handleAddOutcome(subject._id)}
//                                 >
//                                   Add Outcome
//                                 </Button>
//                                 <TableContainer>
//                                   <Table>
//                                     <TableHead>
//                                       <TableRow>
//                                         <TableCell>Topic</TableCell>
//                                         <TableCell>Project</TableCell>
//                                         <TableCell>Credits</TableCell>
//                                         <TableCell>Actions</TableCell>
//                                       </TableRow>
//                                     </TableHead>
//                                     <TableBody>
//                                       {subject.outcomes.map((outcome, index) => (
//                                         <TableRow key={index}>
//                                           <TableCell>{outcome.topic}</TableCell>
//                                           <TableCell>{outcome.project}</TableCell>
//                                           <TableCell>{outcome.credits}</TableCell>
//                                           <TableCell>
//                                             <Button
//                                               variant="outlined"
//                                               size="small"
//                                               onClick={() => handleEditOutcome(subject._id, outcome)}
//                                             >
//                                               EDIT
//                                             </Button>
//                                           </TableCell>
//                                         </TableRow>
//                                       ))}
//                                     </TableBody>
//                                   </Table>
//                                 </TableContainer>
//                               </Box>
//                             </Collapse>
//                           </TableCell>
//                         </TableRow>
//                       </React.Fragment>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={4} align="center">No subjects found.</TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Paper>
//         </>
//       )}

//       {/* ✅ Edit Subject Dialog */}
//       <Dialog open={openEdit} onClose={handleCloseEdit}>
//         <DialogTitle>Edit Subject</DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             label="Subject Name"
//             margin="dense"
//             value={editSubject.name}
//             onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })}
//           />
//           <TextField
//             fullWidth
//             label="Credits"
//             margin="dense"
//             type="number"
//             value={editSubject.credits}
//             onChange={(e) => setEditSubject({ ...editSubject, credits: e.target.value })}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseEdit}>Cancel</Button>
//           <Button onClick={handleSubmitEdit} color="primary">Save</Button>
//         </DialogActions>
//       </Dialog>
      
//       {/* ✅ Edit Outcome Dialog */}
//       <Dialog open={openEditOutcome} onClose={() => setOpenEditOutcome(false)}>
//         <DialogTitle>Edit Outcome</DialogTitle>
//         <DialogContent>
//           <TextField fullWidth label="Topic" margin="dense" value={editOutcome.topic} onChange={(e) => setEditOutcome({ ...editOutcome, topic: e.target.value })} />
//           <TextField fullWidth label="Project" margin="dense" value={editOutcome.project} onChange={(e) => setEditOutcome({ ...editOutcome, project: e.target.value })} />
//           <TextField fullWidth label="Credits" type="number" margin="dense" value={editOutcome.credits} onChange={(e) => setEditOutcome({ ...editOutcome, credits: e.target.value })} />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenEditOutcome(false)}>Cancel</Button>
//           <Button onClick={handleSubmitEditOutcome} color="primary">Save</Button>
//         </DialogActions>
//       </Dialog>
//       {/* ✅ Add Outcome Dialog (Fixed) */}
//       <Dialog open={openOutcome} onClose={() => setOpenOutcome(false)}>
//         <DialogTitle>Add Outcome</DialogTitle>
//         <DialogContent>
//           <TextField fullWidth label="Topic" margin="dense" onChange={(e) => setNewOutcome({ ...newOutcome, topic: e.target.value })} />
//           <TextField fullWidth label="Project" margin="dense" onChange={(e) => setNewOutcome({ ...newOutcome, project: e.target.value })} />
//           <TextField fullWidth label="Credits" type="number" margin="dense" onChange={(e) => setNewOutcome({ ...newOutcome, credits: e.target.value })} />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenOutcome(false)}>Cancel</Button>
//           <Button onClick={handleSubmitOutcome} color="primary">Save</Button>
//         </DialogActions>
//       </Dialog>
      
//     </>
//   );
// };

// export default ShowSubjects;

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getSubjectList, updateSubject, updateOutcome, addOutcome } from "../../../redux/subjectrelated/subjectHandle"
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
} from "@mui/material"
import { ExpandMore, ExpandLess } from "@mui/icons-material"

const ShowSubjects = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { subjects = [], loading } = useSelector((state) => state.subject)

  useEffect(() => {
    dispatch(getSubjectList())
  }, [dispatch])

  // ✅ State for Expanding Outcomes
  const [expandedSubject, setExpandedSubject] = useState(null)
  const toggleExpand = (subjectID) => {
    setExpandedSubject(expandedSubject === subjectID ? null : subjectID)
  }

  // ✅ State for Editing Subjects
  const [openEdit, setOpenEdit] = useState(false)
  const [editSubject, setEditSubject] = useState({
    id: "",
    name: "",
    credits: "",
  })

  // ✅ State for Adding Outcomes
  const [openOutcome, setOpenOutcome] = useState(false)
  const [selectedSubjectID, setSelectedSubjectID] = useState(null)
  const [newOutcome, setNewOutcome] = useState({
    topic: "",
    project: "",
    credits: "",
  })
  // ✅ State for Editing Outcomes
  const [openEditOutcome, setOpenEditOutcome] = useState(false)
  const [editOutcome, setEditOutcome] = useState({
    topic: "",
    project: "",
    credits: "",
  })

  const [openRequirements, setOpenRequirements] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState(null)

  // ✅ Open Edit Subject Dialog
  const handleEdit = (subject) => {
    setEditSubject({
      id: subject._id,
      name: subject.name,
      credits: subject.credits,
    })
    setOpenEdit(true)
  }

  const handleAddOutcome = (subjectID) => {
    setSelectedSubjectID(subjectID)
    setNewOutcome({ topic: "", project: "", credits: "" }) // Reset fields
    setOpenOutcome(true)
  }
  // ✅ Open Edit Outcome Dialog
  const handleEditOutcome = (subjectID, outcome) => {
    if (!outcome) {
      console.error("No outcome found.")
      return
    }
    setEditOutcome({
      subjectID,
      outcomeID: outcome._id || "",
      topic: outcome.topic || "",
      project: outcome.project || "",
      credits: outcome.credits || "",
    })
    setOpenEditOutcome(true)
  }

  const handleSubmitOutcome = () => {
    if (!newOutcome.topic || !newOutcome.project || !newOutcome.credits) {
      alert("Please fill all fields!")
      return
    }

    dispatch(addOutcome(selectedSubjectID, newOutcome)).then(() => dispatch(getSubjectList())) // Refresh subjects after adding an outcome

    setOpenOutcome(false)
    setNewOutcome({ topic: "", project: "", credits: "" }) // Reset fields
  }

  const handleSubmitEditOutcome = () => {
    // Ensure we have a valid subjectID and outcomeID
    if (!editOutcome.subjectID || !editOutcome.outcomeID) {
      console.error("No outcome found.")
      return
    }

    // Dispatch updateOutcome action (Make sure this exists in your Redux actions)
    dispatch(
      updateOutcome(editOutcome.subjectID, editOutcome.outcomeID, {
        topic: editOutcome.topic,
        project: editOutcome.project,
        credits: editOutcome.credits,
      }),
    )

    setOpenEditOutcome(false)
  }

  // ✅ Close Dialogs
  const handleCloseEdit = () => setOpenEdit(false)

  // ✅ Submit Subject Edit
  const handleSubmitEdit = () => {
    dispatch(
      updateSubject(editSubject.id, {
        name: editSubject.name,
        credits: editSubject.credits,
      }),
    )
    setOpenEdit(false)
  }

  const handleOutcomeClick = (subjectId, outcome) => {
    setSelectedOutcome({ ...outcome, subjectId })
    setOpenRequirements(true)
  }

  const handleUpdateRequirement = () => {
    if (selectedOutcome) {
      dispatch(
        updateOutcome(selectedOutcome.subjectId, selectedOutcome._id, {
          ...selectedOutcome,
          requirements: selectedOutcome.requirements,
        }),
      )
      setOpenRequirements(false)
    }
  }

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <Button variant="contained" onClick={() => navigate("/Teacher/subjects/add")}>
              Add Subject
            </Button>
          </Box>

          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell> </TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell align="right">Credits</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
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
                            <Button variant="outlined" onClick={() => handleEdit(subject)}>
                              EDIT
                            </Button>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell colSpan={4} sx={{ padding: 0, border: "none" }}>
                            <Collapse in={expandedSubject === subject._id} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 2, padding: 2, background: "#f5f5f5", borderRadius: 2 }}>
                                <strong>Outcomes:</strong>
                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{ marginLeft: 2, marginBottom: 1 }}
                                  onClick={() => handleAddOutcome(subject._id)}
                                >
                                  Add Outcome
                                </Button>
                                <TableContainer>
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Topic</TableCell>
                                        <TableCell>Project</TableCell>
                                        <TableCell>Credits</TableCell>
                                        <TableCell>Actions</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {subject.outcomes.map((outcome, index) => (
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

      {/* ✅ Edit Subject Dialog */}
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

      {/* ✅ Edit Outcome Dialog */}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditOutcome(false)}>Cancel</Button>
          <Button onClick={handleSubmitEditOutcome} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* ✅ Add Outcome Dialog (Fixed) */}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOutcome(false)}>Cancel</Button>
          <Button onClick={handleSubmitOutcome} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openRequirements} onClose={() => setOpenRequirements(false)}>
        <DialogTitle>Requirements</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Requirements"
            margin="dense"
            value={selectedOutcome ? selectedOutcome.requirements || "" : ""}
            onChange={(e) => setSelectedOutcome({ ...selectedOutcome, requirements: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequirements(false)}>Cancel</Button>
          <Button onClick={handleUpdateRequirement} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ShowSubjects


