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
        console.log(`Fetching subjects for student ID: ${studentID}`);
        const response = await axios.get(`http://localhost:5000/api/students/${studentID}/subjects`);
        console.log("Student subjects received:", response.data);
        
        // Properly storing the student's data in Redux
        // dispatch(getSuccess({
        //     ...response.data,
        //     assignedSubjects: response.data
        // }));
        dispatch(getSuccess(response.data));
        return response.data;
    } catch (error) {
        console.error("Error fetching student's subjects:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};

// Assign subjects to student
export const assignSubjectsToStudent = (studentID) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.post(`http://localhost:5000/api/students/${studentID}/assign-subjects`);
        dispatch(getSuccess(response.data));
        return response.data;
    } catch (error) {
        console.error("Error assigning subjects to student:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};

// Update outcome progress
export const updateOutcomeProgress = (studentID, subjectID, outcomeID, data) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.put(
            `http://localhost:5000/api/students/${studentID}/subjects/${subjectID}/outcomes/${outcomeID}`, 
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error updating outcome progress:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};

// UPDATED: Submit a project for an outcome
export const submitStudentProject = (studentID, subjectID, outcomeID, projectData) => async (dispatch) => {
    try {
        const response = await axios.post(
            `http://localhost:5000/api/students/${studentID}/subjects/${subjectID}/outcomes/${outcomeID}/projects`,
            projectData
        );
        
        // Refresh the student's subjects data
        dispatch(getStudentSubjects(studentID));
        
        return response.data;
    } catch (error) {
        console.error("Error submitting project:", error);
        throw error;
    }
};

// NEW: Delete a student project
export const deleteStudentProject = (studentID, subjectID, outcomeID, projectID) => async (dispatch) => {
    try {
        console.log(`Deleting project ${projectID} for student ${studentID}`);
        const response = await axios.delete(
            `http://localhost:5000/api/students/${studentID}/subjects/${subjectID}/outcomes/${outcomeID}/projects/${projectID}`
        );
        
        // Refresh the student's subjects data
        dispatch(getStudentSubjects(studentID));
        
        return response.data;
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
};

// UPDATED: Teacher assessing a project
export const updateProjectAssessment = (studentID, subjectID, outcomeID, projectID, assessmentData) => async (dispatch) => {
    try {
        const response = await axios.put(
            `http://localhost:5000/api/students/${studentID}/subjects/${subjectID}/outcomes/${outcomeID}/projects/${projectID}`,
            assessmentData
        );
        
        // Refresh the student's subjects data
        dispatch(getStudentSubjects(studentID));
        
        return response.data;
    } catch (error) {
        console.error("Error updating project assessment:", error);
        throw error;
    }
};

// Get projects for a specific outcome
export const getOutcomeProjects = (studentID, subjectID, outcomeID) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get(
            `http://localhost:5000/api/students/${studentID}/subjects/${subjectID}/outcomes/${outcomeID}/projects`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching outcome projects:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};