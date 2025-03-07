import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerTeacher } from '../../redux/teacherRelated/teacherHandle';

const AddTeacher = () => {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [fields, setFields] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Teacher',
    });

    const handleChange = (e) => {
        setFields({ ...fields, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Use the registerTeacher function from teacherHandle.js
            await dispatch(registerTeacher(fields));
            // Navigate back to teachers list or another appropriate page
            navigate('/Teacher/dashboard/teachers');
        } catch (error) {
            console.error("Error registering teacher:", error);
        }
    };

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