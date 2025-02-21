import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
    loading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.notifications = action.payload;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearSuccess: (state) => {
            state.notifications = state.notifications.map((notif) => ({ ...notif, read: true }));
        },
    },
});

export const { getRequest, getSuccess, getFailed, clearSuccess } = notificationSlice.actions;
export default notificationSlice.reducer;
