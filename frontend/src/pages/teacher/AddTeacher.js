import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import { registerUser } from '../../redux/userRelated/userHandle';

const AddTeacher = () => {
    const params = useParams();
    const dispatch = useDispatch();

    const { subjectDetails } = useSelector((state) => state.sclass);

    const [fields, setFields] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Teacher',
    });

    const handleChange = (e) => {
        setFields({ ...fields, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(registerUser({ ...fields, school: subjectDetails.school, teachSubject: subjectDetails._id }));
    };

    useEffect(() => {
        dispatch(getSubjectDetails(params.id, 'Subject'));
    }, [dispatch, params.id]);

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" onChange={handleChange} required />
            <input name="email" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit">Register</button>
        </form>
    );
};

export default AddTeacher;
