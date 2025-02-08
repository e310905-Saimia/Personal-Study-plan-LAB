import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSubjectList } from "../../redux/sclassRelated/sclassHandle"; // ✅ Ensure correct import

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const subjects = useSelector((state) => state.sclass.subjects);

    useEffect(() => {
        dispatch(getSubjectList()); // ✅ Fetch subject list on component mount
    }, [dispatch]);

    return (
        <div>
            <h2>Subjects</h2>
            <ul>
                {subjects.length > 0 ? subjects.map((subject) => (
                    <li key={subject._id}>{subject.name}</li>
                )) : <p>No subjects found</p>}
            </ul>
        </div>
    );
};

export default StudentSubjects;
