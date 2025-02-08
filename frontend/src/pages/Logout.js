import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/userRelated/userHandle";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(logoutUser());
        navigate("/");
    }, [dispatch, navigate]);

    return <div>Logging out...</div>;
};

export default Logout;
