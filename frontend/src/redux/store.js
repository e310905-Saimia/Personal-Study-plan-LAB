import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userRelated/userSlice";
import studentReducer from "./studentRelated/studentSlice";
import teacherReducer from "./teacherRelated/teacherSlice";
import subjectReducer from "./subjectrelated/subjectSlice";
import notificationReducer from "./noticeRelated/notificationSlice"; // ✅ Correct path

const store = configureStore({
  reducer: {
    user: userReducer,
    student: studentReducer,
    teacher: teacherReducer,
    subject: subjectReducer,
    notification: notificationReducer, 
  },
});

export default store;
