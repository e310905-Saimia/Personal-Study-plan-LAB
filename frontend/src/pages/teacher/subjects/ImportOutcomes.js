import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
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
  Chip,
  Divider,
  IconButton
} from "@mui/material";
import { ArrowBack, Upload as UploadIcon, Download, Visibility } from "@mui/icons-material";
import { getSubjectList } from "../../../redux/subjectrelated/subjectHandle";

const ImportOutcomes = () => {
  const { subjectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [parsedOutcomes, setParsedOutcomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  
  // Fetch subject details
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/subjects/${subjectId}`);
        setSubject(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch subject details");
        setLoading(false);
      }
    };
    
    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    setError("");
    setSuccess("");
    setParsedOutcomes([]);
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
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          setLoading(false);
          return;
        }
        
        try {
          // Process the data into our required format
          const processedOutcomes = processCSVData(results.data);
          setParsedOutcomes(processedOutcomes);
          setPreviewMode(true);
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
  
  // Process CSV data into the format needed for outcomes
  const processCSVData = (data) => {
    return data.map(row => {
      // Required fields validation
      if (!row["Outcome Topic"] || !row["Outcome Project"] || !row["Outcome Credits"]) {
        throw new Error("Each row must have Outcome Topic, Outcome Project, and Outcome Credits");
      }
      
      // Parse credits
      const credits = parseInt(row["Outcome Credits"], 10);
      if (isNaN(credits)) {
        throw new Error(`Invalid credits value for outcome: ${row["Outcome Topic"]}`);
      }
      
      // Parse compulsory field
      let compulsory = true; // Default to true
      if (row["Outcome Compulsory"] !== undefined) {
        if (typeof row["Outcome Compulsory"] === 'string') {
          const value = row["Outcome Compulsory"].trim().toLowerCase();
          compulsory = value !== 'false' && value !== 'no' && value !== '0';
        } else if (typeof row["Outcome Compulsory"] === 'boolean') {
          compulsory = row["Outcome Compulsory"];
        } else if (typeof row["Outcome Compulsory"] === 'number') {
          compulsory = row["Outcome Compulsory"] !== 0;
        }
      }
      
      // Create outcome object
      const outcome = {
        topic: row["Outcome Topic"].trim(),
        project: row["Outcome Project"].trim(),
        credits: credits,
        compulsory: compulsory,
        requirements: []
      };
      
      // Add requirements if they exist
      for (let i = 1; i <= 10; i++) {
        const requirementKey = `Requirement ${i}`;
        if (row[requirementKey] && row[requirementKey].trim()) {
          outcome.requirements.push(row[requirementKey].trim());
        }
      }
      
      return outcome;
    });
  };
  
  const handleImport = async () => {
    if (parsedOutcomes.length === 0) {
      setError("No outcomes to import");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await axios.post(`http://localhost:5000/api/subjects/${subjectId}/outcomes/import`, {
        outcomes: parsedOutcomes
      });
      
      setSuccess(response.data.message || "Outcomes imported successfully");
      
      // Refresh subject list
      dispatch(getSubjectList());
      
      // Navigate back to subjects list after a delay
      setTimeout(() => {
        navigate("/Teacher/subjects");
      }, 2000);
      
    } catch (err) {
      setError(`Import failed: ${err.response?.data?.message || err.message || "Unknown error"}`);
      setLoading(false);
    }
  };
  
  const downloadSampleCSV = () => {
    const csvContent = [
      "Outcome Topic,Outcome Project,Outcome Credits,Outcome Compulsory,Requirement 1,Requirement 2,Requirement 3",
      "Algebra,Matrix Operations,2,true,Student can solve linear equations,Student understands matrix multiplication,Student can apply matrices to practical problems",
      "Calculus,Derivatives,3,true,Student can find derivatives of polynomial functions,Student can apply chain rule,Student understands practical applications",
      "Geometry,Triangles,2,false,Student can calculate angles,Student understands properties of triangles,Student can apply Pythagorean theorem"
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "outcome_import_template.csv");
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Paper sx={{ padding: 3, maxWidth: "800px", margin: "auto", mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/Teacher/subjects")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">
          Import Outcomes for {subject ? subject.name : "Subject"}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Upload a CSV file with outcome information for this subject:
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Your CSV file should have the following columns:
        </Typography>
        
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell><strong>Column Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Required</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Outcome Topic</TableCell>
                <TableCell>The topic name for the outcome</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Outcome Project</TableCell>
                <TableCell>The project name for the outcome</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Outcome Credits</TableCell>
                <TableCell>Number of credits for the outcome</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Outcome Compulsory</TableCell>
                <TableCell>Whether the outcome is compulsory (true/false)</TableCell>
                <TableCell>No (defaults to true)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Requirement 1, 2, 3...</TableCell>
                <TableCell>Requirements for the outcome</TableCell>
                <TableCell>No</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Button 
          variant="outlined" 
          startIcon={<Download />}
          onClick={downloadSampleCSV}
        >
          Download Sample Template
        </Button>
      </Box>
      
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
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
      
      <Box sx={{ display: "flex", mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Visibility />}
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
          Import Outcomes
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {previewMode && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Preview Outcomes ({parsedOutcomes.length})
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><strong>Topic</strong></TableCell>
                  <TableCell><strong>Project</strong></TableCell>
                  <TableCell><strong>Credits</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Requirements</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedOutcomes.map((outcome, index) => (
                  <TableRow key={index}>
                    <TableCell>{outcome.topic}</TableCell>
                    <TableCell>{outcome.project}</TableCell>
                    <TableCell>{outcome.credits}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={outcome.compulsory ? "Compulsory" : "Optional"} 
                        color={outcome.compulsory ? "primary" : "default"} 
                      />
                    </TableCell>
                    <TableCell>
                      {outcome.requirements.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {outcome.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      ) : (
                        "No requirements"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  );
};

export default ImportOutcomes;