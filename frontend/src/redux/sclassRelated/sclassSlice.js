import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    classes: [],
    subjects: [], // ✅ Ensure subjects array exists
    status: null,
    error: null
};

const sclassSlice = createSlice({
    name: "sclass",
    initialState,
    reducers: {

        resetSubjects: (state) => {
            state.subjects = [];
        },

        
        getRequest: (state) => {
            state.status = "loading";
        },
        getSuccess: (state, action) => {
            state.status = "success";
            if (action.payload.classes) {
                state.classes = action.payload.classes;
            }
            if (action.payload.subjects) {
                state.subjects = action.payload.subjects;
            }
        },
        getFailed: (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        }
    }
});

export const { getRequest, getSuccess, getFailed, resetSubjects } = sclassSlice.actions;
export default sclassSlice.reducer;
