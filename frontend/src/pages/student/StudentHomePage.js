import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../../redux/userRelated/userHandle";

const StudentHomePage = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.currentUser);

    useEffect(() => {
        if (user) {
            dispatch(getUserDetails(user._id));
        }
    }, [dispatch, user]);

    return <div>Welcome to Student Home Page</div>;
};

export default StudentHomePage;
