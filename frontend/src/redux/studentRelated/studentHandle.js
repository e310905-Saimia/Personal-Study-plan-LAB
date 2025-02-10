// import axios from 'axios';
// import {
//     getRequest,
//     getFailed,
//     getError,
//     stuffDone
// } from './studentSlice';

// export const getAllStudents = () => async (dispatch) => {
//     try {
//         const response = await axios.get("/api/students");
//         dispatch({ type: "FETCH_STUDENTS_SUCCESS", payload: response.data });
//     } catch (error) {
//         dispatch({ type: "FETCH_STUDENTS_ERROR", payload: error.message });
//     }
// };


// export const updateStudentFields = (id, fields, address) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
//             headers: { 'Content-Type': 'application/json' },
//         });
//         if (result.data.message) {
//             dispatch(getFailed(result.data.message));
//         } else {
//             dispatch(stuffDone());
//         }
//     } catch (error) {
//         dispatch(getError(error));
//     }
// }

// export const removeStuff = (id, address) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
//         if (result.data.message) {
//             dispatch(getFailed(result.data.message));
//         } else {
//             dispatch(stuffDone());
//         }
//     } catch (error) {
//         dispatch(getError(error));
//     }
// }


import axios from "axios";
import { getRequest, getSuccess, getFailed } from "./studentSlice";

export const getAllStudents = (teacherID) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get(`/api/Students/${teacherID}`);
        dispatch(getSuccess(response.data));
    } catch (error) {
        dispatch(getFailed(error.message));
    }
};

