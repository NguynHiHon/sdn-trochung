import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Button, Tooltip, Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExploreIcon from '@mui/icons-material/Explore';
import LogoutIcon from '@mui/icons-material/Logout';
import { signOutUser } from '../../services/authService';
import { connectSocket, disconnectSocket } from '../../config/socketClient';
import StaffNotificationBell from '../staff/StaffNotificationBell';

const drawerWidth = 240;

export default function StaffLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth.currentUser);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    // Route guard: chưa đăng nhập hoặc không phải admin/staff → redirect signin
    if (!isAuthenticated || !currentUser) {
        return <Navigate to="/signin" replace />;
    }
    if (currentUser.role !== 'staff' && currentUser.role !== 'admin') {
        return <Navigate to="/signin" replace />;
    }

    // Kết nối socket khi layout mount, ngắt khi unmount
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (currentUser?._id) {
            connectSocket(currentUser._id, currentUser.role);
        }
        return () => {
            disconnectSocket();
        };
    }, [currentUser?._id]);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleLogout = () => {
        signOutUser(dispatch, navigate);
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/staff' },
        { text: 'Tư vấn khách hàng', icon: <AssignmentIcon />, path: '/staff/assignments' },
        { text: 'Quản lý Lịch', icon: <ExploreIcon />, path: '/staff/tours' },
    ];

    const isActive = (path) => {
        if (path === '/staff') return location.pathname === '/staff';
        return location.pathname.startsWith(path);
    };

    const drawer = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: '#2b6f56', letterSpacing: 1 }}>
                    OXALIS STAFF
                </Typography>
            </Toolbar>
            <Divider />

            {/* User info */}
            <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(43,111,86,0.04)' }}>
                <Avatar sx={{ bgcolor: '#2b6f56', width: 38, height: 38, fontSize: 16, fontWeight: 'bold' }}>
                    {(currentUser?.fullName || currentUser?.username || 'NV').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                        {currentUser?.fullName || currentUser?.username}
                    </Typography>
                    <Chip
                        label="Nhân viên"
                        size="small"
                        sx={{ height: 18, fontSize: 11, bgcolor: 'rgba(43,111,86,0.15)', color: '#2b6f56', fontWeight: 600 }}
                    />
                </Box>
            </Box>
            <Divider />

            {/* Navigation */}
            <List sx={{ flexGrow: 1, pt: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={isActive(item.path)}
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                            sx={{
                                mx: 1,
                                borderRadius: 2,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(43,111,86,0.10)',
                                    color: '#2b6f56',
                                },
                                '&.Mui-selected:hover': {
                                    backgroundColor: 'rgba(43,111,86,0.15)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: isActive(item.path) ? '#2b6f56' : 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: isActive(item.path) ? 700 : 400,
                                    fontSize: 14,
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />
            {/* Logout */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    Đăng xuất
                </Button>
            </Box>
        </div>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: '#ffffff',
                    color: '#333',
                    borderBottom: '1px solid #eee',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        {menuItems.find(m => isActive(m.path))?.text || 'Khu vực Nhân viên'}
                    </Typography>
                    <Tooltip title="Đăng xuất">
                        <IconButton color="error" onClick={handleLogout} sx={{ display: { sm: 'none' } }}>
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                        <StaffNotificationBell />
                        <Avatar sx={{ bgcolor: '#2b6f56', width: 34, height: 34, fontSize: 14, fontWeight: 'bold' }}>
                            {(currentUser?.fullName || currentUser?.username || 'NV').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                            {currentUser?.fullName || currentUser?.username}
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="staff folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #eee' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
