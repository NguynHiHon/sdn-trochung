import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, Chip,
    CircularProgress, Avatar, Divider, Paper, Button,
    Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import ExploreIcon from '@mui/icons-material/Explore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getAssignments } from '../../services/assignmentApi';
import { getAllSchedules } from '../../services/scheduleApi';
import StaffBookingDetailModal from '../../components/staff/StaffBookingDetailModal';

const statusColor = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'default',
};

const statusLabel = {
    pending: 'Chờ xử lý',
    in_progress: 'Đang tư vấn',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

const scheduleStatusColor = {
    Available: 'success',
    Full: 'error',
    Cancelled: 'default',
    Completed: 'info',
};

export default function StaffDashboard() {
    const currentUser = useSelector((state) => state.auth.currentUser);

    const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
    const [recentAssignments, setRecentAssignments] = useState([]);
    const [upcomingTours, setUpcomingTours] = useState([]);
    const [loading, setLoading] = useState(true);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedTourCode, setSelectedTourCode] = useState(null);

    const handleRowClick = (assignment) => {
        setSelectedBookingId(assignment.bookingId?._id || assignment.bookingId);
        setSelectedTourCode(assignment.bookingId?.tourId?.code || null);
        setDetailOpen(true);
    };

    useEffect(() => {
        if (!currentUser?._id) return;

        const fetchData = async () => {
            setLoading(true);

            // Fetch assignments cho stats + preview (độc lập với schedules)
            try {
                const statsRes = await getAssignments({ staffId: currentUser._id, page: 1, limit: 200 });
                const all = statsRes?.data || [];

                const pending = all.filter(a => a.status === 'pending').length;
                const in_progress = all.filter(a => a.status === 'in_progress').length;
                const completed = all.filter(a => a.status === 'completed').length;
                setStats({ total: all.length, pending, in_progress, completed });

                // Preview: ưu tiên pending + in_progress trước, giới hạn 10
                const active = all.filter(a => a.status === 'pending' || a.status === 'in_progress');
                const rest = all.filter(a => a.status !== 'pending' && a.status !== 'in_progress');
                setRecentAssignments([...active, ...rest].slice(0, 10));
            } catch (err) {
                toast.error('Lỗi tải danh sách tư vấn: ' + (err.response?.data?.message || err.message));
            }

            // Fetch upcoming tours (độc lập)
            try {
                const schedRes = await getAllSchedules({ tourGuideId: currentUser._id, status: 'Available', page: 1, limit: 5 });
                setUpcomingTours(schedRes?.data || []);
            } catch {
                // Tours không load được không ảnh hưởng phần tư vấn
            }

            setLoading(false);
        };

        fetchData();
    }, [currentUser?._id]);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Chào buổi sáng';
        if (h < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const statCards = [
        {
            label: 'Tổng nhiệm vụ',
            value: stats.total,
            icon: <AssignmentIcon fontSize="large" />,
            color: '#2b6f56',
            bg: 'rgba(43,111,86,0.08)',
        },
        {
            label: 'Chờ xử lý',
            value: stats.pending,
            icon: <PendingActionsIcon fontSize="large" />,
            color: '#ed6c02',
            bg: 'rgba(237,108,2,0.08)',
        },
        {
            label: 'Đang tư vấn',
            value: stats.in_progress,
            icon: <SyncAltIcon fontSize="large" />,
            color: '#0288d1',
            bg: 'rgba(2,136,209,0.08)',
        },
        {
            label: 'Hoàn thành',
            value: stats.completed,
            icon: <CheckCircleOutlineIcon fontSize="large" />,
            color: '#2e7d32',
            bg: 'rgba(46,125,50,0.08)',
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress sx={{ color: '#2b6f56' }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Welcome header */}
            <Box
                sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #2b6f56 0%, #1a4a39 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Avatar
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        fontSize: 24,
                        fontWeight: 'bold',
                    }}
                >
                    {(currentUser?.fullName || currentUser?.username || 'NV').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        {greeting()}, {currentUser?.fullName || currentUser?.username}!
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        Đây là tổng quan hoạt động của bạn hôm nay.
                    </Typography>
                </Box>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((card) => (
                    <Grid item xs={12} sm={6} md={3} key={card.label}>
                        <Card
                            elevation={0}
                            sx={{
                                border: '1px solid #eee',
                                borderRadius: 3,
                                transition: 'box-shadow 0.2s',
                                '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
                            }}
                        >
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        bgcolor: card.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: card.color,
                                        flexShrink: 0,
                                    }}
                                >
                                    {card.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={700} color={card.color}>
                                        {card.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {card.label}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Recent assignments */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ border: '1px solid #eee', borderRadius: 3, p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AssignmentIcon sx={{ color: '#0288d1' }} />
                                <Typography variant="h6" fontWeight={600}>
                                    Danh sách Tư vấn khách hàng
                                </Typography>
                            </Box>
                            <Button 
                                size="small" 
                                component={Link} 
                                to="/staff/assignments" 
                                endIcon={<ArrowForwardIcon />}
                                sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                                Xem tất cả
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {recentAssignments.length === 0 ? (
                            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                                Chưa có nhiệm vụ nào được phân công!
                            </Typography>
                        ) : (
                            <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Mã Booking</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Tour</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Ngày KH</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Khách hàng</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }} align="center">Số KH</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Nhiệm vụ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentAssignments.map((a) => {
                                            const booking = a.bookingId;
                                            const schedule = booking?.scheduleId;
                                            return (
                                                <TableRow
                                                    key={a._id}
                                                    hover
                                                    onClick={() => handleRowClick(a)}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={700} color="primary.main">
                                                            {booking?.bookingCode || '—'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {booking?.tourId?.code || '—'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ maxWidth: 120 }}>
                                                            {booking?.tourId?.name?.vi || ''}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {schedule?.startDate ? new Date(schedule.startDate).toLocaleDateString('vi-VN') : '—'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {booking?.contactInfo?.fullName || '—'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {booking?.contactInfo?.phone || ''}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {booking?.totalGuests || 0}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={statusLabel[a.status] || a.status}
                                                            size="small"
                                                            color={statusColor[a.status] || 'default'}
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>

                {/* Upcoming tours */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ border: '1px solid #eee', borderRadius: 3, p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <ExploreIcon sx={{ color: '#2b6f56' }} />
                            <Typography variant="h6" fontWeight={600}>
                                Tour sắp tới của bạn
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {upcomingTours.length === 0 ? (
                            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                                Chưa có tour nào được phân công
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {upcomingTours.map((sch) => (
                                    <Box
                                        key={sch._id}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {sch.tourId?.code || '—'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {sch.tourId?.name?.vi || ''}
                                            </Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    🗓 {new Date(sch.startDate).toLocaleDateString('vi-VN')} →{' '}
                                                    {new Date(sch.endDate).toLocaleDateString('vi-VN')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                            <Chip
                                                label={sch.status}
                                                size="small"
                                                color={scheduleStatusColor[sch.status] || 'default'}
                                            />
                                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {sch.bookedSlots}/{sch.capacity} khách
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <StaffBookingDetailModal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                bookingId={selectedBookingId}
                tourCode={selectedTourCode}
            />
        </Box>
    );
}
