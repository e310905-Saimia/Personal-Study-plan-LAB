import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    teachers: [],
    status: null,
    error: null,
    registrationStatus: null,
    registrationError: null
};

const teacherSlice = createSlice({
    name: "teacher",
    initialState,
    reducers: {
        postDone: (state) => {
            state.status = "done";
        },
        
        getTeachersRequest: (state) => {
            state.status = "loading";
        },
        getTeachersSuccess: (state, action) => {
            state.status = "success";
            state.teachers = action.payload;
        },
        getTeachersFailure: (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        },
        addTeacherSuccess: (state, action) => {
            state.teachers.push(action.payload);
        },
        deleteTeacherSuccess: (state, action) => {
            state.teachers = state.teachers.filter(teacher => teacher.id !== action.payload);
        },
        
        // New registration actions
        registerTeacherRequest: (state) => {
            state.registrationStatus = "loading";
            state.registrationError = null;
        },
        registerTeacherSuccess: (state, action) => {
            state.registrationStatus = "success";
            state.registrationError = null;
            // Optionally add the teacher to state.teachers
            state.teachers.push(action.payload.teacher);
        },
        registerTeacherFailure: (state, action) => {
            state.registrationStatus = "failed";
            state.registrationError = action.payload;
        },
        clearRegistrationStatus: (state) => {
            state.registrationStatus = null;
            state.registrationError = null;
        }
    }
});

export const {
    getTeachersRequest,
    getTeachersSuccess,
    getTeachersFailure,
    addTeacherSuccess,
    deleteTeacherSuccess,
    postDone,
    registerTeacherRequest,
    registerTeacherSuccess,
    registerTeacherFailure,
    clearRegistrationStatus
} = teacherSlice.actions;

export default teacherSlice.reducer;