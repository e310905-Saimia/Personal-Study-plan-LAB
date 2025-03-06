import axios from 'axios';
import {
    getTeachersRequest,
    getTeachersSuccess,
    getTeachersFailure,
    registerTeacherRequest,
    registerTeacherSuccess,
    registerTeacherFailure,
    postDone
} from './teacherSlice';

// Add the registerTeacher function
export const registerTeacher = (teacherData) => async (dispatch) => {
    dispatch(registerTeacherRequest());
    
    try {
        console.log("Registering teacher with data:", teacherData);
        const response = await axios.post("http://localhost:5000/api/teachers/register", teacherData);
        console.log("Teacher registration response:", response.data);
        dispatch(registerTeacherSuccess(response.data));
        return response.data;
    } catch (error) {
        console.error("Error registering teacher:", error);
        
        // Detailed error logging
        if (error.response) {
            // The request was made and the server responded with an error status
            console.error("Server error response:", {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
            dispatch(registerTeacherFailure(error.response.data?.message || "Server error"));
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
            dispatch(registerTeacherFailure("No response from server"));
        } else {
            // Something happened in setting up the request
            console.error("Request setup error:", error.message);
            dispatch(registerTeacherFailure(error.message || "Unknown error"));
        }
        
        throw error;
    }
};

// ✅ Fetch All Teachers
export const getAllTeachers = () => async (dispatch) => {
    dispatch(getTeachersRequest());

    try {
        const response = await axios.get("http://localhost:5000/api/teachers");
        dispatch(getTeachersSuccess(response.data));
        return response.data;
    } catch (error) {
        dispatch(getTeachersFailure(error.message));
        throw error;
    }
};

// ✅ Fetch a Single Teacher's Details
export const getTeacherDetails = (id) => async (dispatch) => {
    dispatch(getTeachersRequest());

    try {
        const result = await axios.get(`http://localhost:5000/api/teachers/${id}`);
        if (result.data) {
            dispatch(getTeachersSuccess(result.data));
        }
        return result.data;
    } catch (error) {
        dispatch(getTeachersFailure(error.message));
        throw error;
    }
};

// ✅ Update Teacher's Subject
export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
    dispatch(getTeachersRequest());

    try {
        const response = await axios.put("http://localhost:5000/api/teachers/update-subject", { 
            teacherId, 
            subjectId: teachSubject 
        }, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(postDone());
        return response.data;
    } catch (error) {
        dispatch(getTeachersFailure(error.message));
        throw error;
    }
};