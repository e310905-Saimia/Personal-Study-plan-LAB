import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    subjects: [], 
    loading: false,
    error: null
};

const subjectSlice = createSlice({
    name: "subject",
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.subjects = action.payload;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const { getRequest, getSuccess, getFailed } = subjectSlice.actions;
export default subjectSlice.reducer;
