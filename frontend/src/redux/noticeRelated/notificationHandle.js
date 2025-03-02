import axios from "axios";
import { 
  fetchNotifications as fetchNotificationsAction,
  markAllNotificationsAsRead
} from "./notificationSlice";

// ✅ Fetch notifications for a teacher
export const getNotifications = (teacherID) => async (dispatch) => {
    try {
        dispatch(fetchNotificationsAction());
        // Call your API with the teacherID parameter
        const response = await axios.get(`http://localhost:5000/api/notifications/${teacherID}`);
        // The payload handling is now built into the fetchNotifications thunk
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
};

// ✅ Mark all notifications as read
export const clearNotifications = (teacherID) => async (dispatch) => {
    try {
        await axios.put(`http://localhost:5000/api/notifications/mark-all-read/${teacherID}`);
        dispatch(markAllNotificationsAsRead());
    } catch (error) {
        console.error("Error clearing notifications:", error);
    }
};