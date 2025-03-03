import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications } from "../../../redux/noticeRelated/notificationHandle";
import {
    Box, Typography, Button, Paper, 
    Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// This component helps debug notification issues
const NotificationDebugger = () => {
    const dispatch = useDispatch();
    const { notifications, loading, error } = useSelector((state) => state.notification);
    const { currentUser } = useSelector((state) => state.user);
    const [lastFetched, setLastFetched] = useState(null);

    const fetchNotifications = () => {
        dispatch(getNotifications());
        setLastFetched(new Date());
    };

    useEffect(() => {
        fetchNotifications();
        
        // Log user info to help debug
        console.log("User information:", {
            user: currentUser,
            role: currentUser?.role,
            isTeacherByRole: currentUser?.role === 'Teacher',
            isTeacherByURL: window.location.pathname.includes('/Teacher/'),
            isTeacherByMethod: determineIfTeacher()
        });
    }, []);
    
    // Helper function to determine if user is a teacher
    const determineIfTeacher = () => {
        // Check multiple ways to determine if the user is a teacher
        return (
            currentUser?.role === 'Teacher' ||
            window.location.pathname.includes('/Teacher/') ||
            window.location.href.includes('/Teacher/dashboard/notices')
        );
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Notification Debugger
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">User Info</Typography>
                <pre>{JSON.stringify({ 
                    id: currentUser?._id,
                    role: currentUser?.role,
                    name: currentUser?.name
                }, null, 2)}</pre>
                
                <Button 
                    variant="contained" 
                    onClick={fetchNotifications}
                    sx={{ mt: 2 }}
                >
                    Refresh Notifications
                </Button>
                
                {lastFetched && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Last fetched: {lastFetched.toLocaleString()}
                    </Typography>
                )}
            </Paper>
            
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">Notification State</Typography>
                <pre>
                    {`Loading: ${loading}\nError: ${error ? JSON.stringify(error) : 'none'}\nCount: ${notifications?.length || 0}`}
                </pre>
            </Paper>
            
            <Typography variant="h6" gutterBottom>
                Raw Notifications Data
            </Typography>
            
            {notifications && notifications.length > 0 ? (
                notifications.map((notification, index) => (
                    <Accordion key={notification._id || index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                                #{index+1}: {notification.message?.substring(0, 50)}...
                                {notification.status === 'pending' && " (Pending)"}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <pre>{JSON.stringify(notification, null, 2)}</pre>
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Paper sx={{ p: 2 }}>
                    <Typography>No notifications found in Redux store</Typography>
                </Paper>
            )}
        </Box>
    );
};

export default NotificationDebugger;