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
      header: false,
      skipEmptyLines: true,
      delimiter: ";", // Use semicolon as delimiter
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          setLoading(false);
          return;
        }
        
        try {
          // Check if we have header row and data
          if (results.data.length < 2) {
            setError("The CSV file must contain a header row and at least one data row");
            setLoading(false);
            return;
          }
          
          // Extract header row - first row of the CSV
          const headerRow = results.data[0];
          
          // Verify expected columns exist
          const requiredColumns = ["Topic", "Learning Outcomes", "Obligatory or not", "Requirements", "Outcome minimum credits", "Outcome maximun credits"];
          const missingColumns = requiredColumns.filter(col => !headerRow.includes(col));
          
          if (missingColumns.length > 0) {
            setError(`Missing required columns: ${missingColumns.join(", ")}`);
            setLoading(false);
            return;
          }
          
          // Get column indices
          const topicIndex = headerRow.indexOf("Topic");
          const learningOutcomesIndex = headerRow.indexOf("Learning Outcomes");
          const obligatoryIndex = headerRow.indexOf("Obligatory or not");
          const requirementsIndex = headerRow.indexOf("Requirements");
          const minCreditsIndex = headerRow.indexOf("Outcome minimum credits");
          const maxCreditsIndex = headerRow.indexOf("Outcome maximun credits");
          
          // Process the data into our required format - skip header row
          const processedOutcomes = results.data.slice(1).map(row => {
            // Skip empty rows
            if (row.every(cell => !cell.trim())) {
              return null;
            }
            
            // Parse obligatory field correctly
            let compulsory = true; // default to true
            if (row[obligatoryIndex]) {
              const obligatoryValue = row[obligatoryIndex].trim().toLowerCase();
              compulsory = obligatoryValue === 'true' || obligatoryValue === 'yes' || obligatoryValue === '1';
            }
            
            // Parse credits as number and ensure it's within range
            let credits = parseFloat(row[minCreditsIndex]) || 0;
            credits = Math.max(0.1, Math.min(10, credits)); // Clamp between 0.1 and 10
            
            // Parse requirements
            let requirements = [];
            if (row[requirementsIndex] && row[requirementsIndex].trim()) {
              requirements = row[requirementsIndex].split(',').map(req => req.trim());
            }
            
            return {
              topic: row[topicIndex]?.trim() || "",
              project: row[learningOutcomesIndex]?.trim() || "", // Map Learning Outcomes to project
              credits: credits,
              compulsory: compulsory,
              requirements: requirements
            };
          }).filter(Boolean); // Remove null entries
          
          if (processedOutcomes.length === 0) {
            setError("No valid outcome data found in the CSV file");
            setLoading(false);
            return;
          }
          
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
        navigate("/Teacher/dashboard/subjects");
      }, 2000);
      
    } catch (err) {
      setError(`Import failed: ${err.response?.data?.message || err.message || "Unknown error"}`);
      setLoading(false);
    }
  };
  
  const downloadSampleCSV = () => {
    const csvContent = [
      "Topic;Learning Outcomes;Obligatory or not;Requirements;Outcome minimum credits;Outcome maximun credits",
      "Algebra;Matrix Operations;TRUE;Student can solve linear equations,Student understands matrix multiplication;2;5",
      "Calculus;Derivatives;TRUE;Student can find derivatives of polynomial functions,Student can apply chain rule;3;5",
      "Geometry;Triangles;FALSE;Student can calculate angles,Student understands properties of triangles;2;5"
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
        <IconButton onClick={() => navigate("/Teacher/dashboard/subjects")} sx={{ mr: 2 }}>
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
          Your CSV file should have the following columns (semicolon-separated):
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
                <TableCell>Topic</TableCell>
                <TableCell>The topic name for the outcome</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Learning Outcomes</TableCell>
                <TableCell>The learning outcomes for the topic</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Obligatory or not</TableCell>
                <TableCell>Whether the outcome is required (TRUE/FALSE)</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Requirements</TableCell>
                <TableCell>Comma-separated list of requirements</TableCell>
                <TableCell>No</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Outcome minimum credits</TableCell>
                <TableCell>Minimum credit value for the outcome</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Outcome maximun credits</TableCell>
                <TableCell>Maximum credit value for the outcome</TableCell>
                <TableCell>Yes</TableCell>
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
                  <TableCell><strong>Learning Outcome</strong></TableCell>
                  <TableCell><strong>Minimun Credits</strong></TableCell>
                  <TableCell><strong>Maximun Credits</strong></TableCell>
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