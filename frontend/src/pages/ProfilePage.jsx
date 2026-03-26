import React, { useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../services/userService';
import { signOutUser } from '../services/authService';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const { profile, isFetching, error } = useSelector((state) => state.user);
  const accessToken = useSelector((state) => state.token.accessToken);

  const profileData = useMemo(() => {
    if (profile) return profile;
    return currentUser || null;
  }, [profile, currentUser]);

  const roleLabel = useMemo(() => {
    const role = profileData?.role;
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'staff') return 'Nhân viên tư vấn';
    if (role === 'user') return 'Khách hàng';
    return 'Người dùng';
  }, [profileData?.role]);

  const backPath = useMemo(() => {
    if (profileData?.role === 'admin') return '/manager';
    if (profileData?.role === 'staff') return '/staff';
    return '/';
  }, [profileData?.role]);

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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef6ff 0%, #f7fbf9 55%, #ffffff 100%)',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4, md: 6 },
      }}
    >
      <Card
        sx={{
          maxWidth: 760,
          margin: '0 auto',
          borderRadius: 3,
          border: '1px solid rgba(24,87,66,0.12)',
          boxShadow: '0 14px 44px rgba(15, 54, 40, 0.08)',
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 58, height: 58, bgcolor: '#2b6f56', fontWeight: 700 }}>
                {(profileData?.fullName || profileData?.username || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a4a39' }}>
                  Trang cá nhân
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quản lý thông tin tài khoản của bạn
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(backPath)}
                sx={{ textTransform: 'none' }}
              >
                Quay lại
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutOutlinedIcon />}
                onClick={handleLogout}
                sx={{ textTransform: 'none' }}
              >
                Đăng xuất
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Không thể tải thông tin người dùng
            </Alert>
          )}

          {profileData && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
                <Chip label={roleLabel} color="success" variant="outlined" />
                {profileData?.isActive === false && (
                  <Chip label="Tài khoản tạm khóa" color="error" size="small" />
                )}
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Họ tên</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {profileData.fullName || 'Chưa cập nhật'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Tên đăng nhập</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {profileData.username || 'Chưa cập nhật'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Vai trò</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {roleLabel}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Mã tài khoản</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {profileData._id || profileData.id || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Box>
                <Typography variant="caption" color="text.secondary">Ngày tạo</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {profileData.createdAt ? new Date(profileData.createdAt).toLocaleString() : 'Không có dữ liệu'}
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={handleFetchProfile}>
              Làm mới thông tin
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
