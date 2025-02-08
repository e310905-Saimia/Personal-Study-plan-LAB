import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchClasses } from '../../redux/sclassRelated/sclassHandle';
import { PurpleButton } from '../../components/buttonStyles';
import TableTemplate from '../../components/TableTemplate';

const ChooseClass = ({ situation }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { sclassesList, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(fetchClasses(currentUser._id, 'Sclass'));
    }, [dispatch, currentUser]);

    const navigateHandler = (classID) => {
        if (situation === 'Teacher') {
            navigate('/Teacher/teachers/choosesubject/' + classID);
        } else if (situation === 'Subject') {
            navigate('/Teacher/addsubject/' + classID);
        }
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <TableTemplate
                    rows={sclassesList.map((sclass) => ({
                        name: sclass.sclassName,
                        id: sclass._id,
                    }))}
                    columns={[{ id: 'name', label: 'Class Name', minWidth: 170 }]}
                    buttonHaver={({ row }) => (
                        <PurpleButton variant="contained" onClick={() => navigateHandler(row.id)}>
                            Choose
                        </PurpleButton>
                    )}
                />
            )}
        </>
    );
};

export default ChooseClass;
