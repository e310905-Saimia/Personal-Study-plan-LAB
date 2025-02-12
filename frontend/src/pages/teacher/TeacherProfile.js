import { useSelector } from "react-redux";

const TeacherProfile = () => {
  const { currentUser } = useSelector((state) => state.user);

  console.log("Current User:", currentUser);

  return (
    <div>
      <h2>Teacher Profile</h2>
      <p><strong>Name:</strong> {currentUser?.name || "N/A"}</p>
      <p><strong>Email:</strong> {currentUser?.email || "N/A"}</p>
      <p><strong>School:</strong> {currentUser?.school || "N/A"}</p>
    </div>
  );
};

export default TeacherProfile;
