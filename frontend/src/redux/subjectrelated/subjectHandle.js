import axios from 'axios';
import { getRequest, getSuccess, getFailed } from './subjectSlice';

const API_BASE_URL = "http://localhost:5000/api/subjects"; // ✅ Correct base URL


export const addSubject = (subjectData) => async (dispatch) => {
    try {
        const response = await axios.post(API_BASE_URL, subjectData);  // ✅ Corrected endpoint
        dispatch(getSubjectList()); 
        return response.data;
    } catch (error) {
        console.error("Error adding subject:", error);
        dispatch(getFailed(error.message));
    }
};

export const getSubjectDetails = (subjectID) => async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${subjectID}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching subject details:", error.response?.data?.message || "Failed to fetch subject details");
        throw error;
    }
};

export const importSubjects = (formData) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.post(`${API_BASE_URL}/import`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        dispatch(getSubjectList()); // ✅ Refresh subject list
    } catch (error) {
        console.error("Error importing subjects:", error);
        dispatch(getFailed(error.message));
    }
};

export const getSubjectList = () => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get(API_BASE_URL);
        dispatch(getSuccess(response.data));
    } catch (error) {
        dispatch(getFailed(error.response?.data?.message || "Failed to fetch subjects"));
    }
};

// ✅ Update Subject
export const updateSubject = (subjectID, updatedData) => async (dispatch) => {
    try {
        await axios.put(`${API_BASE_URL}/${subjectID}`, updatedData);
        dispatch(getSubjectList()); // Refresh list
    } catch (error) {
        console.error("Error updating subject:", error);
        dispatch(getFailed(error.message));
    }
};

// ✅ Delete Subject
export const deleteSubject = (subjectID) => async (dispatch) => {
    try {
        await axios.delete(`${API_BASE_URL}/${subjectID}`);
        dispatch(getSubjectList()); // Refresh list
    } catch (error) {
        console.error("Error deleting subject:", error);
        dispatch(getFailed(error.message));
    }
};