// import axios from "axios";
// import {
//   loginRequest,
//   loginSuccess,
//   loginFailure,
//   Authlogout,
//   registerSuccess,
//   registerFailure,
//   setUserDetails,
// } from "./userSlice";

// //  Define the base URL for the API
// const BASE_URL = "http://localhost:5000/api";



// export const loginUser = (fields, role) => async (dispatch) => {
//   dispatch(loginRequest());
//   try {
//     const endpoint = role === "Teacher" ? "/teachers/TeacherLogin" : "/students/login";
//     const result = await axios.post(`${BASE_URL}${endpoint}`, fields, {
//       headers: { "Content-Type": "application/json" },
//     });
    
//     console.log("Login success:", result.data);
//     dispatch(loginSuccess(result.data));
//   } catch (error) {
//     console.error("Login failed:", error.response?.data?.message || "Unknown error");
//     dispatch(loginFailure(error.response?.data?.message || "Login failed"));
//   }
// };

// export const registerUser = (fields, role) => async (dispatch) => {
//   try {
//     const endpoint = role === "Teacher" ? "/teachers/register" : "/students/register";
//     const result = await axios.post(`${BASE_URL}${endpoint}`, fields, {
//       headers: { "Content-Type": "application/json" },
//     });

//     console.log("Registration success:", result.data);
//     dispatch(registerSuccess(result.data));
//   } catch (error) {
//     console.error("Registration failed:", error.response?.data?.message || "Unknown error");
//     dispatch(registerFailure(error.response?.data?.message || "Registration failed"));
//   }
// };
// // Logout User
// export const logoutUser = () => (dispatch) => {
//   dispatch(Authlogout());
// };

// // Get User Details
// export const getUserDetails = (userId) => async (dispatch) => {
//   try {
//     const result = await axios.get(`${BASE_URL}/users/${userId}`);
//     dispatch(setUserDetails(result.data));
//   } catch (error) {
//     dispatch(loginFailure("Failed to fetch user details"));
//   }
// };

// //  Add Stuff (Optional)
// export const addStuff = (fields) => async () => {
//   try {
//     const result = await axios.post(`${BASE_URL}/stuff/add`, fields);
//     return result.data;
//   } catch (error) {
//     console.error(
//       "Error adding stuff:",
//       error.response?.data?.message || "Failed to add stuff"
//     );
//     throw error;
//   }
// };

// //  Delete User
// export const deleteUser = (userID) => async () => {
//   try {
//     const response = await axios.delete(`${BASE_URL}/users/${userID}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error deleting user:", error.response?.data?.message || "Failed to delete user");
//     throw error;
//   }
// };

import axios from "axios";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  Authlogout,
  registerSuccess,
  registerFailure,
  setUserDetails,
} from "./userSlice";

//  Define the base URL for the API
const BASE_URL = "http://localhost:5000/api";

export const loginUser = (fields, role) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    let endpoint = "";
    
    if (role === "Teacher") {
      endpoint = "/teachers/TeacherLogin";
    } else if (role === "Student") {
      endpoint = "/students/login";
    } else {
      throw new Error("Invalid role specified");
    }

    const result = await axios.post(`${BASE_URL}${endpoint}`, fields, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Login success:", result.data);
    dispatch(loginSuccess(result.data));
  } catch (error) {
    console.error("Login failed:", error.response?.data?.message || "Unknown error");
    dispatch(loginFailure(error.response?.data?.message || "Login failed"));
  }
};

export const registerUser = (fields, role) => async (dispatch) => {
  try {
    let endpoint = "";
    
    if (role === "Teacher") {
      endpoint = "/teachers/register";
    } else if (role === "Student") {
      endpoint = "/students/register";
    } else {
      throw new Error("Invalid role specified");
    }

    const result = await axios.post(`${BASE_URL}${endpoint}`, fields, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Registration success:", result.data);
    dispatch(registerSuccess(result.data));
  } catch (error) {
    console.error("Registration failed:", error.response?.data?.message || "Unknown error");
    dispatch(registerFailure(error.response?.data?.message || "Registration failed"));
  }
};

// Logout User
export const logoutUser = () => (dispatch) => {
  dispatch(Authlogout());
};

// Get User Details
export const getUserDetails = (userId) => async (dispatch) => {
  try {
    const result = await axios.get(`${BASE_URL}/users/${userId}`);
    dispatch(setUserDetails(result.data));
  } catch (error) {
    dispatch(loginFailure("Failed to fetch user details"));
  }
};

//  Add Stuff (Optional)
export const addStuff = (fields) => async () => {
  try {
    const result = await axios.post(`${BASE_URL}/stuff/add`, fields);
    return result.data;
  } catch (error) {
    console.error(
      "Error adding stuff:",
      error.response?.data?.message || "Failed to add stuff"
    );
    throw error;
  }
};

//  Delete User
export const deleteUser = (userID) => async () => {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${userID}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error.response?.data?.message || "Failed to delete user");
    throw error;
  }
};
