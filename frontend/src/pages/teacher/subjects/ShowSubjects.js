import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ExpandMore,
  ExpandLess,
  CloudUpload,
  UploadFile,
} from "@mui/icons-material";
import SearchBar from "../../../components/SearchBar";
import {
  getSubjectList,
  updateSubject,
  updateOutcome,
  addOutcome,
  addSubject,
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
  Tabs,
  Tab,
  Switch,
  Typography,
  Alert,
} from "@mui/material";
// import axios from "axios";
import FileImporter from "./FileImporter"; // Import the new component

// Helper function to determine if an outcome is compulsory
const isCompulsory = (outcome) => {
  return String(outcome?.compulsory) === "true" || outcome?.compulsory === true;
};

const ShowSubjects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjects = [], loading } = useSelector((state) => state.subject);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [error, setError] = useState("");
  // State for file importers
  const [subjectImporterOpen, setSubjectImporterOpen] = useState(false);
  const [outcomeImporterOpen, setOutcomeImporterOpen] = useState(false);
  const [selectedSubjectForImport, setSelectedSubjectForImport] =
    useState(null);
  const [importSuccess, setImportSuccess] = useState("");

  useEffect(() => {
    dispatch(getSubjectList());
  }, [dispatch]);

  useEffect(() => {
    let result = subjects;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.outcomes.some(
            (outcome) =>
              outcome.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
              outcome.project.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredSubjects(result);
  }, [subjects, searchTerm]);

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
    credits: "0.1", // Default to minimum value
    compulsory: true, // Default to compulsory
  });

  // State for Editing Outcomes
  const [openEditOutcome, setOpenEditOutcome] = useState(false);
  const [editOutcome, setEditOutcome] = useState({
    subjectID: "",
    outcomeID: "",
    topic: "",
    credits: "",
    maxCredits: "",
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

  // Handle adding a new outcome
  const handleAddOutcome = (subjectID) => {
    setSelectedSubjectID(subjectID);
    setNewOutcome({
      topic: "",
      credits: "0.1", // Default to minimum value
      compulsory: outcomeFilter === "compulsory" || outcomeFilter === "all",
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
    console.log(
      `Opening edit dialog for ${outcome.topic}, compulsory=${outcomeCompulsory}`
    );

    setEditOutcome({
      subjectID,
      outcomeID: outcome._id || "",
      topic: outcome.topic || "",
      credits: outcome.credits || "",
      maxCredits: outcome.maxCredits || outcome.credits ||"", // Use credits as maxCredits by default
      compulsory: outcomeCompulsory,
    });

    setOpenEditOutcome(true);
  };

  const handleSubmitOutcome = () => {
    if (!newOutcome.topic || !newOutcome.credits) {
      alert("Please fill all required fields!");
      return;
    }

    // Validate credit value is between 0.1 and 10
    const creditsValue = parseFloat(newOutcome.credits);
    if (isNaN(creditsValue) || creditsValue < 0.1 || creditsValue > 10) {
      alert("Credits must be a value between 0.1 and 10!");
      return;
    }

    // Create a modified outcome object with a default value for project
    const outcomeToSubmit = {
      ...newOutcome,
      project: newOutcome.topic, // Use topic as project since we removed the project field
    };

    dispatch(addOutcome(selectedSubjectID, outcomeToSubmit))
      .then(() => {
        dispatch(getSubjectList()); // Refresh subjects after adding an outcome
        setOpenOutcome(false);
        setNewOutcome({
          topic: "",
          credits: "",
          compulsory: outcomeFilter === "compulsory" || outcomeFilter === "all",
        });
      })
      .catch((error) => {
        console.error("Failed to add outcome:", error);
      });
  };

  const handleSubmitEditOutcome = () => {
    // Ensure we have a valid subjectID and outcomeID
    if (!editOutcome.subjectID || !editOutcome.outcomeID) {
      console.error("Missing subject ID or outcome ID");
      return;
    }

    // Validate credit values are between 0.1 and 10
    const minCreditsValue = parseFloat(editOutcome.credits);
    if (isNaN(minCreditsValue) || minCreditsValue < 0.1 || minCreditsValue > 10) {
      alert("Minimum Credits must be a value between 0.1 and 10!");
      return;
    }

    const maxCreditsValue = parseFloat(editOutcome.maxCredits);
    if (isNaN(maxCreditsValue) || maxCreditsValue < 0.1 || maxCreditsValue > 10) {
      alert("Maximum Credits must be a value between 0.1 and 10!");
      return;
    }

    // Dispatch updateOutcome action with proper compulsory value
    dispatch(
      updateOutcome(editOutcome.subjectID, editOutcome.outcomeID, {
        topic: editOutcome.topic,
        project: editOutcome.topic, // Use topic as project
        credits: minCreditsValue,
        maxCredits: maxCreditsValue, // Ensure we're using the parsed value
        compulsory: editOutcome.compulsory,
      })
    )
      .then(() => {
        // Force a complete refresh to ensure we get the latest data
        dispatch(getSubjectList());
        setOpenEditOutcome(false);
      })
      .catch((error) => {
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
    console.log("Clicked outcome with requirements:", outcome.requirements);
    setSelectedOutcome({ ...outcome, subjectId });
    
    // Make sure we handle both array and string formats for requirements
    let requirementsText = "";
    if (outcome.requirements) {
      if (Array.isArray(outcome.requirements)) {
        // Join the array with newlines to display each on its own line
        requirementsText = outcome.requirements.join("\n");
      } else if (typeof outcome.requirements === 'string') {
        // If it's a string, just use it directly
        requirementsText = outcome.requirements;
      }
    }
    
    setRequirementText(requirementsText);
    setOpenRequirements(true);
  };

  const handleUpdateRequirement = () => {
    if (!selectedOutcome) return;
  
    // Convert text to array before saving
    const updatedRequirements = requirementText
      .split("\n")
      .filter((req) => req.trim() !== "")
      // Add deduplication
      .filter((req, index, self) => self.indexOf(req) === index);
  
    console.log("Saving requirements:", updatedRequirements);
  
    // Preserve the compulsory status using our helper function
    const outcomeCompulsory = isCompulsory(selectedOutcome);
  
    dispatch(
      updateOutcome(selectedOutcome.subjectId, selectedOutcome._id, {
        requirements: updatedRequirements,
        compulsory: outcomeCompulsory,
      })
    ).then(() => {
      setOpenRequirements(false);
      dispatch(getSubjectList()); // Refresh data
    });
  };  

  // Handle outcome import
  const handleOutcomeImport = async (data) => {
    try {
      setImportSuccess("");
      setError("");
      
      // Validate data
      if (!data || !Array.isArray(data) || data.length === 0) {
        setError("No valid outcome data to import");
        return;
      }
      
      console.log("Importing outcomes for subject:", selectedSubjectForImport?.name);
      console.log("Outcome data:", data);
      
      let successCount = 0;
      let updateCount = 0;
      let errorCount = 0;
      
      // Get existing outcomes for the subject
      const existingOutcomes = selectedSubjectForImport?.outcomes || [];
      
      for (const outcome of data) {
        try {
          // Skip outcomes with no topic
          if (!outcome.topic || outcome.topic.trim() === "") {
            console.error("Outcome missing topic, skipping");
            errorCount++;
            continue;
          }
          
          // Ensure credits are within valid range
          let validMinCredits = parseFloat(outcome.credits);
          let validMaxCredits = parseFloat(outcome.maxCredits);
          
          if (isNaN(validMinCredits) || validMinCredits < 0.1 || validMinCredits > 10) {
            validMinCredits = 0.1; // Default to minimum value if invalid
          }
          
          if (isNaN(validMaxCredits) || validMaxCredits < 0.1 || validMaxCredits > 10) {
            validMaxCredits = validMinCredits; // Default to min credits if invalid
          }
          
          // Check if this outcome already exists (by topic)
          const existingOutcome = existingOutcomes.find(
            (existing) => existing.topic.toLowerCase() === outcome.topic.toLowerCase()
          );
          
          // Ensure requirements is an array
          let requirementsArray = [];
          if (outcome.requirements) {
            if (Array.isArray(outcome.requirements)) {
              requirementsArray = outcome.requirements.filter(req => req && req.trim() !== "");
            } else if (typeof outcome.requirements === 'string' && outcome.requirements.trim() !== "") {
              // If it's somehow still a string, try to split it
              if (outcome.requirements.includes('\n')) {
                requirementsArray = outcome.requirements.split('\n');
              } else if (outcome.requirements.includes(',')) {
                requirementsArray = outcome.requirements.split(',');
              } else {
                requirementsArray = [outcome.requirements];
              }
              requirementsArray = requirementsArray.map(req => req.trim()).filter(req => req !== "");
            }
          }
          
          // Log the prepared requirements
          console.log(`Requirements for outcome ${outcome.topic}:`, requirementsArray);
          
          // Prepare outcome data with validated credits and requirements
          const outcomeData = {
            topic: outcome.topic,
            project: outcome.project || outcome.topic,
            credits: validMinCredits,
            maxCredits: validMaxCredits,
            compulsory: outcome.compulsory !== undefined ? outcome.compulsory : true,
            requirements: requirementsArray
          };
          
          if (existingOutcome) {
            // Update existing outcome
            console.log(`Updating existing outcome: ${outcome.topic}`, outcomeData);
            await dispatch(
              updateOutcome(selectedSubjectForImport._id, existingOutcome._id, outcomeData)
            );
            updateCount++;
          } else {
            // Add new outcome
            console.log(`Adding new outcome: ${outcome.topic} with ${requirementsArray.length} requirements`, outcomeData);
            
            const result = await dispatch(
              addOutcome(selectedSubjectForImport._id, outcomeData)
            );
            
            if (result.error) {
              console.error(`Error adding outcome: ${result.error}`);
              errorCount++;
            } else {
              successCount++;
            }
          }
        } catch (err) {
          console.error(`Error processing outcome ${outcome.topic}:`, err);
          errorCount++;
        }
      }
      
      let message = "";
      if (successCount > 0) message += `Added ${successCount} new outcomes. `;
      if (updateCount > 0) message += `Updated ${updateCount} existing outcomes. `;
      if (errorCount > 0) message += `Failed to import ${errorCount} outcomes. `;
      else message += "All outcomes imported successfully!";
      
      setImportSuccess(message);
      
      // Important: Refresh the subject list to see the updated outcomes
      await dispatch(getSubjectList());
      setOutcomeImporterOpen(false);
    } catch (error) {
      console.error("Outcome import failed:", error);
      setError(`Import failed: ${error.message || "Unknown error"}`);
    }
  };

  // Open the subject import dialog
  const handleImportSubjects = () => {
    setSubjectImporterOpen(true);
  };

  // Open the outcome import dialog for a specific subject
  const handleImportOutcomes = (subjectId) => {
    const subject = subjects.find((s) => s._id === subjectId);
    if (subject) {
      setSelectedSubjectForImport(subject);
      setOutcomeImporterOpen(true);
    }
  };

  // Handle subject import submission
  // Replace the handleSubjectImport function in ShowSubjects.js with this version:

// Enhanced handleSubjectImport function with better requirements handling
const handleSubjectImport = async (data) => {
  try {
    setImportSuccess("");
    setError("");


    console.log("COMPLETE SUBJECT IMPORT DATA:", JSON.stringify(data, null, 2));
    // Validate data
    if (!data || !Array.isArray(data) || data.length === 0) {
      setError("No valid subject data to import");
      return;
    }

    console.log("Raw import data from FileImporter:", data);
    console.log(`Received ${data.length} subjects`);
    
    // Debug output for each subject and its outcomes
    let totalOutcomes = 0;
    let totalRequirements = 0;
    data.forEach((subject, index) => {
      const outcomeCount = subject.outcomes?.length || 0;
      totalOutcomes += outcomeCount;
      
      console.log(`Subject ${index + 1}: ${subject.name} has ${outcomeCount} outcomes`);
      if (subject.outcomes && subject.outcomes.length > 0) {
        subject.outcomes.forEach((outcome, i) => {
          const reqCount = outcome.requirements?.length || 0;
          totalRequirements += reqCount;
          
          console.log(` - Outcome ${i + 1}: ${outcome.topic} (${outcome.credits}-${outcome.maxCredits} credits, ${outcome.compulsory ? 'Compulsory' : 'Optional'})`);
          console.log(`   Requirements (${reqCount}): ${JSON.stringify(outcome.requirements || [])}`);
        });
      }
    });
    console.log(`Total: ${data.length} subjects, ${totalOutcomes} outcomes, ${totalRequirements} requirements`);

    // Stats for tracking progress
    let successCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    let outcomeSuccessCount = 0;
    let outcomeErrorCount = 0;

    // Process each subject one by one
    for (const subject of data) {
      try {
        // Validate subject has name
        if (!subject.name || subject.name.trim() === "") {
          console.error("Subject missing name, skipping");
          errorCount++;
          continue;
        }

        // Create a simple subject data object (just name and credits)
        const basicSubjectData = {
          name: subject.name.trim(),
          credits: parseInt(subject.credits || 1, 10)
        };

        console.log(`Processing subject: ${basicSubjectData.name} with ${subject.outcomes?.length || 0} outcomes`);

        // Check if subject already exists
        const existingSubject = subjects.find(
          existingSubject => existingSubject.name.toLowerCase() === subject.name.toLowerCase()
        );

        let subjectId;
        let actionResult;

        if (existingSubject) {
          // Update existing subject
          console.log(`Updating existing subject: ${subject.name}`);
          actionResult = await dispatch(updateSubject(existingSubject._id, basicSubjectData));
          
          // Just use the existing subject ID
          subjectId = existingSubject._id;
          updateCount++;
        } else {
          // Create new subject
          console.log(`Creating new subject: ${subject.name}`);
          actionResult = await dispatch(addSubject(basicSubjectData));
          
          // Check response structure - handle different possible response formats
          if (actionResult && actionResult.subject && actionResult.subject._id) {
            // Direct structure from API response
            subjectId = actionResult.subject._id;
          } else if (actionResult && actionResult.payload && actionResult.payload.subject && actionResult.payload.subject._id) {
            // Redux toolkit might wrap the response in payload
            subjectId = actionResult.payload.subject._id;
          } else if (actionResult && actionResult.payload && actionResult.payload._id) {
            // Another possible structure
            subjectId = actionResult.payload._id;
          } else {
            console.error("Failed to get subject ID from response:", actionResult);
            errorCount++;
            continue;
          }
          
          successCount++;
        }

        // Now handle outcomes if we have a valid subject ID
        if (subjectId && subject.outcomes && subject.outcomes.length > 0) {
          console.log(`Adding ${subject.outcomes.length} outcomes to subject ${subject.name} (ID: ${subjectId})`);

          // Process outcomes sequentially using for...of to ensure proper async/await
          for (const outcome of subject.outcomes) {
            try {
              if (!outcome.topic) {
                console.warn("Skipping outcome with no topic");
                outcomeErrorCount++;
                continue;
              }
              
              // Format the outcome data, ensuring requirements are properly included
              const outcomeData = {
                topic: outcome.topic,
                project: outcome.project || outcome.topic, // Use topic as project if not specified
                credits: parseFloat(outcome.credits) || 0.1,
                maxCredits: parseFloat(outcome.maxCredits) || parseFloat(outcome.credits) || 0.1,
                compulsory: outcome.compulsory !== undefined ? outcome.compulsory : true,
                requirements: Array.isArray(outcome.requirements) ? outcome.requirements : []
              };
              
              console.log(`Adding outcome: ${outcomeData.topic} to subject ID ${subjectId}`);
              console.log(`  Requirements (${outcomeData.requirements.length}): ${JSON.stringify(outcomeData.requirements)}`);
              
              // Add the outcome to the subject
              const outcomeResult = await dispatch(addOutcome(subjectId, outcomeData));
              
              if (outcomeResult && outcomeResult.error) {
                console.error(`Error adding outcome ${outcome.topic}:`, outcomeResult.error);
                outcomeErrorCount++;
              } else {
                outcomeSuccessCount++;
              }
              
              // Add a small delay between API calls to avoid overwhelming the server
              await new Promise(resolve => setTimeout(resolve, 50));
              
            } catch (outcomeError) {
              console.error(`Error processing outcome ${outcome.topic}:`, outcomeError);
              outcomeErrorCount++;
            }
          }
        }
      } catch (subjectErr) {
        console.error(`Error processing subject ${subject.name}:`, subjectErr);
        errorCount++;
      }
    }

    // Generate detailed success message
    let message = "";
    if (successCount > 0) message += `Added ${successCount} new subjects. `;
    if (updateCount > 0) message += `Updated ${updateCount} existing subjects. `;
    if (outcomeSuccessCount > 0) message += `Added ${outcomeSuccessCount} outcomes. `;
    if (errorCount > 0 || outcomeErrorCount > 0) {
      message += `Failed to import ${errorCount} subjects and ${outcomeErrorCount} outcomes. `;
    } else {
      message += "All subjects and outcomes imported successfully! ";
    }

    setImportSuccess(message);

    // Force a refresh of the subject list
    await dispatch(getSubjectList());
    setSubjectImporterOpen(false);
  } catch (error) {
    console.error("Import failed:", error);
    setError(`Import failed: ${error.message || "Unknown error"}`);
  }
};

  // Filter outcomes based on current filter
  const filterOutcomes = (outcomes) => {
    if (outcomeFilter === "all") {
      return outcomes;
    } else if (outcomeFilter === "compulsory") {
      return outcomes.filter((outcome) => isCompulsory(outcome));
    } else if (outcomeFilter === "optional") {
      return outcomes.filter((outcome) => !isCompulsory(outcome));
    }
    return outcomes;
  };

  // Handle filter change using Tabs
  const handleFilterChange = (event, newValue) => {
    setOutcomeFilter(newValue);
  };

  // Handle compulsory toggle change in edit dialog
  const handleCompulsoryToggle = (e) => {
    const toggled = e.target.checked;
    console.log("Toggle changed to:", toggled);
    setEditOutcome((prev) => ({
      ...prev,
      compulsory: toggled,
    }));
  };

  // Update the subjectSampleContent to match the expected format:
  const subjectSampleContent = `Subject Name;Learning Outcomes;Compulsary or not;Requirements;Outcome minimum credits;Outcome maximun credits
Mathematics;Algebra;TRUE;"Student can solve linear equations
Student understands matrix multiplication
Student can apply matrices to practical problems";0.1;0.2
Mathematics;Calculus;TRUE;"Student can find derivatives of polynomial functions
Student can apply chain rule
Student understands practical applications";0.2;0.3
Physics;Mechanics;TRUE;"Student can apply Newton's laws
Student can solve basic mechanics problems
Student can analyze force diagrams";0.1;0.2
Physics;Thermodynamics;FALSE;"Student understands laws of thermodynamics
Student can calculate entropy
Student can explain heat transfer mechanisms";0.2;0.3`;

  // Sample CSV content for outcomes
  const outcomeSampleContent = `Topic;Learning Outcomes;Compulsary or not;Requirements;Outcome minimum credits;Outcome maximun credits
Welding;Metal Joining Techniques;TRUE;"Student can identify common welding methods
Student can select appropriate welding techniques for different materials
Student can evaluate weld quality through visual inspection";0.1;0.2
Welding;Welding Safety;TRUE;"Student understands safety protocols
Student can identify hazards in welding environment
Student can select appropriate safety equipment";0.2;0.3
Robotics;Robot Programming;TRUE;"Student can write basic robot programs
Student can implement movement sequences
Student can integrate sensors";0.1;0.2
Robotics;Robot Maintenance;FALSE;"Student can identify common maintenance issues
Student can perform preventive maintenance
Student can troubleshoot hardware problems";0.2;0.3`;

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Search Bar */}
          <Box sx={{ mb: 2 }}>
            <SearchBar
              onSearchChange={(term) => setSearchTerm(term)}
              placeholder="Search subjects by name, topic, or project"
            />
          </Box>

          {importSuccess && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              onClose={() => setImportSuccess("")}
            >
              {importSuccess}
            </Alert>
          )}
          {/* ADD THE ERROR ALERT RIGHT HERE */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            {/* <Button
              variant="contained"
              onClick={() => navigate("/Teacher/subjects/add")}
            >
              ADD SUBJECT
            </Button> */}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleImportSubjects}
              startIcon={<CloudUpload />}
            >
              IMPORT SUBJECTS
            </Button>
          </Box>

          {/* Simple tabs without badges */}
          <Box sx={{ width: "100%", bgcolor: "background.paper", mb: 2 }}>
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => {
                    const filteredOutcomes = filterOutcomes(subject.outcomes);
                    if (
                      outcomeFilter !== "all" &&
                      filteredOutcomes.length === 0
                    ) {
                      return null;
                    }

                    return (
                      <React.Fragment key={subject._id}>
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
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleEdit(subject)}
                            >
                              EDIT
                            </Button>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            colSpan={3}
                            sx={{ padding: 0, border: "none" }}
                          >
                            <Collapse
                              in={expandedSubject === subject._id}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ p: 3, pb: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 2,
                                  }}
                                >
                                  <Typography sx={{ fontWeight: "bold" }}>
                                    Outcomes:{" "}
                                    {outcomeFilter !== "all" &&
                                      ` Showing ${outcomeFilter}`}
                                  </Typography>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    {/* Import Outcomes button */}
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<UploadFile />}
                                      onClick={() =>
                                        handleImportOutcomes(subject._id)
                                      }
                                    >
                                      Import Outcomes
                                    </Button>
                                  </Box>
                                </Box>
                                {filteredOutcomes.length > 0 ? (
                                  <TableContainer>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Topic</TableCell>
                                          <TableCell>Minimum Credits</TableCell>
                                          <TableCell>Maximum Credits</TableCell>
                                          <TableCell>Type</TableCell>
                                          <TableCell>Actions</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {filteredOutcomes.map(
                                          (outcome, index) => (
                                            <TableRow key={index}>
                                              <TableCell
                                                onClick={() =>
                                                  handleOutcomeClick(
                                                    subject._id,
                                                    outcome
                                                  )
                                                }
                                                sx={{
                                                  cursor: "pointer",
                                                  "&:hover": {
                                                    textDecoration: "underline",
                                                  },
                                                }}
                                              >
                                                {outcome.topic}
                                              </TableCell>
                                              <TableCell>
                                                {outcome.credits}
                                              </TableCell>

                                              <TableCell>
                                              {outcome.maxCredits !== undefined ? outcome.maxCredits : outcome.credits}
                                              </TableCell>
                                              <TableCell>
                                                {/* Use string comparison to avoid type issues */}
                                                {isCompulsory(outcome)
                                                  ? "Compulsory"
                                                  : "Optional"}
                                              </TableCell>
                                              <TableCell>
                                                <Button
                                                  variant="outlined"
                                                  size="small"
                                                  onClick={() =>
                                                    handleEditOutcome(
                                                      subject._id,
                                                      outcome
                                                    )
                                                  }
                                                >
                                                  EDIT
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          )
                                        )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                ) : (
                                  <Typography variant="body2" sx={{ p: 2 }}>
                                    No {outcomeFilter} outcomes found for this
                                    subject.
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
                    <TableCell colSpan={3} align="center">
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
      {/* Edit Outcome Dialog - UPDATED */}
      <Dialog open={openEditOutcome} onClose={() => setOpenEditOutcome(false)}>
        <DialogTitle>Edit Outcome</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption">Topic</Typography>
            <TextField
              fullWidth
              value={editOutcome.topic}
              onChange={(e) =>
                setEditOutcome({ ...editOutcome, topic: e.target.value })
              }
              variant="outlined"
              margin="dense"
            />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption">Minimum Credits</Typography>
            <TextField
              fullWidth
              type="number"
              value={editOutcome.credits}
              onChange={(e) =>
                setEditOutcome({ ...editOutcome, credits: e.target.value })
              }
              variant="outlined"
              margin="dense"
              inputProps={{
                min: 0.1,
                max: 10,
                step: 0.1,
              }}
            />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption">Maximum Credits</Typography>
            <TextField
              fullWidth
              type="number"
              value={editOutcome.maxCredits}
              onChange={(e) =>
                setEditOutcome({ ...editOutcome, maxCredits: e.target.value })
              }
              variant="outlined"
              margin="dense"
              inputProps={{
                min: 0.1,
                max: 10,
                step: 0.1,
              }}
            />
          </Box>
          <Box sx={{ mt: 2, mb: 1, display: "flex", alignItems: "center" }}>
            <Switch
              checked={isCompulsory(editOutcome)}
              onChange={handleCompulsoryToggle}
              color="primary"
              inputProps={{ "aria-label": "Compulsory outcome toggle" }}
            />
            <Typography>Compulsory Outcome</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditOutcome(false)} style={{ color: '#2196f3' }}>
            CANCEL
          </Button>
          <Button onClick={handleSubmitEditOutcome} style={{ color: '#2196f3' }}>
            SAVE
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Outcome Dialog - SIMPLIFIED */}
      <Dialog open={openOutcome} onClose={() => setOpenOutcome(false)}>
        <DialogTitle>Add Outcome</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption">Topic</Typography>
            <TextField
              fullWidth
              value={newOutcome.topic}
              onChange={(e) =>
                setNewOutcome({ ...newOutcome, topic: e.target.value })
              }
              variant="outlined"
              margin="dense"
            />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption">Credits</Typography>
            <TextField
              fullWidth
              type="number"
              value={newOutcome.credits}
              onChange={(e) =>
                setNewOutcome({ ...newOutcome, credits: e.target.value })
              }
              variant="outlined"
              margin="dense"
              inputProps={{
                min: 0.1,
                max: 10,
                step: 0.1,
              }}
              helperText="Enter a value between 0.1 and 10"
            />
          </Box>
          <Box sx={{ mt: 2, mb: 1, display: "flex", alignItems: "center" }}>
            <Switch
              checked={isCompulsory(newOutcome)}
              onChange={(e) =>
                setNewOutcome({ ...newOutcome, compulsory: e.target.checked })
              }
              color="primary"
              inputProps={{ "aria-label": "Compulsory outcome toggle" }}
            />
            <Typography>Compulsory Outcome</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOutcome(false)} style={{ color: '#2196f3' }}>
            CANCEL
          </Button>
          <Button onClick={handleSubmitOutcome} style={{ color: '#2196f3' }}>
            SAVE
          </Button>
        </DialogActions>
      </Dialog>

      {/* Requirements Dialog */}
      <Dialog
        open={openRequirements}
        onClose={() => setOpenRequirements(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Outcome Requirements</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              {selectedOutcome?.topic}
              {selectedOutcome && (
                <span style={{ marginLeft: "10px", fontStyle: "italic" }}>
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
            - Opiskelija osaa tunnistaa yleisimmät hitsausvirheet, kuten
            huokoset, halkeamat ja epätäydelliset tunkeumat.
            <br />
            - Opiskelija osaa ehdottaa sopivia korjaustoimenpiteitä havaittujen
            hitsausvirheiden korjaamiseksi.
            <br />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequirements(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateRequirement}
            color="primary"
            disabled={updatingRequirements}
          >
            {updatingRequirements ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subject Import Dialog */}
      <FileImporter
  open={subjectImporterOpen}
  onClose={() => setSubjectImporterOpen(false)}
  title="Import Subjects from CSV"
  onImport={handleSubjectImport}
  type="subjects"
  existingItems={subjects}
/>

<FileImporter
  open={outcomeImporterOpen}
  onClose={() => setOutcomeImporterOpen(false)}
  title={`Import Outcomes for ${
    selectedSubjectForImport?.name || "Subject"
  }`}
  onImport={handleOutcomeImport}
  type="outcomes"
  existingItems={selectedSubjectForImport || { outcomes: [] }}
  subjectId={selectedSubjectForImport?._id}
/>
    </>
  );
};

export default ShowSubjects;