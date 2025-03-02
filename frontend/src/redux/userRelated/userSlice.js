import { createSlice } from "@reduxjs/toolkit";

const getLocalStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing localStorage item "${key}":`, error);
    return null;
  }
};

const initialState = {
  currentUser: getLocalStorageItem("currentUser"),
  status: null,
  error: null,
  currentRole: getLocalStorageItem("currentRole"),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.status = "loading";
    },
    loginSuccess: (state, action) => {
      state.status = "success";
      state.currentUser = action.payload;
      state.currentRole =
        action.payload.teacher?.role || action.payload.student?.role || action.payload.role || null;

      localStorage.setItem("currentUser", JSON.stringify(action.payload));
      localStorage.setItem("currentRole", JSON.stringify(state.currentRole));
    },
    loginFailure: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    Authlogout: (state) => {
      state.currentUser = null;
      state.status = null;
      state.currentRole = null;
      localStorage.removeItem("currentUser");
      localStorage.removeItem("currentRole");
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
  Authlogout,
  registerSuccess,
  registerFailure,
  setUserDetails,
  underControl,
} = userSlice.actions;

export default userSlice.reducer;
