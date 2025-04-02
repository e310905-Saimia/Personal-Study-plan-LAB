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
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const parseDecimalValue = (value) => {
  if (!value || value === "") return null;

  // Handle both comma and period as decimal separators
  const valueStr = String(value).trim();
  const normalizedValue = valueStr.replace(",", ".");

  // Parse the normalized value
  const parsed = parseFloat(normalizedValue);
  console.log(
    `Parsing decimal value: "${valueStr}" → "${normalizedValue}" → ${parsed}`
  );

  return isNaN(parsed) ? null : parsed;
};

const FileImporter = ({
  open,
  onClose,
  title,
  onImport,
  type,
  existingItems = [],
  subjectId = null,
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
    const exactIndex = headers.findIndex(
      (header) =>
        header &&
        possibleNames.some(
          (name) => header.toLowerCase().trim() === name.toLowerCase().trim()
        )
    );

    if (exactIndex !== -1) {
      return exactIndex;
    }

    // Then try partial matches
    const partialIndex = headers.findIndex(
      (header) =>
        header &&
        possibleNames.some((name) =>
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
        const nameParts = nameLower.split(" ");
        if (
          nameParts.some(
            (part) => headerLower.includes(part) && part.length > 2
          )
        ) {
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
    return row[index] !== undefined && row[index] !== null
      ? row[index]
      : defaultValue;
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
      const fixedContent = content.replace(/\r\n|\r|\n/g, "\n");

      // Try to detect the delimiter and structure
      let detectedDelimiter = ";"; // Default to semicolon
      const firstLine = fixedContent.split("\n")[0];

      // Count occurrences of potential delimiters
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const tabCount = (firstLine.match(/\t/g) || []).length;

      console.log("Delimiter counts:", {
        semicolonCount,
        commaCount,
        tabCount,
      });

      // Use the delimiter with the most occurrences
      if (commaCount > semicolonCount && commaCount > tabCount) {
        detectedDelimiter = ",";
      } else if (tabCount > semicolonCount && tabCount > commaCount) {
        detectedDelimiter = "\t";
      }

      console.log("Using delimiter:", detectedDelimiter);

      // First, try parsing with auto-detection of delimiters
      Papa.parse(fixedContent, {
        delimitersToGuess: [",", ";", "\t"],
        header: false,
        skipEmptyLines: true,
        comments: "#",
        quoteChar: '"',
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn(
              "Auto-detection parsing errors, trying explicit delimiter:",
              results.errors
            );

            // Try again with the explicitly detected delimiter
            Papa.parse(fixedContent, {
              delimiter: detectedDelimiter,
              header: false,
              skipEmptyLines: true,
              comments: "#",
              quoteChar: '"',
              complete: handleParsedData,
              error: handleParseError,
            });
          } else {
            handleParsedData(results);
          }
        },
        error: handleParseError,
      });
    };

    reader.readAsText(csvFile, "windows-1252");
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
    console.log(
      "Raw parsed CSV data (first 3 rows):",
      results.data.slice(0, 3)
    );

    try {
      // Process the data based on the import type
      let processedData;
      let duplicates = [];

      if (type === "subjects") {
        console.log(
          "Processing data as subjects with potentially multiple outcomes per subject"
        );
        processedData = processSubjectsData(results.data);
        console.log(
          `Processed ${
            processedData.length
          } subjects with a total of ${processedData.reduce(
            (acc, subj) => acc + subj.outcomes.length,
            0
          )} outcomes`
        );

        // Debug: Check outcomes and requirements for each subject
        processedData.forEach((subject, i) => {
          console.log(
            `Subject ${i + 1}: ${subject.name} has ${
              subject.outcomes.length
            } outcomes`
          );
          subject.outcomes.forEach((outcome, j) => {
            console.log(
              `  Outcome ${j + 1}: ${outcome.topic} has ${
                outcome.requirements.length
              } requirements`
            );
            console.log(
              `  Requirements: ${JSON.stringify(outcome.requirements)}`
            );
          });
        });

        duplicates = findDuplicateSubjects(processedData);
      } else if (type === "outcomes") {
        if (!subjectId) {
          throw new Error("No subject selected for importing outcomes");
        }
        console.log("Processing data as outcomes for subject ID:", subjectId);
        processedData = processOutcomesData(results.data);
        console.log(`Processed ${processedData.length} outcomes`);

        // Debug: Check requirements for each outcome
        processedData.forEach((outcome, i) => {
          console.log(
            `Outcome ${i + 1}: ${outcome.topic} has ${
              outcome.requirements.length
            } requirements`
          );
          console.log(`Requirements: ${JSON.stringify(outcome.requirements)}`);
        });

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

  const processSubjectsData = (data) => {
    console.log("Starting processSubjectsData with", data.length, "rows");

    // Ensure we have data to process
    if (!data || data.length < 2) {
      throw new Error("CSV file has no data or is missing header row");
    }

    // Get the header row
    const headerRow = data[0];
    console.log("Header row:", headerRow);

    // Process headers consistently
    let headers = headerRow;
    if (headerRow.length === 1 && headerRow[0].includes(";")) {
      headers = headerRow[0].split(";");
      console.log(
        "Detected semicolon-separated headers in a single column, split to:",
        headers
      );

      // Reformat all data rows as well
      data = data.map((row) => {
        if (row.length === 1 && row[0].includes(";")) {
          return row[0].split(";");
        }
        return row;
      });
    }

    console.log("Headers being used:", headers);

    // Find column indices using flexible matching
    const topicIndex = findColumnIndex(headers, [
      "topic",
      "subject",
      "subject name",
    ]);
    const outcomeIndex = findColumnIndex(headers, [
      "learning outcomes",
      "outcome",
      "learning outcome",
    ]);
    const compulsoryIndex = findColumnIndex(headers, [
      "compulsary or not",
      "compulsory",
      "required",
      "obligatory",
    ]);
    const requirementsIndex = findColumnIndex(headers, [
      "requirements",
      "requirement",
    ]);
    const minCreditsIndex = findColumnIndex(headers, [
      "outcome minimum credits",
      "min credits",
      "minimum credits",
    ]);
    const maxCreditsIndex = findColumnIndex(headers, [
      "outcome maximun credits",
      "outcome maximum credits",
      "max credits",
      "maximum credits",
    ]);

    console.log("Found column indices:", {
      topicIndex,
      outcomeIndex,
      compulsoryIndex,
      requirementsIndex,
      minCreditsIndex,
      maxCreditsIndex,
    });

    // Skip header row
    const dataRows = data.slice(1);

    // First pass: Group rows by subject and outcome to collect all requirements
    const subjectMap = new Map();
    const outcomeGroups = [];
    let currentSubject = null;
    let currentOutcome = null;
    let currentTopic = ""; // Track current topic name

    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];

      // Skip empty rows
      if (!row || row.length === 0 || (row.length === 1 && !row[0])) {
        console.warn(`Skipping empty row at index ${rowIndex + 1}`);
        continue;
      }

      // Extract all fields
      const topic = getValueAt(row, topicIndex, "").trim();
      const learningOutcome = getValueAt(row, outcomeIndex, "").trim();
      const compulsoryStr = getValueAt(row, compulsoryIndex, "true");
      const requirementStr = getValueAt(row, requirementsIndex, "").trim();
      const minCreditsStr = getValueAt(row, minCreditsIndex, "").trim();
      const maxCreditsStr = getValueAt(row, maxCreditsIndex, "").trim();

      console.log(`Row ${rowIndex + 2}:`, {
        topic,
        learningOutcome,
        compulsoryStr,
        requirementStr,
        minCreditsStr,
        maxCreditsStr,
      });

      // Use current topic if this row doesn't specify one
      const effectiveTopic = topic || currentTopic;

      // Update current topic if we have a non-empty one
      if (topic) {
        currentTopic = topic;
      }

      // Check if this is a continuation row (empty subject and outcome but has requirement)
      const isContinuationRow =
        (!topic || topic === "") &&
        (!learningOutcome || learningOutcome === "") &&
        requirementStr &&
        requirementStr !== "";

      if (isContinuationRow) {
        console.log(
          `Row ${
            rowIndex + 2
          }: Found continuation row with requirement: "${requirementStr}"`
        );

        // If we have a current outcome, add this requirement to it
        if (currentOutcome) {
          if (!currentOutcome.requirements.includes(requirementStr)) {
            currentOutcome.requirements.push(requirementStr);
            console.log(
              `Added requirement "${requirementStr}" to outcome "${currentOutcome.topic}" of subject "${currentSubject.name}"`
            );
          }
        } else {
          console.warn(
            "Found requirement row but no current outcome to attach it to"
          );
        }

        continue;
      }

      // If we've reached here, this is a new outcome row

      // Skip rows without a learning outcome
      if (!learningOutcome || learningOutcome === "") {
        console.warn(`Skipping row ${rowIndex + 2} - no learning outcome`);
        continue;
      }

      // Create or get the subject
      if (!subjectMap.has(effectiveTopic)) {
        console.log(`Creating new subject: ${effectiveTopic}`);
        const newSubject = {
          name: effectiveTopic,
          credits: 1, // Default credit value
          outcomes: [],
        };
        subjectMap.set(effectiveTopic, newSubject);
        currentSubject = newSubject;
      } else {
        currentSubject = subjectMap.get(effectiveTopic);
      }

      // Parse compulsory status
      let compulsory = true; // Default to true
      if (compulsoryStr) {
        // Convert various representations to boolean
        compulsory = !["false", "no", "0", "n", "f"].includes(
          String(compulsoryStr).toLowerCase().trim()
        );
      }

      // Parse credits
      const parsedValue = parseDecimalValue(minCreditsStr);
      let minCredits = 0.1; // Default minimum
      if (parsedValue !== null) {
        minCredits = Math.max(0.1, Math.min(parsedValue, 10)); // Clamp between 0.1 and 10
      }
      let maxCredits = minCredits; // Default to min
      const parsedMaxValue = parseDecimalValue(maxCreditsStr);
      if (parsedMaxValue !== null) {
        maxCredits = Math.max(0.1, Math.min(parsedMaxValue, 10)); // Clamp between 0.1 and 10
      }
      // Initialize requirements array with the first requirement from this row
      let requirements = [];
      if (requirementStr) {
        requirements = [requirementStr];
      }

      // Create a new outcome
      const outcome = {
        topic: learningOutcome,
        project: learningOutcome, // Use learning outcome as project by default
        credits: minCredits,
        maxCredits: maxCredits,
        compulsory: compulsory,
        requirements: requirements,
      };

      // Add outcome to current subject
      currentSubject.outcomes.push(outcome);
      console.log(
        `Added outcome: ${learningOutcome} to subject: ${effectiveTopic} with initial requirement: "${requirementStr}"`
      );

      // Update current outcome tracker
      currentOutcome = outcome;
    }

    // Convert map to array of subjects
    const result = Array.from(subjectMap.values());

    // Validate results
    if (result.length === 0) {
      throw new Error("No valid subjects found in the CSV file");
    }

    console.log("Subject map created with", subjectMap.size, "subjects");

    // Final validation and deduplication of requirements
    let totalRequirements = 0;
    for (const subject of result) {
      console.log(
        `Subject "${subject.name}" has ${subject.outcomes.length} outcomes`
      );

      for (const outcome of subject.outcomes) {
        // Deduplicate requirements
        outcome.requirements = [
          ...new Set(outcome.requirements.filter((req) => req.trim() !== "")),
        ];
        totalRequirements += outcome.requirements.length;

        console.log(
          `  Outcome "${outcome.topic}" has ${outcome.requirements.length} requirements`
        );
        for (let i = 0; i < outcome.requirements.length; i++) {
          console.log(`    Requirement ${i + 1}: "${outcome.requirements[i]}"`);
        }
      }
    }

    console.log(`Total requirements processed: ${totalRequirements}`);

    return result;
  };
  // Completely revised processOutcomesData function with better requirement tracking
  const processOutcomesData = (data) => {
    // Ensure we have data to process
    if (!data || data.length < 2) {
      throw new Error("CSV file has no data or is missing header row");
    }

    // Get the header row
    const headerRow = data[0];
    console.log("Header row for outcomes:", headerRow);

    // Process headers as before
    let headers = headerRow;
    if (headerRow.length === 1 && headerRow[0].includes(";")) {
      headers = headerRow[0].split(";");
      console.log("Split headers for outcomes:", headers);

      // Reformat all data rows
      data = data.map((row) => {
        if (row.length === 1 && row[0].includes(";")) {
          return row[0].split(";");
        }
        return row;
      });
    }

    console.log(
      "Data structure after preprocessing:",
      data.slice(0, Math.min(5, data.length))
    );

    // Determine column indices based on headers
    const topicIndex = findColumnIndex(headers, [
      "topic",
      "subject",
      "subject name",
    ]);
    const outcomeIndex = findColumnIndex(headers, [
      "learning outcomes",
      "outcome",
      "learning outcome",
    ]);
    const compulsoryIndex = findColumnIndex(headers, [
      "compulsary or not",
      "compulsory",
      "required",
      "obligatory",
    ]);
    const requirementsIndex = findColumnIndex(headers, [
      "requirements",
      "requirement",
    ]);
    const minCreditsIndex = findColumnIndex(headers, [
      "outcome minimum credits",
      "min credits",
      "minimum credits",
    ]);
    const maxCreditsIndex = findColumnIndex(headers, [
      "outcome maximun credits",
      "outcome maximum credits",
      "max credits",
      "maximum credits",
    ]);

    console.log("Column indices found:", {
      topicIndex,
      outcomeIndex,
      compulsoryIndex,
      requirementsIndex,
      minCreditsIndex,
      maxCreditsIndex,
    });

    // Skip header row
    const dataRows = data.slice(1);

    // First pass: Group rows by outcome to collect all requirements
    const outcomeGroups = [];
    let currentGroup = null;

    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];

      // Skip empty rows
      if (!row || row.length === 0 || (row.length === 1 && !row[0])) {
        console.warn(`Skipping empty row at index ${rowIndex + 1}`);
        continue;
      }

      // Extract fields from row
      const learningOutcome = getValueAt(row, outcomeIndex, "").trim();
      const requirementStr = getValueAt(row, requirementsIndex, "").trim();

      // Check if this is a continuation row (empty outcome but has requirement)
      const isContinuationRow =
        (!learningOutcome || learningOutcome === "") &&
        requirementStr &&
        requirementStr !== "";

      if (isContinuationRow && currentGroup) {
        // This is a continuation row - add requirement to current group
        console.log(
          `Row ${
            rowIndex + 2
          }: Found continuation row with requirement: "${requirementStr}"`
        );
        if (!currentGroup.requirements.includes(requirementStr)) {
          currentGroup.requirements.push(requirementStr);
          console.log(
            `Added requirement "${requirementStr}" to outcome "${currentGroup.learningOutcome}"`
          );
        }
      } else if (learningOutcome) {
        // This is a new outcome row
        const topic = getValueAt(row, topicIndex, "").trim();
        const compulsoryStr = getValueAt(row, compulsoryIndex, "true");
        const minCreditsStr = getValueAt(row, minCreditsIndex, "0.1");
        const maxCreditsStr = getValueAt(row, maxCreditsIndex, minCreditsStr);

        console.log(
          `Row ${
            rowIndex + 2
          }: New outcome row: "${learningOutcome}" with requirement: "${requirementStr}"`
        );

        // Parse compulsory status
        const compulsory = !["false", "no", "0", "n", "f"].includes(
          String(compulsoryStr).toLowerCase().trim()
        );

        // Parse credits with improved decimal handling
        const parsedValue = parseDecimalValue(minCreditsStr);
        const parsedMaxValue = parseDecimalValue(maxCreditsStr);

        // Apply validation (min 0.1, max 10 rule)
        let credits = 0.1; // Default minimum
        if (parsedValue !== null) {
          credits = Math.max(0.1, Math.min(parsedValue, 10)); // Clamp between 0.1 and 10
        }

        let maxCredits = credits; // Default to min credits
        if (parsedMaxValue !== null) {
          maxCredits = Math.max(0.1, Math.min(parsedMaxValue, 10)); // Clamp between 0.1 and 10
        }

        // Create a new group for this outcome
        currentGroup = {
          topic,
          learningOutcome,
          compulsory,
          credits: credits,
          maxCredits: maxCredits,
          requirements: [],
        };

        // Add the first requirement if it exists
        if (requirementStr) {
          currentGroup.requirements.push(requirementStr);
          console.log(
            `Added initial requirement "${requirementStr}" to outcome "${learningOutcome}"`
          );
        }

        outcomeGroups.push(currentGroup);
      }
    }

    console.log(`Parsed ${outcomeGroups.length} outcome groups`);

    // Second pass: Convert grouped data to outcomes array
    const outcomes = outcomeGroups.map((group) => {
      // Filter out any empty or duplicate requirements
      const uniqueRequirements = [
        ...new Set(group.requirements.filter((req) => req.trim() !== "")),
      ];

      return {
        topic: group.learningOutcome,
        project: group.learningOutcome, // Use learningOutcome as project by default
        credits: Math.max(0.1, Math.min(group.credits, 10)),
        maxCredits: Math.max(0.1, Math.min(group.maxCredits, 10)),
        compulsory: group.compulsory,
        requirements: uniqueRequirements,
      };
    });

    // Log each outcome and its requirements
    outcomes.forEach((outcome, index) => {
      console.log(
        `Outcome ${index + 1}: ${outcome.topic} (${
          outcome.compulsory ? "Compulsory" : "Optional"
        }, ${outcome.credits}-${outcome.maxCredits} credits)`
      );
      console.log(
        `  Requirements (${outcome.requirements.length}): ${JSON.stringify(
          outcome.requirements
        )}`
      );
    });

    return outcomes;
  };
  // Find duplicate subjects
  const findDuplicateSubjects = (newSubjects) => {
    return newSubjects.filter((newSubject) =>
      existingItems.some(
        (existingSubject) =>
          existingSubject.name.toLowerCase() === newSubject.name.toLowerCase()
      )
    );
  };

  // Find duplicate outcomes
  const findDuplicateOutcomes = (newOutcomes) => {
    // If importing outcomes, check against existing outcomes for the specific subject
    if (!existingItems.outcomes) return [];

    return newOutcomes.filter((newOutcome) =>
      existingItems.outcomes.some(
        (existingOutcome) =>
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
            (subject) =>
              !duplicateDialog.duplicates.some(
                (dup) => dup.name.toLowerCase() === subject.name.toLowerCase()
              )
          )
        : duplicateDialog.data.filter(
            (outcome) =>
              !duplicateDialog.duplicates.some(
                (dup) => dup.topic.toLowerCase() === outcome.topic.toLowerCase()
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

  // Enhanced handleImport function with more detailed logging
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
        const subjectsWithOutcomes = parsedData.map((subject) => {
          console.log(
            `Processing subject "${subject.name}" with ${subject.outcomes.length} outcomes`
          );
          return {
            name: subject.name,
            credits: subject.credits || 1,
            outcomes: (subject.outcomes || []).map((outcome) => {
              // Make sure requirements is an array and all items are strings
              let requirements = [];
              if (outcome.requirements) {
                if (Array.isArray(outcome.requirements)) {
                  requirements = outcome.requirements
                    .filter(
                      (req) =>
                        req && req.toString && req.toString().trim() !== ""
                    )
                    .map((req) => req.toString().trim());
                } else if (typeof outcome.requirements === "string") {
                  // Handle case where requirements might be a string
                  requirements = outcome.requirements
                    .split(/\n|,/)
                    .map((req) => req.trim())
                    .filter((req) => req !== "");
                }
              }

              console.log(
                ` - Outcome "${outcome.topic}" with ${requirements.length} requirements`
              );
              console.log(`   Requirements: ${JSON.stringify(requirements)}`);

              return {
                topic: outcome.topic,
                project: outcome.project || outcome.topic,
                credits: parseDecimalValue(outcome.credits) || 0.1,
                maxCredits:
                  parseFloat(outcome.maxCredits) ||
                  parseFloat(outcome.credits) ||
                  0.1,
                compulsory:
                  outcome.compulsory !== undefined ? outcome.compulsory : true,
                requirements: requirements,
              };
            }),
          };
        });

        // Verify the data structure before sending
        console.log("=== FINAL DATA STRUCTURE CHECK ===");
        let totalRequirements = 0;

        subjectsWithOutcomes.forEach((subject, i) => {
          console.log(`Subject ${i + 1}: ${subject.name}`);
          (subject.outcomes || []).forEach((outcome, j) => {
            console.log(`  Outcome ${j + 1}: ${outcome.topic}`);
            console.log(
              `    Requirements (${
                outcome.requirements?.length || 0
              }): ${JSON.stringify(outcome.requirements || [])}`
            );
            totalRequirements += outcome.requirements?.length || 0;
          });
        });

        console.log(`Total requirements to be imported: ${totalRequirements}`);
        console.log(
          "Final data to be sent to handleSubjectImport:",
          JSON.stringify(subjectsWithOutcomes, null, 2)
        );
        onImport(subjectsWithOutcomes);
      } else if (type === "outcomes") {
        // For outcomes, ensure requirements and other fields are properly included
        console.log("Importing outcomes with requirements:", parsedData);

        const outcomesWithRequirements = parsedData.map((outcome) => {
          // Make sure requirements is an array and all items are strings
          let requirements = [];
          if (outcome.requirements) {
            if (Array.isArray(outcome.requirements)) {
              requirements = outcome.requirements
                .filter(
                  (req) => req && req.toString && req.toString().trim() !== ""
                )
                .map((req) => req.toString().trim());
            } else if (typeof outcome.requirements === "string") {
              // Handle case where requirements might be a string
              requirements = outcome.requirements
                .split(/\n|,/)
                .map((req) => req.trim())
                .filter((req) => req !== "");
            }
          }

          console.log(
            `Processing outcome "${outcome.topic}" with ${requirements.length} requirements`
          );
          console.log(`Requirements: ${JSON.stringify(requirements)}`);

          return {
            topic: outcome.topic,
            project: outcome.project || outcome.topic,
            credits: parseFloat(outcome.credits) || 0.1,
            maxCredits:
              parseFloat(outcome.maxCredits) ||
              parseFloat(outcome.credits) ||
              0.1,
            compulsory:
              outcome.compulsory !== undefined ? outcome.compulsory : true,
            requirements: requirements,
          };
        });

        // Log total requirements being sent
        const totalRequirements = outcomesWithRequirements.reduce(
          (sum, outcome) => sum + (outcome.requirements?.length || 0),
          0
        );

        console.log(`Total requirements to be imported: ${totalRequirements}`);
        console.log(
          "Final data to be sent to handleOutcomeImport:",
          JSON.stringify(outcomesWithRequirements, null, 2)
        );
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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "2px dashed #ccc",
                borderRadius: 2,
                p: 3,
                mb: 2,
              }}
            >
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                onChange={handleFileChange}
                style={{ display: "none" }}
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

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={parseCSV}
                  disabled={!csvFile || loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Preview Data"}
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
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    {type === "subjects" ? (
                      <>
                        <TableCell>
                          <strong>Subject Name</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Credits</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Outcomes</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Details</strong>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <strong>Topic</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Project</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Credits</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Max Credits</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Type</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Requirements</strong>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.map((item, index) => (
                    <TableRow key={index}>
                      {type === "subjects" ? (
                        <>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.credits}</TableCell>
                          <TableCell>
                            {item.outcomes.length} outcome
                            {item.outcomes.length !== 1 ? "s" : ""}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ maxHeight: "150px", overflow: "auto" }}>
                              {item.outcomes.map((outcome, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    mb: 1,
                                    pb: 1,
                                    borderBottom:
                                      i < item.outcomes.length - 1
                                        ? "1px solid #eee"
                                        : "none",
                                  }}
                                >
                                  <Typography variant="body2">
                                    <strong>{outcome.topic}</strong>
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 1,
                                      mt: 0.5,
                                    }}
                                  >
                                    <Chip
                                      size="small"
                                      label={
                                        outcome.compulsory
                                          ? "Compulsory"
                                          : "Optional"
                                      }
                                      color={
                                        outcome.compulsory
                                          ? "primary"
                                          : "default"
                                      }
                                    />
                                    <Chip
                                      size="small"
                                      label={`${outcome.credits} - ${outcome.maxCredits} credits`}
                                      variant="outlined"
                                    />
                                  </Box>
                                  {outcome.requirements &&
                                    outcome.requirements.length > 0 && (
                                      <Typography
                                        variant="caption"
                                        sx={{ display: "block", mt: 0.5 }}
                                      >
                                        Requirements:{" "}
                                        {outcome.requirements.join(", ")}
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
                              label={
                                item.compulsory ? "Compulsory" : "Optional"
                              }
                              color={item.compulsory ? "primary" : "default"}
                            />
                          </TableCell>
                          <TableCell>
                            {item.requirements &&
                            item.requirements.length > 0 ? (
                              <Typography variant="caption">
                                {item.requirements.join(", ")}
                              </Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
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
        <Button
          onClick={() => {
            setCsvFile(null);
            setParsedData([]);
            setPreviewMode(false);
            onClose();
          }}
        >
          Cancel
        </Button>
        {previewMode && (
          <Button onClick={handleImport} color="primary" variant="contained">
            Import
          </Button>
        )}
      </DialogActions>

      {/* Duplicate Items Dialog */}
      <Dialog open={duplicateDialog.open} onClose={handleRejectDuplicates}>
        <DialogTitle>
          Duplicate {type === "subjects" ? "Subjects" : "Outcomes"} Detected
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{duplicateDialog.message}</DialogContentText>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <strong>
                      {type === "subjects"
                        ? "Subject Name"
                        : "Learning Outcome"}
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
