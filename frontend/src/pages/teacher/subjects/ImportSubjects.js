import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import axios from "axios";
import { 
  Paper, 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import { getSubjectList } from "../../../redux/subjectrelated/subjectHandle";

const parseDecimalValue = (value) => {
  if (!value || value === '') return null;
  
  // Handle both comma and period as decimal separators
  const valueStr = String(value).trim();
  const normalizedValue = valueStr.replace(',', '.');
  
  // Parse the normalized value
  const parsed = parseFloat(normalizedValue);
  console.log(`Parsing decimal value: "${valueStr}" → "${normalizedValue}" → ${parsed}`);
  
  return isNaN(parsed) ? null : parsed;
};

const ImportSubjects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [csvFile, setCsvFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [existingSubjects, setExistingSubjects] = useState([]);
  const [duplicateDialog, setDuplicateDialog] = useState({
    open: false,
    duplicates: [],
    data: null,
    message: ""
  });
  
  // Fetch existing subjects when component mounts
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/subjects");
        setExistingSubjects(response.data);
      } catch (err) {
        console.error("Error fetching existing subjects:", err);
        setError("Failed to fetch existing subjects");
      }
    };
    
    fetchSubjects();
  }, []);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    setError("");
    setSuccess("");
    setParsedData([]);
    setPreviewMode(false);
  };
  
  const parseCSV = () => {
    if (!csvFile) {
      setError("Please select a CSV file first");
      return;
    }
    
    setLoading(true);
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",", // Explicitly set the delimiter to comma
      quoteChar: '"', // Use double quotes for quoted fields
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          setLoading(false);
          return;
        }
        
        try {
          // Check if the data has the expected structure
          if (results.data.length > 0) {
            const firstRow = results.data[0];
            if (!firstRow["Subject Name"] && !firstRow["Subject Credits"]) {
              throw new Error("CSV format issue: Make sure your CSV has proper column headers and comma separators. Try downloading our template for reference.");
            }
          }
          
          // Process the data into our required format
          const processedData = processCSVData(results.data);
          
          // Check for duplicates
          const duplicateSubjects = findDuplicateSubjects(processedData);
          
          if (duplicateSubjects.length > 0) {
            setDuplicateDialog({
              open: true,
              duplicates: duplicateSubjects,
              data: processedData,
              message: `Found ${duplicateSubjects.length} subject${duplicateSubjects.length > 1 ? 's' : ''} that already exist in the system.`
            });
          } else {
            // No duplicates, proceed normally
            setParsedData(processedData);
            setPreviewMode(true);
          }
          
          setLoading(false);
        } catch (err) {
          setError(`Error processing CSV data: ${err.message}`);
          setLoading(false);
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setLoading(false);
      }
    });
  };
  
  // Find subjects in the new data that already exist in the system
  const findDuplicateSubjects = (newSubjects) => {
    return newSubjects.filter(newSubject => 
      existingSubjects.some(existingSubject => 
        existingSubject.name.toLowerCase() === newSubject.name.toLowerCase()
      )
    );
  };
  
  // Process CSV data into the format needed for our API
  const processCSVData = (data) => {
    const subjectMap = new Map();
    
    data.forEach(row => {
      // Required fields validation
      if (!row["Subject Name"] || !row["Subject Credits"]) {
        throw new Error("Each row must have Subject Name and Subject Credits");
      }
      
      // Process subject data
      const subjectName = row["Subject Name"].trim();
      
      // Parse subject credits with comma support
      const subjectCreditsStr = row["Subject Credits"] ? String(row["Subject Credits"]).trim() : "";
      const parsedSubjectCredits = parseDecimalValue(subjectCreditsStr);
      
      if (parsedSubjectCredits === null) {
        throw new Error(`Invalid credits value for subject: ${subjectName}`);
      }
      
      // Apply validation for subject credits (typically whole numbers but allow decimals)
      const subjectCredits = Math.max(0.1, Math.min(parsedSubjectCredits, 100)); 
      
      // Add subject if not already added
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          name: subjectName,
          credits: subjectCredits,
          outcomes: []
        });
      }
      
      // Process outcome if it exists
      if (row["Outcome Topic"] && row["Outcome Project"] && row["Outcome Credits"]) {
        // Parse outcome credits with comma support
        const outcomeCreditsStr = row["Outcome Credits"] ? String(row["Outcome Credits"]).trim() : "";
        const parsedOutcomeCredits = parseDecimalValue(outcomeCreditsStr);
        
        if (parsedOutcomeCredits === null) {
          throw new Error(`Invalid credits value for outcome in subject: ${subjectName}`);
        }
        
        // Apply validation - ensure credits are between 0.1 and 10
        const outcomeCredits = Math.max(0.1, Math.min(parsedOutcomeCredits, 10));
        
        // Parse max credits if present
        const outcomeMaxCreditsStr = row["Outcome Maximum Credits"] ? 
          String(row["Outcome Maximum Credits"]).trim() : "";
        
        let outcomeMaxCredits = outcomeCredits; // Default to min credits
        if (outcomeMaxCreditsStr) {
          const parsedMaxCredits = parseDecimalValue(outcomeMaxCreditsStr);
          if (parsedMaxCredits !== null) {
            outcomeMaxCredits = Math.max(0.1, Math.min(parsedMaxCredits, 10));
          }
        }
        
        // Parse compulsory field if it exists, default to true if not specified
        let compulsory = true;
        if (row["Outcome Compulsory"] !== undefined) {
          // Handle different possible values
          if (typeof row["Outcome Compulsory"] === 'string') {
            const value = row["Outcome Compulsory"].trim().toLowerCase();
            compulsory = value !== 'false' && value !== 'no' && value !== '0';
          } else if (typeof row["Outcome Compulsory"] === 'boolean') {
            compulsory = row["Outcome Compulsory"];
          } else if (typeof row["Outcome Compulsory"] === 'number') {
            compulsory = row["Outcome Compulsory"] !== 0;
          }
        }
        
        // Check for duplicate outcomes within this import
        const subject = subjectMap.get(subjectName);
        const isDuplicateOutcome = subject.outcomes.some(outcome => 
          outcome.topic.toLowerCase() === row["Outcome Topic"].trim().toLowerCase() && 
          outcome.project.toLowerCase() === row["Outcome Project"].trim().toLowerCase()
        );
        
        // Only add if not a duplicate
        if (!isDuplicateOutcome) {
          const outcome = {
            topic: row["Outcome Topic"].trim(),
            project: row["Outcome Project"].trim(),
            credits: outcomeCredits,
            maxCredits: outcomeMaxCredits,
            compulsory: compulsory,
            requirements: []
          };
          
          // Add requirements if they exist
          // Requirements are expected in columns: Requirement 1, Requirement 2, etc.
          for (let i = 1; i <= 10; i++) {
            const requirementKey = `Requirement ${i}`;
            if (row[requirementKey] && row[requirementKey].trim()) {
              outcome.requirements.push(row[requirementKey].trim());
            }
          }
          
          // Add outcome to subject
          subject.outcomes.push(outcome);
        }
      }
    });
    
    return Array.from(subjectMap.values());
  };
  
  
  // Handle dialog close and reject duplicates
  const handleRejectDuplicates = () => {
    // Filter out duplicate subjects from the data
    const filteredData = duplicateDialog.data.filter(subject => 
      !duplicateDialog.duplicates.some(dup => 
        dup.name.toLowerCase() === subject.name.toLowerCase()
      )
    );
    
    // If we still have data after filtering, show it
    if (filteredData.length > 0) {
      setParsedData(filteredData);
      setPreviewMode(true);
      setDuplicateDialog({ open: false, duplicates: [], data: null, message: "" });
    } else {
      setError("No unique subjects to import after removing duplicates");
      setDuplicateDialog({ open: false, duplicates: [], data: null, message: "" });
    }
  };
  
  // Handle dialog close and accept duplicates
  const handleAcceptDuplicates = () => {
    setParsedData(duplicateDialog.data);
    setPreviewMode(true);
    setDuplicateDialog({ open: false, duplicates: [], data: null, message: "" });
  };
  
  const handleImport = async () => {
    if (parsedData.length === 0) {
      setError("No data to import");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Import subjects one by one
      let successCount = 0;
      let updateCount = 0;
      let errorCount = 0;
      
      for (const subject of parsedData) {
        try {
          // Check if subject already exists
          const existingSubject = existingSubjects.find(existing => 
            existing.name.toLowerCase() === subject.name.toLowerCase()
          );
          
          let subjectId;
          
          if (existingSubject) {
            // Update existing subject
          await axios.put(
              `http://localhost:5000/api/subjects/${existingSubject._id}`, 
              { name: subject.name, credits: subject.credits }
            );
            subjectId = existingSubject._id;
            updateCount++;
          } else {
            // Create new subject
            const subjectResponse = await axios.post(
              "http://localhost:5000/api/subjects", 
              { name: subject.name, credits: subject.credits }
            );
            subjectId = subjectResponse.data.subject._id;
            successCount++;
          }
          
          // Process outcomes for this subject
          if (subject.outcomes.length > 0) {
            // Get existing outcomes for the subject if it already existed
            let existingOutcomes = [];
            if (existingSubject) {
              const subjectDetails = await axios.get(`http://localhost:5000/api/subjects/${subjectId}`);
              existingOutcomes = subjectDetails.data.outcomes || [];
            }
            
            // Add each outcome
            for (const outcome of subject.outcomes) {
              // Check if this outcome already exists (by topic and project)
              const existingOutcome = existingOutcomes.find(existing => 
                existing.topic.toLowerCase() === outcome.topic.toLowerCase() &&
                existing.project.toLowerCase() === outcome.project.toLowerCase()
              );
              
              if (existingOutcome) {
                // Update existing outcome
                await axios.put(
                  `http://localhost:5000/api/subjects/${subjectId}/outcomes/${existingOutcome._id}`,
                  { 
                    topic: outcome.topic, 
                    project: outcome.project, 
                    credits: outcome.credits,
                    compulsory: outcome.compulsory,
                    requirements: outcome.requirements
                  }
                );
              } else {
                // Add new outcome
                const outcomeResponse = await axios.post(
                  `http://localhost:5000/api/subjects/${subjectId}/outcomes`,
                  { 
                    topic: outcome.topic, 
                    project: outcome.project, 
                    credits: outcome.credits,
                    compulsory: outcome.compulsory
                  }
                );
                
                // Add requirements if there are any
                if (outcome.requirements.length > 0) {
                  const outcomeId = outcomeResponse.data.subject.outcomes[outcomeResponse.data.subject.outcomes.length - 1]._id;
                  
                  await axios.put(
                    `http://localhost:5000/api/subjects/${subjectId}/outcomes/${outcomeId}`,
                    { requirements: outcome.requirements }
                  );
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error importing subject ${subject.name}:`, err);
          errorCount++;
        }
      }
      
      let message = "";
      if (successCount > 0) message += `Added ${successCount} new subjects. `;
      if (updateCount > 0) message += `Updated ${updateCount} existing subjects. `;
      if (errorCount > 0) message += `Failed to import ${errorCount} subjects.`;
      else message += "All subjects imported successfully!";
      
      setSuccess(message);
      
      // Refresh the subject list
      dispatch(getSubjectList());
      
      // Fetch updated subjects list
      const response = await axios.get("http://localhost:5000/api/subjects");
      setExistingSubjects(response.data);
      
      // Navigate back to the subjects list after a delay
      setTimeout(() => {
        navigate("/Teacher/dashboard/subjects");
      }, 2000);
      
    } catch (err) {
      setError(`Import failed: ${err.message || "Unknown error occurred"}`);
    } finally {
      setLoading(false);
    }
  };
  
  const downloadSampleCSV = () => {
    // Create an array of sample data rows
    const headers = ["SN", "Subject Name", "Subject Credits", "Outcome Topic", "Outcome Project", "Outcome Credits", "Outcome Compulsory", "Requirement 1", "Requirement 2", "Requirement 3"];
    
    const data = [
      ["1", "Mathematics", "5", "Algebra", "Matrix Operations", "2", "true", "Student can solve linear equations", "Student understands matrix multiplication", "Student can apply matrices to practical problems"],
      ["1", "Mathematics", "5", "Calculus", "Derivatives", "3", "true", "Student can find derivatives of polynomial functions", "Student can apply chain rule", "Student understands practical applications"],
      ["2", "Physics", "4", "Mechanics", "Force Analysis", "2", "true", "Student can apply Newton's laws", "Student can solve basic mechanics problems", "Student can analyze force diagrams"],
      ["2", "Physics", "4", "Thermodynamics", "Heat Transfer Project", "2", "false", "Student understands laws of thermodynamics", "Student can calculate entropy", "Student can explain heat transfer mechanisms"]
    ];
    
    // Create the CSV content with proper escaping and quoting
    let csvContent = headers.join(",") + "\n";
    
    data.forEach(row => {
      // Process each field to ensure proper CSV format
      const processedRow = row.map(field => {
        // If the field contains a comma, quote it
        if (field.includes(",")) {
          return `"${field}"`;
        }
        return field;
      });
      
      csvContent += processedRow.join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "subject_template.csv");
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      <Paper sx={{ padding: 3, width: "80%", margin: "auto", marginTop: 5 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          Import Subjects from CSV
          <Tooltip title="Upload a CSV file to import multiple subjects, outcomes, and requirements at once">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Upload a CSV file with the following columns:
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Column</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Required</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>A</TableCell>
                  <TableCell>SN</TableCell>
                  <TableCell>Serial Number for the subject</TableCell>
                  <TableCell>No</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>B</TableCell>
                  <TableCell>Subject Name</TableCell>
                  <TableCell>Name of the subject</TableCell>
                  <TableCell>Yes</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>C</TableCell>
                  <TableCell>Subject Credits</TableCell>
                  <TableCell>Number of credits for the subject</TableCell>
                  <TableCell>Yes</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>D</TableCell>
                  <TableCell>Outcome Topic</TableCell>
                  <TableCell>Topic name for the outcome</TableCell>
                  <TableCell>For outcomes</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>E</TableCell>
                  <TableCell>Outcome Project</TableCell>
                  <TableCell>Project name for the outcome</TableCell>
                  <TableCell>For outcomes</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>F</TableCell>
                  <TableCell>Outcome Credits</TableCell>
                  <TableCell>Number of credits for the outcome</TableCell>
                  <TableCell>For outcomes</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>G</TableCell>
                  <TableCell>Outcome Compulsory</TableCell>
                  <TableCell>Whether the outcome is compulsory (true/false)</TableCell>
                  <TableCell>No (defaults to true)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>H, I, J...</TableCell>
                  <TableCell>Requirement 1, 2, 3...</TableCell>
                  <TableCell>Requirements for the outcome</TableCell>
                  <TableCell>No</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Important:</strong> When saving CSV files from Excel or other spreadsheet software, make sure to:
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Save as "CSV (Comma delimited) (*.csv)"</li>
              <li>Ensure column headers match exactly as shown above</li>
              <li>If your data contains commas, most spreadsheet programs will automatically add quotes around those fields</li>
            </ul>
          </Alert>
          
          <Button 
            variant="outlined" 
            onClick={downloadSampleCSV} 
            startIcon={<DownloadIcon />}
            sx={{ mt: 1 }}
          >
            Download Sample Template
          </Button>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mr: 2 }}
          >
            Choose CSV File
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          <Typography>
            {csvFile ? csvFile.name : "No file selected"}
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", mb: 2 }}>
          <Button
            variant="outlined"
            onClick={parseCSV}
            disabled={!csvFile || loading}
            sx={{ mr: 2 }}
          >
            Preview Data
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleImport}
            disabled={!previewMode || loading}
          >
            Import Now
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        )}
        
        {previewMode && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Preview Import Data ({parsedData.length} subjects)
            </Typography>
            
            {parsedData.map((subject, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    <strong>{subject.name}</strong> - {subject.credits} Credits
                    ({subject.outcomes.length} Outcomes)
                    {existingSubjects.some(es => es.name.toLowerCase() === subject.name.toLowerCase()) && (
                      <Chip 
                        size="small" 
                        label="Will update existing" 
                        color="warning" 
                        sx={{ ml: 2 }} 
                      />
                    )}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {subject.outcomes.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><strong>Topic</strong></TableCell>
                            <TableCell><strong>Project</strong></TableCell>
                            <TableCell><strong>Credits</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Requirements</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {subject.outcomes.map((outcome, i) => {
                            // Check if this is a duplicate outcome in an existing subject
                            const existingSubject = existingSubjects.find(es => 
                              es.name.toLowerCase() === subject.name.toLowerCase()
                            );
                            
                            const isDuplicate = existingSubject && existingSubject.outcomes && 
                              existingSubject.outcomes.some(eo => 
                                eo.topic.toLowerCase() === outcome.topic.toLowerCase() &&
                                eo.project.toLowerCase() === outcome.project.toLowerCase()
                              );
                              
                            return (
                              <TableRow key={i}>
                                <TableCell>{outcome.topic}</TableCell>
                                <TableCell>{outcome.project}</TableCell>
                                <TableCell>{outcome.credits}</TableCell>
                                <TableCell>
                                  <Chip 
                                    size="small" 
                                    label={outcome.compulsory ? "Compulsory" : "Optional"} 
                                    color={outcome.compulsory ? "primary" : "default"}
                                  />
                                  {isDuplicate && (
                                    <Chip 
                                      size="small" 
                                      label="Will update" 
                                      color="warning" 
                                      sx={{ ml: 1 }} 
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {outcome.requirements.length > 0 ? (
                                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                                      {outcome.requirements.map((req, j) => (
                                        <li key={j}>{req}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    "No requirements"
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2">No outcomes defined</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Paper>
      
      {/* Duplicate Subjects Dialog */}
      <Dialog
        open={duplicateDialog.open}
        onClose={handleRejectDuplicates}
        aria-labelledby="duplicate-dialog-title"
        aria-describedby="duplicate-dialog-description"
      >
        <DialogTitle id="duplicate-dialog-title">
          Duplicate Subjects Detected
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="duplicate-dialog-description">
            {duplicateDialog.message}
          </DialogContentText>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Subject Name</strong></TableCell>
                  <TableCell><strong>Current Credits</strong></TableCell>
                  <TableCell><strong>New Credits</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {duplicateDialog.duplicates.map((subject, index) => {
                  const existingSubject = existingSubjects.find(es => 
                    es.name.toLowerCase() === subject.name.toLowerCase()
                  );
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{existingSubject ? existingSubject.credits : 'N/A'}</TableCell>
                      <TableCell>{subject.credits}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <DialogContentText sx={{ mt: 2 }}>
            What would you like to do with these duplicates?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectDuplicates} color="secondary">
            Skip Duplicates
          </Button>
          <Button onClick={handleAcceptDuplicates} color="primary" variant="contained">
            Update Existing Subjects
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImportSubjects;