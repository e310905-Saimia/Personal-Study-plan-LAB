import axios from "axios";
import { 
  fetchNotifications as fetchNotificationsAction,
  markAllNotificationsAsRead
} from "./notificationSlice";

// ✅ Fetch notifications 
export const getNotifications = () => async (dispatch) => {
    try {
        dispatch(fetchNotificationsAction());
        // Remove the parameter from the API call
        const response = await axios.get("http://localhost:5000/api/notifications");
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
};

// ✅ Mark all notifications as read
export const clearNotifications = () => async (dispatch) => {
    try {
        // Remove the parameter from the API call
        await axios.put("http://localhost:5000/api/notifications/mark-all-read");
        dispatch(markAllNotificationsAsRead());
    } catch (error) {
        console.error("Error clearing notifications:", error);
    }
};