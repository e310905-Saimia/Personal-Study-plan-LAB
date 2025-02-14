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



// export const getSubjectList = () => async (dispatch) => {
//     dispatch(getRequest());
//     try {
//         const response = await axios.get(API_BASE_URL);
//         dispatch(getSuccess(response.data));
//     } catch (error) {
//         dispatch(getFailed(error.response?.data?.message || "Failed to fetch subjects"));
//     }
// };

export const getSubjectList = () => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get("http://localhost:5000/api/subjects");
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

export const addOutcome = (subjectID, outcomeData) => async (dispatch) => {
    try {
        const response = await axios.post(`http://localhost:5000/api/subjects/${subjectID}/outcomes`, outcomeData);
        dispatch(getSubjectList()); 
        return response.data;
    } catch (error) {
        console.error("Error adding outcome:", error);
        dispatch(getFailed(error.message));
    }
};

export const updateOutcome = (subjectID, outcomeID, updatedOutcome) => async (dispatch) => {
    try {
        await axios.put(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}`, updatedOutcome);
        dispatch(getSubjectList());
    } catch (error) {
        console.error("Error updating outcome:", error);
        dispatch(getFailed(error.message));
    }
};

export const deleteOutcome = (subjectID, outcomeID) => async (dispatch) => {
    try {
        await axios.delete(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}`);
        dispatch(getSubjectList());
    } catch (error) {
        console.error("Error deleting outcome:", error);
        dispatch(getFailed(error.message));
    }
};



// ✅ Add Requirement to an Outcome
export const addRequirement = (subjectID, outcomeID, requirement) => async (dispatch) => {
    try {
        await axios.post(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}/requirements`, { requirement });
        dispatch(getSubjectList()); // Refresh list
    } catch (error) {
        console.error("Error adding requirement:", error);
        dispatch(getFailed(error.message));
    }
};

// ✅ Edit an Existing Requirement
export const editRequirement = (subjectID, outcomeID, requirementIndex, newRequirement) => async (dispatch) => {
    try {
        await axios.put(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}/requirements`, { requirementIndex, newRequirement });
        dispatch(getSubjectList());
    } catch (error) {
        console.error("Error updating requirement:", error);
        dispatch(getFailed(error.message));
    }
};


