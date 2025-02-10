// import React from "react";
// import { NavLink } from "react-router-dom";
// import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
// import HomeIcon from "@mui/icons-material/Home";
// import SubjectIcon from "@mui/icons-material/Subject";
// import PersonIcon from "@mui/icons-material/Person";
// import NoticeIcon from "@mui/icons-material/Announcement";

// const SideBar = () => {
//   const menuItems = [
//     { text: "Home", path: "/Teacher/dashboard/", icon: <HomeIcon /> },
//     {
//       text: "Subjects",
//       path: "/Teacher/dashboard/subjects",
//       icon: <SubjectIcon />,
//     },
//     {
//       text: "Students",
//       path: "/Teacher/dashboard/students",
//       icon: <PersonIcon />,
//     },
//     {
//       text: "Notices",
//       path: "/Teacher/dashboard/notices",
//       icon: <NoticeIcon />,
//     },
//   ];

//   return (
//     <List>
//       {menuItems.map((item, index) => (
//         <ListItem

//           component={NavLink}
//           to={item.path}
//           key={index}
//           activeClassName="Mui-selected"
//         >
//           <ListItemIcon>{item.icon}</ListItemIcon>
//           <ListItemText primary={item.text} />
//         </ListItem>
//       ))}
//     </List>
//   );
// };

// export default SideBar;

import React from "react";
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
// import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";

const SideBar = () => {
  const location = useLocation();

  return (
    <>
      <React.Fragment>
        

        <ListItemButton component={Link} to="/Teacher/dashboard/home">
          <ListItemIcon>
            <HomeIcon
              color={
                location.pathname.startsWith("/Teacher/dashboard/home")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <ListItemButton component={Link} to="/Teacher/dashboard/subjects">
          <ListItemIcon>
            <AssignmentIcon
              color={
                location.pathname.startsWith("/Teacher/dashboard/subjects")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Subjects" />
        </ListItemButton>

        <ListItemButton component={Link} to="/Teacher/dashboard/students">
          <ListItemIcon>
            <PersonOutlineIcon
              color={
                location.pathname.startsWith("/Teacher/dashboard/students")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Students" />
        </ListItemButton>

        <ListItemButton component={Link} to="/Teacher/dashboard/notices">
          <ListItemIcon>
            <AnnouncementOutlinedIcon
              color={
                location.pathname.startsWith("/Teacher/dashboard/notices")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Notices" />
        </ListItemButton>
      </React.Fragment>

      <Divider sx={{ my: 1 }} />

      <React.Fragment>
        

        {/* Logout */}
        <ListItemButton component={Link} to="/logout">
          <ListItemIcon>
            <ExitToAppIcon
              color={
                location.pathname.startsWith("/logout") ? "primary" : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </React.Fragment>
    </>
  );
};

export default SideBar;
