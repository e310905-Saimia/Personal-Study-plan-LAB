import axios from 'axios';
import { getRequest, getSuccess, getFailed } from './sclassSlice';

export const fetchClasses = () => async (dispatch) => {
    try {
        const response = await axios.get("/api/classes");
        dispatch({ type: "FETCH_CLASSES_SUCCESS", payload: response.data });
    } catch (error) {
        dispatch({ type: "FETCH_CLASSES_ERROR", payload: error.message });
    }
};


export const getSubjectList = () => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/subjects`);
        dispatch(getSuccess(response.data));  // Make sure this exists in `sclassSlice.js`
    } catch (error) {
        dispatch(getFailed(error.response?.data?.message || "Failed to fetch subjects"));
    }
};

export const getClassDetails = (classID) => async (dispatch) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/classes/${classID}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching class details:", error.response?.data?.message || "Failed to fetch class details");
        throw error;
    }
};

export const getClassStudents = (classID) => async (dispatch) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/classes/${classID}/students`);
        return response.data;
    } catch (error) {
        console.error("Error fetching class students:", error.response?.data?.message || "Failed to fetch class students");
        throw error;
    }
};

export const getAllSclasses = (teacherID) => async (dispatch) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/sclasses`, {
            params: { teacherID }
        });
        dispatch(fetchClasses(response.data)); // Dispatch existing action
    } catch (error) {
        console.error("Error fetching classes:", error.response?.data?.message || "Failed to fetch classes");
        throw error;
    }
};

export const getSubjectDetails = (subjectID) => async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/subjects/${subjectID}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching subject details:", error.response?.data?.message || "Failed to fetch subject details");
        throw error;
    }
};
