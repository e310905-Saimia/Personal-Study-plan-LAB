import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  status: null,
  error: null,
  currentRole: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    underControl: (state, action) => {
      state.status = action.payload;
    },

    loginRequest: (state) => {
      state.status = "loading";
    },
    loginSuccess: (state, action) => {
      state.status = "success";
      state.currentUser = action.payload;
      state.currentRole = action.payload.teacher?.role || action.payload.student?.role || null; // Adjust for teacher/student roles
    },
    loginFailure: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.status = null;
      state.currentRole = null;
    },
    registerSuccess: (state, action) => {
      state.status = "success";
      state.currentUser = action.payload;
    },
    registerFailure: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    setUserDetails: (state, action) => {
      state.currentUser = action.payload;
      state.currentRole = action.payload.role;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  registerSuccess,
  registerFailure,
  setUserDetails,
  underControl,
} = userSlice.actions;

export default userSlice.reducer;
