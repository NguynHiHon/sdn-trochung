import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Card,
    CardContent,
    Avatar,
    Chip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { signOutUser } from '../../services/authService';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated || currentUser?.role !== 'admin') {
            navigate('/signin');
        }
    }, [isAuthenticated, currentUser, navigate]);

    const handleLogout = async () => {
        await signOutUser(dispatch, navigate);
    };

    if (!currentUser) return null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>
            <AppBar position="static" sx={{ bgcolor: '#005941' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettingsIcon />
                        <Typography variant="h6" fontWeight="bold">
                            Trang Quản Trị
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1">
                            Xin chào, <strong>{currentUser.username}</strong>
                        </Typography>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{ borderColor: 'rgba(255,255,255,0.7)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            Đăng xuất
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3 }}>
                        <Avatar sx={{ width: 72, height: 72, bgcolor: '#005941', fontSize: '2rem' }}>
                            {currentUser.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {currentUser.username}
                            </Typography>
                            <Chip
                                label="Admin"
                                size="small"
                                sx={{ mt: 0.5, bgcolor: '#005941', color: '#fff', fontWeight: 600 }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                ID: {currentUser._id}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 600 }}>
                    Bảng điều khiển quản trị
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Chào mừng bạn đến trang quản trị hệ thống.
                </Typography>
            </Container>
        </Box>
    );
};

export default AdminDashboard;
