import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications, clearNotifications } from "../../../redux/noticeRelated/notificationHandle"; // ✅ Corrected

import {
    Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, IconButton, Tooltip
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ShowNotices = () => {
    const dispatch = useDispatch();
    const { notifications, loading } = useSelector((state) => state.notification);

    useEffect(() => {
        dispatch(getNotifications()); // ✅ Correct API call
    }, [dispatch]);

    const handleClearNotifications = () => {
        dispatch(clearNotifications());
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Notifications
                <Tooltip title="Mark all as read">
                    <IconButton onClick={handleClearNotifications} sx={{ ml: 2 }}>
                        <CheckCircleIcon color="primary" />
                    </IconButton>
                </Tooltip>
            </Typography>
            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Message</TableCell>
                                    <TableCell align="right">Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {notifications.length > 0 ? (
                                    notifications.map((notif, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{notif.message}</TableCell>
                                            <TableCell align="right">{new Date(notif.date).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            No new notifications.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default ShowNotices;
