import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Button } from '@mui/material';

const ViewStudent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const { userDetails, loading } = useSelector((state) => state.user);

    const studentID = params.id;

    useEffect(() => {
        dispatch(getUserDetails(studentID, 'Student'));
    }, [dispatch, studentID]);

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <Typography>Name: {userDetails?.name}</Typography>
                    <Typography>Roll Number: {userDetails?.rollNum}</Typography>
                    <Typography>Class: {userDetails?.sclassName?.sclassName}</Typography>
                    <Typography>School: {userDetails?.school?.schoolName}</Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/Teacher/students/student/marks/${studentID}`)}
                    >
                        Add Marks
                    </Button>
                </div>
            )}
        </>
    );
};

export default ViewStudent;
