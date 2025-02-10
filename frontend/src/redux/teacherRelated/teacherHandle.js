// import axios from 'axios';
// import {
//     getRequest,
//     getError,
//     postDone,
//     doneSuccess
// } from './teacherSlice';

// // export const getAllTeachers = (id) => async (dispatch) => {
// //     dispatch(getRequest());

// //     try {
// //         const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teachers/${id}`);
// //         if (result.data.message) {
// //             dispatch(getFailed(result.data.message));
// //         } else {
// //             dispatch(getSuccess(result.data));
// //         }
// //     } catch (error) {
// //         dispatch(getError(error));
// //     }
// // }

// export const getAllTeachers = () => async (dispatch) => {
//     try {
//         const response = await axios.get("/api/teachers");
//         dispatch({ type: "FETCH_TEACHERS_SUCCESS", payload: response.data });
//     } catch (error) {
//         dispatch({ type: "FETCH_TEACHERS_ERROR", payload: error.message });
//     }
// };


// export const getTeacherDetails = (id) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/${id}`);
//         if (result.data) {
//             dispatch(doneSuccess(result.data));
//         }
//     } catch (error) {
//         dispatch(getError(error));
//     }
// }

// export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         await axios.put(`${process.env.REACT_APP_BASE_URL}/TeacherSubject`, { teacherId, teachSubject }, {
//             headers: { 'Content-Type': 'application/json' },
//         });
//         dispatch(postDone());
//     } catch (error) {
//         dispatch(getError(error));
//     }
// }




import axios from 'axios';
import {
    getTeachersRequest,
    getTeachersSuccess,
    getTeachersFailure,
    postDone
} from './teacherSlice';

// ✅ Fetch All Teachers
export const getAllTeachers = () => async (dispatch) => {
    dispatch(getTeachersRequest());

    try {
        const response = await axios.get("/api/teachers");
        dispatch(getTeachersSuccess(response.data));
    } catch (error) {
        dispatch(getTeachersFailure(error.message));
    }
};

// ✅ Fetch a Single Teacher's Details
export const getTeacherDetails = (id) => async (dispatch) => {
    dispatch(getTeachersRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/${id}`);
        if (result.data) {
            dispatch(getTeachersSuccess(result.data));
        }
    } catch (error) {
        dispatch(getTeachersFailure(error.message));
    }
};

// ✅ Update Teacher's Subject
export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
    dispatch(getTeachersRequest());

    try {
        await axios.put(`${process.env.REACT_APP_BASE_URL}/TeacherSubject`, { teacherId, teachSubject }, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(postDone());
    } catch (error) {
        dispatch(getTeachersFailure(error.message));
    }
};
