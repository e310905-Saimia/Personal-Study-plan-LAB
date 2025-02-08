import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notices: [],
    status: null,
    error: null
};

const noticeSlice = createSlice({
    name: "notice",
    initialState,
    reducers: {
        getRequest: (state) => {
            state.status = "loading";
        },
        getSuccess: (state, action) => {
            state.status = "success";
            state.notices = action.payload;
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

export const { getRequest, getSuccess, getFailed, getError } = noticeSlice.actions;
export default noticeSlice.reducer;
