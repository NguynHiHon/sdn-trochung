import React, { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../services/userService';
import { signOutUser } from '../services/authService';
import { useDispatch } from 'react-redux';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profile, isFetching, error } = useSelector((state) => state.user);
  const accessToken = useSelector((state) => state.token.accessToken);

  const handleFetchProfile = useCallback(async () => {
    try {
      await fetchUserProfile(dispatch);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Fetch user profile khi component mount
    if (!profile && accessToken) {
      handleFetchProfile();
    }
    
  }, [isAuthenticated, profile, accessToken, navigate, handleFetchProfile]);

  const handleLogout = async () => {
    await signOutUser(dispatch, navigate);
  };

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', p: 4 }}>
      <Card sx={{ maxWidth: 600, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Profile
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Không thể tải thông tin người dùng
            </Alert>
          )}

          {profile && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Username:</strong> {profile.username}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Role:</strong> {profile.role}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>ID:</strong> {profile._id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Created At:</strong> {new Date(profile.createdAt).toLocaleString()}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleFetchProfile}>
              Refresh Profile
            </Button>
            <Button variant="outlined" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
            <Typography variant="caption" display="block" gutterBottom>
              <strong>Test Refresh Token:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              - AccessToken sẽ hết hạn sau 30 giây
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              - Click "Refresh Profile" sau 30 giây để test refresh token tự động
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              - Nếu RefreshToken còn hạn, accessToken sẽ được làm mới tự động
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
