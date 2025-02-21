import axios from "axios";
import { getRequest, getSuccess, getFailed } from "./notificationSlice";

export const getNotifications = () => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get("http://localhost:5000/api/notifications"); // ✅ API Endpoint
        dispatch(getSuccess(response.data));
    } catch (error) {
        console.error("Error fetching notifications:", error);
        dispatch(getFailed(error.message));
    }
};

export const clearNotifications = () => async (dispatch) => {
    try {
        await axios.delete("http://localhost:5000/api/notifications");
        dispatch(getSuccess([])); // ✅ Clear notifications
    } catch (error) {
        console.error("Error clearing notifications:", error);
        dispatch(getFailed(error.message));
    }
};
