import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Avatar, 
  Card, 
  CardContent, 
  Box,
  Divider
} from '@mui/material';
import { useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';

// Utility function to format name from email
const formatNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return 'User';
  
  // Split the email into name part
  const namePart = email.split('@')[0];
  
  // Handle different email formats
  const formattedName = namePart
    .split('.')  // Split by dot for emails like firoz.thapa
    .map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(' ');
  
  return formattedName || 'User';
};

// Styled components for enhanced UI
const ProfilePaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(145deg, #f0f0f0 0%, #e6e6e6 100%)',
  borderRadius: '16px',
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 180,
  height: 180,
  margin: '0 auto',
  fontSize: '4rem',
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
}));

const TeacherProfile = () => {
  const { currentUser } = useSelector((state) => state.user);

  // Function to extract name safely
  const getUserName = () => {
    // Check multiple possible locations for the name
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.teacher?.name) return currentUser.teacher.name;
    
    // If no name, format name from email
    const email = currentUser?.email || 
                  currentUser?.teacher?.email || 
                  'user@example.com';
    
    return formatNameFromEmail(email);
  };

  // Function to extract email safely
  const getUserEmail = () => {
    if (currentUser?.email) return currentUser.email;
    if (currentUser?.teacher?.email) return currentUser.teacher.email;
    return 'N/A';
  };

  const userName = getUserName();
  const userEmail = getUserEmail();

  return (
    <Container maxWidth="md">
      <ProfilePaper elevation={3}>
        <Grid container spacing={3} direction="column" alignItems="center">
          <Grid item>
            <ProfileAvatar>
              {userName.charAt(0).toUpperCase()}
            </ProfileAvatar>
          </Grid>
          
          <Grid item>
            <Typography 
              variant="h4" 
              color="primary" 
              style={{ 
                fontWeight: 600, 
                letterSpacing: '0.5px' 
              }}
            >
              {userName}
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="textSecondary" 
              align="center"
            >
              Teacher
            </Typography>
          </Grid>
        </Grid>
      </ProfilePaper>

      <Card 
        sx={{ 
          borderRadius: '16px', 
          boxShadow: '0 8px 15px rgba(0,0,0,0.1)' 
        }}
      >
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom 
            color="primary" 
            style={{ fontWeight: 600 }}
          >
            Personal Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Name:</strong> {userName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Email:</strong> {userEmail}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TeacherProfile;