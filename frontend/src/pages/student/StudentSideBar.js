import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AssignmentIcon from '@mui/icons-material/Assignment';

const StudentSideBar = () => {
    const location = useLocation();

    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/Student/dashboard/home">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === "/Student/dashboard/home" ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>

                <ListItemButton component={Link} to="/Student/dashboard/subjects">
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.startsWith("/Student/dashboard/subjects") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" />
                </ListItemButton>
            </React.Fragment>

            <Divider sx={{ my: 1 }} />

            <React.Fragment>
                <ListItemButton component={Link} to="/logout">
                    <ListItemIcon>
                        <ExitToAppIcon color={location.pathname.startsWith("/logout") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </React.Fragment>
        </>
    );
}

export default StudentSideBar;
