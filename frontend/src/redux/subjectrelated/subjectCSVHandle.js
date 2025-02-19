import axios from "axios";
import { getSubjectList } from "./subjectHandle"; 

const API_BASE_URL = "http://localhost:5000/api/subjects";

// ✅ Function to handle CSV upload
export const uploadCSV = async (file, dispatch) => {
  if (!file) {
    alert("Please select a CSV file first!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    await axios.post(`${API_BASE_URL}/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("CSV imported successfully!");
    dispatch(getSubjectList()); // ✅ Refresh subject list after import
  } catch (error) {
    console.error("Error importing CSV:", error);
    alert("Failed to import CSV.");
  }
};
