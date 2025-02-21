import axios from "axios";
import { getRequest, getSuccess, getFailed } from "./studentSlice";

export const getAllStudents = () => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get("http://localhost:5000/api/students/list");
        console.log("Fetched students:", response.data);
        dispatch(getSuccess(response.data));
    } catch (error) {
        console.error("Error fetching students:", error);
        dispatch(getFailed(error.message));
    }
};

export const registerUser = (userData, role) => async (dispatch) => {
    try {
        const response = await axios.post("http://localhost:5000/api/students/register", userData);
        console.log("✅ Student Registered Successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error Registering Student:", error.response?.data || error.message);
        throw error;
    }
};

export const getStudentSubjects = (studentID) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get(`http://localhost:5000/api/students/${studentID}/subjects`);
        dispatch(getSuccess(response.data));
    } catch (error) {
        console.error("Error fetching student's subjects:", error);
        dispatch(getFailed(error.message));
    }
};
export const updateProjectAssessment = (subjectID, outcomeID, projectIndex, assessmentData) => async (dispatch) => {
    try {
        await axios.put(`http://localhost:5000/api/subjects/${subjectID}/outcomes/${outcomeID}/projects/${projectIndex}/assess`, assessmentData);
        dispatch(getStudentSubjects(subjectID)); // Refresh the student's data
    } catch (error) {
        console.error("Error updating project assessment:", error);
    }
};
