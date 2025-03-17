import React, { useState } from "react";
import Papa from "papaparse";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const FileImporter = ({
  open,
  onClose,
  title,
  onImport,
  type,
  existingItems = [],
  subjectId = null,
  sampleFileContent,
}) => {
  const [csvFile, setCsvFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [duplicateDialog, setDuplicateDialog] = useState({
    open: false,
    duplicates: [],
    data: null,
    message: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    setError("");
    setParsedData([]);
    setPreviewMode(false);
  };

  // Helper function to find column index based on possible header names
  const findColumnIndex = (headers, possibleNames) => {
    // First try exact matches
    const exactIndex = headers.findIndex(header => 
      header && possibleNames.some(name => 
        header.toLowerCase().trim() === name.toLowerCase().trim()
      )
    );
    
    if (exactIndex !== -1) {
      return exactIndex;
    }
    
    // Then try partial matches
    const partialIndex = headers.findIndex(header => 
      header && possibleNames.some(name => 
        header.toLowerCase().trim().includes(name.toLowerCase().trim())
      )
    );
    
    if (partialIndex !== -1) {
      return partialIndex;
    }
    
    // If still not found, try a more flexible approach (with fuzzy matching)
    // For example: "topic" should match columns like "Subject Topic"
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (!header) continue;
      
      const headerLower = header.toLowerCase().trim();
      
      for (const name of possibleNames) {
        const nameLower = name.toLowerCase().trim();
        
        // Check if the key parts of the name are in the header
        const nameParts = nameLower.split(' ');
        if (nameParts.some(part => headerLower.includes(part) && part.length > 2)) {
          return i;
        }
      }
    }
    
    return -1; // Not found with any method
  };
  
  // Helper function to safely get a value at an index
  const getValueAt = (row, index, defaultValue) => {
    if (index === -1 || index >= row.length) {
      return defaultValue;
    }
    return row[index] !== undefined && row[index] !== null ? row[index] : defaultValue;
  };

  const parseCSV = () => {
    if (!csvFile) {
      setError("Please select a CSV file first");
      return;
    }
  
    setLoading(true);
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      
      // Fix any line breaks and create a consistent version
      const fixedContent = content.replace(/\r\n|\r|\n/g, '\n');
      
      // Try to detect the delimiter and structure
      let detectedDelimiter = ";";  // Default to semicolon
      const firstLine = fixedContent.split('\n')[0];
      
      // Count occurrences of potential delimiters
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const tabCount = (firstLine.match(/\t/g) || []).length;
      
      console.log("Delimiter counts:", { semicolonCount, commaCount, tabCount });
      
      // Use the delimiter with the most occurrences
      if (commaCount > semicolonCount && commaCount > tabCount) {
        detectedDelimiter = ",";
      } else if (tabCount > semicolonCount && tabCount > commaCount) {
        detectedDelimiter = "\t";
      }
      
      console.log("Using delimiter:", detectedDelimiter);
      
      // First, try parsing with auto-detection of delimiters
      Papa.parse(fixedContent, {
        delimitersToGuess: [',', ';', '\t'],
        header: false,
        skipEmptyLines: true,
        comments: "#",
        quoteChar: '"',
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn("Auto-detection parsing errors, trying explicit delimiter:", results.errors);
            
            // Try again with the explicitly detected delimiter
            Papa.parse(fixedContent, {
              delimiter: detectedDelimiter,
              header: false,
              skipEmptyLines: true,
              comments: "#",
              quoteChar: '"',
              complete: handleParsedData,
              error: handleParseError
            });
          } else {
            handleParsedData(results);
          }
        },
        error: handleParseError
      });
    };
  
    reader.readAsText(csvFile);
  };
  
  // Handle successfully parsed data
  const handleParsedData = (results) => {
    if (results.errors.length > 0) {
      console.error("CSV parsing errors:", results.errors);
      setError(`Error parsing CSV: ${results.errors[0].message}`);
      setLoading(false);
      return;
    }
  
    // Log the raw data for debugging
    console.log("Raw parsed CSV data (first 3 rows):", results.data.slice(0, 3));
  
    try {
      // Process the data based on the import type
      let processedData;
      let duplicates = [];
  
      if (type === "subjects") {
        processedData = processSubjectsData(results.data);
        duplicates = findDuplicateSubjects(processedData);
      } else if (type === "outcomes") {
        if (!subjectId) {
          throw new Error("No subject selected for importing outcomes");
        }
        processedData = processOutcomesData(results.data);
        duplicates = findDuplicateOutcomes(processedData);
      }
  
      // Log the final processed data
      console.log(`Processed ${type} data:`, processedData);
  
      if (duplicates.length > 0) {
        setDuplicateDialog({
          open: true,
          duplicates: duplicates,
          data: processedData,
          message: `Found ${duplicates.length} ${
            type === "subjects" ? "subject" : "outcome"
          }${duplicates.length > 1 ? "s" : ""} that already exist.`,
        });
      } else {
        setParsedData(processedData);
        setPreviewMode(true);
      }
  
      setLoading(false);
    } catch (err) {
      console.error("Error processing CSV:", err);
      setError(`Error processing CSV data: ${err.message}`);
      setLoading(false);
    }
  };
  
  // Handle parsing errors
  const handleParseError = (error) => {
    console.error("CSV parsing error:", error);
    setError(`Error parsing CSV: ${error.message}`);
    setLoading(false);
  };
   
  // Process subjects data from CSV with improved error handling
  const processSubjectsData = (data) => {
    // Ensure we have data to process
    if (!data || data.length < 2) {
      throw new Error("CSV file has no data or is missing header row");
    }
  
    // Get the header row
    const headerRow = data[0];
    console.log("Header row:", headerRow);
  
    // If headers are in a single column (e.g., semicolon-delimited in a comma CSV), split them
    let headers = headerRow;
    if (headerRow.length === 1 && headerRow[0].includes(';')) {
      headers = headerRow[0].split(';');
      console.log("Detected semicolon-separated headers in a single column, split to:", headers);
      
      // We need to reformat all data rows as well
      data = data.map(row => {
        if (row.length === 1 && row[0].includes(';')) {
          return row[0].split(';');
        }
        return row;
      });
    }
    
    console.log("Headers being used:", headers);
  
    // Try to find column indices using flexible matching
    const topicIndex = findColumnIndex(headers, ["topic", "subject", "subject name"]);
    const outcomeIndex = findColumnIndex(headers, ["learning outcomes", "outcome", "learning outcome"]);
    const compulsoryIndex = findColumnIndex(headers, ["compulsary or not", "compulsory", "required", "obligatory"]);
    const requirementsIndex = findColumnIndex(headers, ["requirements", "requirement"]);
    const minCreditsIndex = findColumnIndex(headers, ["outcome minimum credits", "min credits", "minimum credits"]);
    const maxCreditsIndex = findColumnIndex(headers, ["outcome maximun credits", "outcome maximum credits", "max credits", "maximum credits"]);
  
    console.log("Found column indices:", {
      topicIndex, outcomeIndex, compulsoryIndex, requirementsIndex, minCreditsIndex, maxCreditsIndex
    });
  
    // If we couldn't find critical columns, throw an error
    if (topicIndex === -1) {
      throw new Error("Could not find a column for Subject/Topic in the CSV");
    }
    
    if (outcomeIndex === -1) {
      throw new Error("Could not find a column for Learning Outcomes in the CSV");
    }
  
    // Skip header row
    const dataRows = data.slice(1);
    const subjectMap = new Map();
  
    dataRows.forEach((row, rowIndex) => {
      // Skip empty rows
      if (!row || row.length === 0 || (row.length === 1 && !row[0])) {
        console.warn("Skipping empty row");
        return;
      }
  
      try {
        // Get the required fields
        const topic = getValueAt(row, topicIndex, "").trim();
        const learningOutcome = getValueAt(row, outcomeIndex, "").trim();
        
        // Skip rows without required data
        if (!topic) {
          console.warn(`Skipping row ${rowIndex + 2} with no topic`);
          return;
        }
        
        if (!learningOutcome) {
          console.warn(`Skipping row ${rowIndex + 2} with no learning outcome`);
          return;
        }
        
        // Get the optional fields with defaults
        const compulsoryStr = getValueAt(row, compulsoryIndex, "true");
        const requirementsStr = getValueAt(row, requirementsIndex, "");
        const minCreditsStr = getValueAt(row, minCreditsIndex, "0.1");
        const maxCreditsStr = getValueAt(row, maxCreditsIndex, minCreditsStr);
        
        console.log(`Processing row ${rowIndex + 2}:`, {
          topic, learningOutcome, compulsoryStr, requirementsStr, minCreditsStr, maxCreditsStr
        });
  
        // Create or get the subject
        if (!subjectMap.has(topic)) {
          subjectMap.set(topic, {
            name: topic,
            credits: 1, // Default credit value
            outcomes: []
          });
        }
        
        const subject = subjectMap.get(topic);
  
        // Parse compulsory status
        let compulsory = true; // Default to true
        if (compulsoryStr) {
          // Convert various representations to boolean
          compulsory = !['false', 'no', '0', 'n', 'false', 'f'].includes(
            String(compulsoryStr).toLowerCase().trim()
          );
        }
  
        // Parse credits
        let minCredits = 0.1; // Default
        try {
          const parsed = parseFloat(minCreditsStr);
          if (!isNaN(parsed)) {
            minCredits = Math.max(0.1, Math.min(parsed, 10)); // Clamp between 0.1 and 10
          }
        } catch (e) {
          console.warn(`Invalid min credits: ${minCreditsStr}, using default 0.1`);
        }
  
        let maxCredits = minCredits; // Default to min
        try {
          const parsed = parseFloat(maxCreditsStr);
          if (!isNaN(parsed)) {
            maxCredits = Math.max(0.1, Math.min(parsed, 10));
          }
        } catch (e) {
          console.warn(`Invalid max credits: ${maxCreditsStr}, using min credits ${minCredits}`);
        }
  
        // Parse requirements - handle quoted strings and different separators
        let requirements = [];
        if (requirementsStr) {
          console.log(`Processing requirements: "${requirementsStr}"`);
          
          // Handle quoted strings
          let cleanedStr = requirementsStr;
          if ((cleanedStr.startsWith('"') && cleanedStr.endsWith('"')) || 
              (cleanedStr.startsWith("'") && cleanedStr.endsWith("'"))) {
            cleanedStr = cleanedStr.substring(1, cleanedStr.length - 1);
          }
          
          // Try to intelligently split requirements
          if (cleanedStr.includes(',')) {
            requirements = cleanedStr.split(',');
          } else if (cleanedStr.includes('\n')) {
            requirements = cleanedStr.split(/\r?\n/);
          } else {
            requirements = [cleanedStr];
          }
          
          // Clean up and remove empty items
          requirements = requirements
            .map(req => req.trim())
            .filter(req => req.length > 0);
          
          console.log("Parsed requirements:", requirements);
        }
  
        // Check for duplicate outcomes
        const isDuplicateOutcome = subject.outcomes.some(
          existing => existing.topic.toLowerCase() === learningOutcome.toLowerCase()
        );
  
        if (!isDuplicateOutcome) {
          const outcome = {
            topic: learningOutcome,
            project: learningOutcome, // Use learning outcome as project by default
            credits: minCredits,
            maxCredits: maxCredits,
            compulsory: compulsory,
            requirements: requirements
          };
  
          subject.outcomes.push(outcome);
          console.log(`Added outcome: ${learningOutcome} to subject: ${topic}`);
        } else {
          console.warn(`Skipping duplicate outcome: ${learningOutcome} for subject: ${topic}`);
        }
      } catch (err) {
        console.error(`Error processing row ${rowIndex + 2}:`, err);
      }
    });
  
    // Convert map to array of subjects
    const result = Array.from(subjectMap.values());
    
    // Final validation
    if (result.length === 0) {
      throw new Error("No valid subjects found in the CSV file");
    }
    
    console.log("Final parsed subjects:", result);
    return result;
  };

  // Process outcomes data from CSV
  // Enhanced processOutcomesData function with improved requirements handling
const processOutcomesData = (data) => {
  // Ensure we have data to process
  if (!data || data.length < 2) {
    throw new Error("CSV file has no data or is missing header row");
  }

  // Get the header row and validate it
  const headerRow = data[0];
  console.log("Header row for outcomes:", headerRow);

  // If the header is a single column with semicolons, split it
  let headers = headerRow;
  if (headerRow.length === 1 && headerRow[0].includes(';')) {
    headers = headerRow[0].split(';');
    console.log("Split headers for outcomes:", headers);
    
    // Reformat all data rows
    data = data.map(row => {
      if (row.length === 1 && row[0].includes(';')) {
        return row[0].split(';');
      }
      return row;
    });
  }
  
  console.log("Processed outcomes data structure:", data);

  // Determine column indices based on headers
  const topicIndex = findColumnIndex(headers, ["topic", "subject", "subject name"]);
  const outcomeIndex = findColumnIndex(headers, ["learning outcomes", "outcome", "learning outcome"]);
  const compulsoryIndex = findColumnIndex(headers, ["compulsary or not", "compulsory", "required", "obligatory or not"]);
  const requirementsIndex = findColumnIndex(headers, ["requirements", "requirement"]);
  const minCreditsIndex = findColumnIndex(headers, ["outcome minimum credits", "min credits", "minimum credits"]);
  const maxCreditsIndex = findColumnIndex(headers, ["outcome maximun credits", "outcome maximum credits", "max credits", "maximum credits"]);

  console.log("Column indices found:", {
    topicIndex,
    outcomeIndex,
    compulsoryIndex,
    requirementsIndex,
    minCreditsIndex,
    maxCreditsIndex
  });

  // Skip header row
  const dataRows = data.slice(1);
  const outcomes = [];

  dataRows.forEach((row, rowIndex) => {
    // Skip empty rows
    if (!row || row.length === 0 || (row.length === 1 && !row[0])) {
      console.warn("Skipping empty row");
      return;
    }

    // Extract fields based on determined indices
    const topic = getValueAt(row, topicIndex, "").trim();
    const learningOutcome = getValueAt(row, outcomeIndex, "").trim();
    const compulsoryStr = getValueAt(row, compulsoryIndex, "true");
    const requirementsStr = getValueAt(row, requirementsIndex, "");
    const minCreditsStr = getValueAt(row, minCreditsIndex, "0.1");
    const maxCreditsStr = getValueAt(row, maxCreditsIndex, minCreditsStr);

    console.log(`Outcome data extraction for row ${rowIndex + 2}:`, {
      topic,
      learningOutcome,
      compulsoryStr,
      requirementsStr,
      minCreditsStr,
      maxCreditsStr
    });

    // For outcome import, we need to ensure we have a learning outcome
    if (!learningOutcome) {
      console.warn(`Skipping row ${rowIndex + 2} with no learning outcome:`, row);
      return;
    }

    // Parse compulsory status
    const compulsory = !['false', 'no', '0', 'n', 'false', 'f'].includes(
      String(compulsoryStr).toLowerCase().trim()
    );

    // Parse credits
    const minCredits = parseFloat(minCreditsStr) || 0.1;
    const maxCredits = parseFloat(maxCreditsStr) || minCredits;

    // Parse requirements - ENHANCED HANDLING
    let requirements = [];
    if (requirementsStr) {
      console.log(`Processing requirements string: "${requirementsStr}"`);
      
      // Remove any surrounding quotes
      let cleanedStr = requirementsStr;
      if ((cleanedStr.startsWith('"') && cleanedStr.endsWith('"')) || 
          (cleanedStr.startsWith("'") && cleanedStr.endsWith("'"))) {
        cleanedStr = cleanedStr.substring(1, cleanedStr.length - 1);
      }
      
      // Try different approaches to split requirements
      if (cleanedStr.includes('\n')) {
        // If it contains newlines, split by them first
        requirements = cleanedStr.split(/\r?\n/);
      } else if (cleanedStr.includes(',')) {
        // Then try comma splitting
        requirements = cleanedStr.split(',');
      } else if (cleanedStr.includes(';')) {
        // Then try semicolon splitting
        requirements = cleanedStr.split(';');
      } else {
        // If no delimiter found, treat as a single requirement
        requirements = [cleanedStr];
      }
      
      // Clean up the requirements and remove empty ones
      requirements = requirements
        .map(req => req.trim())
        .filter(req => req.length > 0);
      
      console.log("Final parsed requirements:", requirements);
    }

    // Check for duplicate outcomes
    const isDuplicateOutcome = outcomes.some(
      existing => existing.topic.toLowerCase() === learningOutcome.toLowerCase()
    );

    if (!isDuplicateOutcome) {
      // Create outcome object with all details
      const outcome = {
        topic: learningOutcome,
        project: learningOutcome, // Use learning outcome as project by default
        credits: Math.max(0.1, Math.min(minCredits, 10)),
        maxCredits: Math.max(0.1, Math.min(maxCredits, 10)),
        compulsory: compulsory,
        requirements: requirements
      };

      // Log the full outcome object
      console.log("Adding outcome with full data:", outcome);

      outcomes.push(outcome);
      console.log(`Added outcome '${learningOutcome}' with ${requirements.length} requirements`);
    } else {
      console.warn(`Skipping duplicate outcome '${learningOutcome}'`);
    }
  });

  console.log("Final outcomes to import:", outcomes);
  return outcomes;
};

  // Find duplicate subjects
  const findDuplicateSubjects = (newSubjects) => {
    return newSubjects.filter(newSubject =>
      existingItems.some(
        existingSubject => 
          existingSubject.name.toLowerCase() === newSubject.name.toLowerCase()
      )
    );
  };

  // Find duplicate outcomes
  const findDuplicateOutcomes = (newOutcomes) => {
    // If importing outcomes, check against existing outcomes for the specific subject
    if (!existingItems.outcomes) return [];

    return newOutcomes.filter(newOutcome =>
      existingItems.outcomes.some(
        existingOutcome => 
          existingOutcome.topic.toLowerCase() === newOutcome.topic.toLowerCase()
      )
    );
  };

  // Handle dialog close and reject duplicates
  const handleRejectDuplicates = () => {
    // Filter out duplicate items from the data
    const filteredData =
      type === "subjects"
        ? duplicateDialog.data.filter(
            subject => 
              !duplicateDialog.duplicates.some(
                dup => dup.name.toLowerCase() === subject.name.toLowerCase()
              )
          )
        : duplicateDialog.data.filter(
            outcome => 
              !duplicateDialog.duplicates.some(
                dup => dup.topic.toLowerCase() === outcome.topic.toLowerCase()
              )
          );

    // If we still have data after filtering, show it
    if (filteredData.length > 0) {
      setParsedData(filteredData);
      setPreviewMode(true);
      setDuplicateDialog({
        open: false,
        duplicates: [],
        data: null,
        message: "",
      });
    } else {
      setError(`No unique ${type} to import after removing duplicates`);
      setDuplicateDialog({
        open: false,
        duplicates: [],
        data: null,
        message: "",
      });
    }
  };

  // Handle dialog close and accept duplicates
  const handleAcceptDuplicates = () => {
    setParsedData(duplicateDialog.data);
    setPreviewMode(true);
    setDuplicateDialog({
      open: false,
      duplicates: [],
      data: null,
      message: "",
    });
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    const blob = new Blob([sampleFileContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${type}_import_template.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle the main import function with better error handling
  const handleImport = () => {
    if (parsedData.length === 0) {
      setError(`No ${type} to import`);
      return;
    }
    
    try {
      // Ensure correct data structure based on import type
      if (type === "subjects") {
        // Log the data we're about to send
        console.log("Importing subjects with outcomes:", parsedData);
        
        // Make sure the data structure matches what ShowSubjects.handleSubjectImport expects
        const subjectsWithOutcomes = parsedData.map(subject => {
          return {
            name: subject.name,
            credits: subject.credits || 1,
            outcomes: (subject.outcomes || []).map(outcome => ({
              topic: outcome.topic,
              project: outcome.project || outcome.topic,
              credits: parseFloat(outcome.credits) || 0.1,
              maxCredits: parseFloat(outcome.maxCredits) || parseFloat(outcome.credits) || 0.1,
              compulsory: outcome.compulsory !== undefined ? outcome.compulsory : true,
              requirements: Array.isArray(outcome.requirements) ? outcome.requirements : []
            }))
          };
        });
        
        console.log("Final subjects data structure:", subjectsWithOutcomes);
        onImport(subjectsWithOutcomes);
      } else if (type === "outcomes") {
        // For outcomes, ensure requirements and other fields are properly included
        console.log("Importing outcomes with requirements:", parsedData);
        
        const outcomesWithRequirements = parsedData.map(outcome => ({
          topic: outcome.topic,
          project: outcome.project || outcome.topic,
          credits: parseFloat(outcome.credits) || 0.1,
          maxCredits: parseFloat(outcome.maxCredits) || parseFloat(outcome.credits) || 0.1,
          compulsory: outcome.compulsory !== undefined ? outcome.compulsory : true,
          requirements: Array.isArray(outcome.requirements) ? outcome.requirements : []
        }));
        
        console.log("Final outcomes data structure:", outcomesWithRequirements);
        onImport(outcomesWithRequirements);
      } else {
        onImport(parsedData);
      }
    } catch (error) {
      console.error("Error in handleImport:", error);
      setError(`Error preparing data for import: ${error.message}`);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => {
        setCsvFile(null);
        setParsedData([]);
        setPreviewMode(false);
        onClose();
      }} 
      fullWidth 
      maxWidth={previewMode ? "md" : "sm"}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!previewMode ? (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Upload a CSV file
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                mb: 2
              }}
            >
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="csv-file-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Select CSV File
                </Button>
              </label>
              
              {csvFile && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Selected: {csvFile.name}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={parseCSV}
                  disabled={!csvFile || loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Preview Data"}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadSampleCSV}
                >
                  Download Template
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          // Preview Mode - Enhanced to show more details
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview Import Data ({parsedData.length} {type})
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    {type === 'subjects' ? (
                      <>
                        <TableCell><strong>Subject Name</strong></TableCell>
                        <TableCell><strong>Credits</strong></TableCell>
                        <TableCell><strong>Outcomes</strong></TableCell>
                        <TableCell><strong>Details</strong></TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell><strong>Topic</strong></TableCell>
                        <TableCell><strong>Project</strong></TableCell>
                        <TableCell><strong>Credits</strong></TableCell>
                        <TableCell><strong>Max Credits</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Requirements</strong></TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.map((item, index) => (
                    <TableRow key={index}>
                      {type === 'subjects' ? (
                        <>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.credits}</TableCell>
                          <TableCell>
                            {item.outcomes.length} outcome{item.outcomes.length !== 1 ? 's' : ''}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ maxHeight: '150px', overflow: 'auto' }}>
                              {item.outcomes.map((outcome, i) => (
                                <Box key={i} sx={{ mb: 1, pb: 1, borderBottom: i < item.outcomes.length - 1 ? '1px solid #eee' : 'none' }}>
                                  <Typography variant="body2"><strong>{outcome.topic}</strong></Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                    <Chip 
                                      size="small" 
                                      label={outcome.compulsory ? "Compulsory" : "Optional"} 
                                      color={outcome.compulsory ? "primary" : "default"} 
                                    />
                                    <Chip 
                                      size="small" 
                                      label={`${outcome.credits} - ${outcome.maxCredits} credits`} 
                                      variant="outlined" 
                                    />
                                  </Box>
                                  {outcome.requirements && outcome.requirements.length > 0 && (
                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                      Requirements: {outcome.requirements.join(', ')}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{item.topic}</TableCell>
                          <TableCell>{item.project}</TableCell>
                          <TableCell>{item.credits}</TableCell>
                          <TableCell>{item.maxCredits}</TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              label={item.compulsory ? "Compulsory" : "Optional"} 
                              color={item.compulsory ? "primary" : "default"} 
                            />
                          </TableCell>
                          <TableCell>
                            {item.requirements && item.requirements.length > 0 ? (
                              <Typography variant="caption">
                                {item.requirements.join(', ')}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                None
                              </Typography>
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setCsvFile(null);
          setParsedData([]);
          setPreviewMode(false);
          onClose();
        }}>
          Cancel
        </Button>
        {previewMode && (
          <Button 
            onClick={handleImport} 
            color="primary" 
            variant="contained"
          >
            Import
          </Button>
        )}
      </DialogActions>

      {/* Duplicate Items Dialog */}
      <Dialog 
        open={duplicateDialog.open} 
        onClose={handleRejectDuplicates}
      >
        <DialogTitle>
          Duplicate {type === "subjects" ? "Subjects" : "Outcomes"} Detected
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {duplicateDialog.message}
          </DialogContentText>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <strong>
                      {type === "subjects" ? "Subject Name" : "Learning Outcome"}
                    </strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {duplicateDialog.duplicates.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {type === "subjects" ? item.name : item.topic}
                    </TableCell>
                  </TableRow>
                ))}
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
          <Button
            onClick={handleAcceptDuplicates}
            color="primary"
            variant="contained"
          >
            Update Existing
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default FileImporter;