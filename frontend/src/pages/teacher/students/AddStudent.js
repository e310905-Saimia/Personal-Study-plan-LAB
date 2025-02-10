import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { CircularProgress } from '@mui/material';

const AddStudent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error } = useSelector(state => state.user);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [loader, setLoader] = useState(false);

    const role = "Student";

    const fields = { email, password, role };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(registerUser(fields, role));
    };

    useEffect(() => {
        if (status === 'success') {
            navigate('/students'); // Redirect after successful registration
        } else if (status === 'failed') {
            setMessage(error || "Registration failed");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error]);

    return (
        <>
            <div className="register">
                <form className="registerForm" onSubmit={submitHandler}>
                    <span className="registerTitle">Add Student</span>

                    <label>Email</label>
                    <input
                        className="registerInput"
                        type="email"
                        placeholder="Enter student's email..."
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label>Password</label>
                    <input
                        className="registerInput"
                        type="password"
                        placeholder="Enter student's password..."
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                    />

                    <button className="registerButton" type="submit" disabled={loader}>
                        {loader ? <CircularProgress size={24} color="inherit" /> : 'Add'}
                    </button>
                </form>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default AddStudent;
