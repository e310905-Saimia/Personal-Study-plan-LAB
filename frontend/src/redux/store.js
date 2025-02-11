import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userRelated/userSlice";
import studentReducer from "./studentRelated/studentSlice";
import teacherReducer from "./teacherRelated/teacherSlice";
import subjectReducer from "./subjectrelated/subjectSlice";
import noticeReducer from "./noticeRelated/noticeSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    student: studentReducer,
    teacher: teacherReducer,
    subject: subjectReducer,
    notice: noticeReducer,
  },
});

export default store;
