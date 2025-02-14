import axios from "axios";
import { getRequest, getSuccess, getFailed } from "./studentSlice";

export const getAllStudents = () => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get("http://localhost:5000/api/students/list");
        console.log("Fetched students:", response.data);
        dispatch(getSuccess(response.data));
    } catch (error) {
        console.error("Error fetching students:", error);
        dispatch(getFailed(error.message));
    }
};

export const registerUser = (userData, role) => async (dispatch) => {
    try {
        const response = await axios.post("http://localhost:5000/api/students/register", userData);
        console.log("✅ Student Registered Successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error Registering Student:", error.response?.data || error.message);
        throw error;
    }
};

