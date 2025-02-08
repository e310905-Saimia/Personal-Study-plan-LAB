import { useSelector } from 'react-redux';
const TeacherProfile = () => {
        const { currentUser } = useSelector((state) => state.user);
    return (
        <div>
            Name: {currentUser.name}
            <br />
            Email: {currentUser.email}
            <br />
            School: {currentUser.schoolName}
            <br />
            
        </div>
    )
}
export default TeacherProfile;
