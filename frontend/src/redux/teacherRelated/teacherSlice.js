import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    teachers: [],
    status: null,
    error: null
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
} = teacherSlice.actions;

export default teacherSlice.reducer;
