import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, BottomNavigation, BottomNavigationAction, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getSubjectDetails, getClassStudents } from "../../../redux/sclassRelated/sclassHandle";
import TableTemplate from "../../../components/TableTemplate";
import { GreenButton, BlueButton, PurpleButton } from "../../../components/buttonStyles";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import TableChartIcon from "@mui/icons-material/TableChart";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";

const ViewSubject = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { classID, subjectID } = useParams();

  const { subjectDetails, sclassStudents, loading, error } = useSelector((state) => state.sclass);

  const [selectedSection, setSelectedSection] = useState("attendance");
  const [value] = useState("1");

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          Failed to load subject details. Please try again.
        </Typography>
      </Box>
    );
  }

  const handleSectionChange = (event, newSection) => {
    setSelectedSection(newSection);
  };

  const studentColumns = [
    { id: "rollNum", label: "Roll No.", minWidth: 100 },
    { id: "name", label: "Name", minWidth: 170 },
  ];

  const studentRows = sclassStudents.map((student) => ({
    rollNum: student.rollNum,
    name: student.name,
    id: student._id,
  }));

  const StudentsAttendanceButtonHaver = ({ row }) => (
    <>
      <BlueButton onClick={() => navigate(`/Teacher/students/student/${row.id}`)}>View</BlueButton>
      <PurpleButton
        onClick={() =>
          navigate(`/Teacher/subject/student/attendance/${row.id}/${subjectID}`)
        }
      >
        Take Attendance
      </PurpleButton>
    </>
  );

  const StudentsMarksButtonHaver = ({ row }) => (
    <>
      <BlueButton onClick={() => navigate(`/Teacher/students/student/${row.id}`)}>View</BlueButton>
      <PurpleButton onClick={() => navigate(`/Teacher/subject/student/marks/${row.id}/${subjectID}`)}>
        Provide Marks
      </PurpleButton>
    </>
  );

  const SubjectDetailsSection = () => (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Subject Details
      </Typography>
      <Typography variant="h6" gutterBottom>
        Subject Name: {subjectDetails?.subName || "N/A"}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Subject Code: {subjectDetails?.subCode || "N/A"}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Subject Sessions: {subjectDetails?.sessions || "N/A"}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Class Name: {subjectDetails?.sclassName?.sclassName || "N/A"}
      </Typography>
      {subjectDetails?.teacher ? (
        <Typography variant="h6" gutterBottom>
          Teacher Name: {subjectDetails.teacher.name}
        </Typography>
      ) : (
        <GreenButton
          onClick={() => navigate(`/Teacher/teachers/addteacher/${subjectDetails?._id}`)}
        >
          Add Subject Teacher
        </GreenButton>
      )}
    </Box>
  );

  const SubjectStudentsSection = () => (
    <>
      <Typography variant="h5" gutterBottom>
        Students List:
      </Typography>
      {selectedSection === "attendance" && (
        <TableTemplate
          buttonHaver={StudentsAttendanceButtonHaver}
          columns={studentColumns}
          rows={studentRows}
        />
      )}
      {selectedSection === "marks" && (
        <TableTemplate
          buttonHaver={StudentsMarksButtonHaver}
          columns={studentColumns}
          rows={studentRows}
        />
      )}

      <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          value={selectedSection}
          onChange={handleSectionChange}
          showLabels
        >
          <BottomNavigationAction
            label="Attendance"
            value="attendance"
            icon={
              selectedSection === "attendance" ? (
                <TableChartIcon />
              ) : (
                <TableChartOutlinedIcon />
              )
            }
          />
          <BottomNavigationAction
            label="Marks"
            value="marks"
            icon={
              selectedSection === "marks" ? (
                <InsertChartIcon />
              ) : (
                <InsertChartOutlinedIcon />
              )
            }
          />
        </BottomNavigation>
      </Paper>
    </>
  );

  return (
    <Box>
      <Box sx={{ width: "100%", typography: "body1" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" align="center" gutterBottom>
            Subject Management
          </Typography>
        </Box>
        <Box sx={{ marginTop: "2rem", marginBottom: "4rem" }}>
          {value === "1" && <SubjectDetailsSection />}
          {value === "2" && <SubjectStudentsSection />}
        </Box>
      </Box>
    </Box>
  );
};

export default ViewSubject;
