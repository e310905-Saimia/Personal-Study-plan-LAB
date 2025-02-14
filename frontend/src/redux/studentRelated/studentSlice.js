import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    studentsList: [],
    status: null,
    error: null
};

const studentSlice = createSlice({
    name: "student",
    initialState,
    reducers: {
        stuffDone: (state) => {
            state.status = "done";
        },

        
        getRequest: (state) => {
            state.status = "loading";
        },
        getSuccess: (state, action) => {
            state.status = "success";
            state.studentsList = action.payload; 
        },
        getFailed: (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        },
        getError: (state, action) => {
            state.error = action.payload;
        },
    }
});

export const { getRequest, getSuccess, getFailed, stuffDone, getError } = studentSlice.actions;
export default studentSlice.reducer;