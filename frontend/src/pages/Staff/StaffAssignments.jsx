import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Chip, CircularProgress, TextField, MenuItem,
    Pagination, Tooltip, Badge, Button,
} from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getAssignments, updateAssignmentStatus } from '../../services/assignmentApi';
import { getSocket } from '../../config/socketClient';
import StaffBookingDetailModal from '../../components/staff/StaffBookingDetailModal';

const STATUS_META = {
    pending: { label: 'Chờ xử lý', color: 'warning' },
    in_progress: { label: 'Đang tư vấn', color: 'info' },
    completed: { label: 'Hoàn thành', color: 'success' },
    cancelled: { label: 'Đã hủy', color: 'default' },
};

const BOOKING_STATUS_META = {
    HOLD: { label: 'Giữ chỗ', color: 'warning' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'success' },
    CANCELLED: { label: 'Đã hủy', color: 'default' },
    COMPLETED: { label: 'Hoàn thành', color: 'info' },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtMoney = (n) => n != null ? n.toLocaleString('vi-VN') + '₫' : '—';

export default function StaffAssignments() {
    const currentUser = useSelector((state) => state.auth.currentUser);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [newCount, setNewCount] = useState(0); // badge đếm assignment mới chưa xẻ

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedTourCode, setSelectedTourCode] = useState(null);

    const handleRowClick = (assignment) => {
        setSelectedBookingId(assignment.bookingId?._id || assignment.bookingId);
        setSelectedTourCode(assignment.bookingId?.tourId?.code || null);
        setDetailOpen(true);
    };

    // ref để fetchAssignments có thể gọi từ socket listener mà không stale closure
    const fetchRef = useRef(null);

    const fetchAssignments = useCallback(async (p, st) => {
        if (!currentUser?._id) return;
        setLoading(true);
        try {
            const res = await getAssignments({ staffId: currentUser._id, status: st, page: p, limit: 10 });
            if (res.success) {
                setAssignments(res.data || []);
                setPage(res.page || 1);
                setTotalPages(res.totalPages || 1);
                setTotal(res.total || 0);
            }
        } catch (err) {
            toast.error('Lỗi tải danh sách: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [currentUser?._id]);

    // Giữ ref luôn cập nhật để socket listener không stale
    fetchRef.current = () => fetchAssignments(1, status);

    useEffect(() => {
        fetchAssignments(1, status);
    }, [fetchAssignments, status]);

    // Socket listener — tự động refresh khi admin phân công mới
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = (notification) => {
            if (notification?.type === 'assignment') {
                setNewCount(prev => prev + 1);
                toast.info('🔔 Bạn có một phiếu tư vấn mới!', { duration: 4000 });
                // Refresh trang 1 với filter hiện tại
                fetchRef.current?.();
            }
        };

        socket.on('newNotification', handler);
        return () => socket.off('newNotification', handler);
    }, []);

    const handleStatusChange = async (assignmentId, nextStatus) => {
        try {
            const res = await updateAssignmentStatus(assignmentId, nextStatus);
            if (res.success) {
                if (res.data?.removed) {
                    setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
                    setTotal((prev) => Math.max(0, prev - 1));
                    toast.success('Đã từ chối yêu cầu tư vấn. Admin sẽ phân công nhân viên khác.');
                    return;
                }

                setAssignments((prev) => prev.map(a => a._id === assignmentId ? res.data : a));
                toast.success('Cập nhật trạng thái thành công');
            } else {
                toast.error(res.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <Box>
            {/* Page header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AssignmentIndIcon sx={{ color: '#2b6f56', fontSize: 28 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight={700}>Tư vấn khách hàng</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Danh sách booking admin đã phân công cho bạn
                    </Typography>
                </Box>
                {newCount > 0 && (
                    <Badge badgeContent={newCount} color="error">
                        <NotificationsActiveIcon sx={{ color: '#ed6c02', fontSize: 26 }} />
                    </Badge>
                )}
            </Box>

            {/* Filter bar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    select
                    label="Trạng thái nhiệm vụ"
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    sx={{ minWidth: 200, bgcolor: 'white' }}
                >
                    <MenuItem value="all">Tất cả</MenuItem>
                    {Object.entries(STATUS_META).map(([val, { label }]) => (
                        <MenuItem key={val} value={val}>{label}</MenuItem>
                    ))}
                </TextField>
                {!loading && (
                    <Typography variant="body2" color="text.secondary">
                        Tổng: <strong>{total}</strong> nhiệm vụ
                    </Typography>
                )}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                    <CircularProgress sx={{ color: '#2b6f56' }} />
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Mã Booking</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Tour</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Ngày KH</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Khách hàng</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="center">Số KH</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Tổng tiền</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>TT Booking</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Phân công bởi</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Ghi chú</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Nhiệm vụ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assignments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                            Chưa có nhiệm vụ nào được phân công
                                        </TableCell>
                                    </TableRow>
                                ) : assignments.map((a) => {
                                    const booking = a.bookingId;
                                    const tour = booking?.tourId;
                                    const schedule = booking?.scheduleId;
                                    const bStatus = BOOKING_STATUS_META[booking?.status] || { label: booking?.status, color: 'default' };
                                    const aStatus = STATUS_META[a.status] || { label: a.status, color: 'default' };
                                    return (
                                        <TableRow
                                            key={a._id}
                                            hover
                                            onClick={() => handleRowClick(a)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            {/* Booking code */}
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700} color="primary.main">
                                                    {booking?.bookingCode || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Tour */}
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {tour?.code || '—'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {tour?.name?.vi || ''}
                                                </Typography>
                                            </TableCell>

                                            {/* Schedule date */}
                                            <TableCell>
                                                <Typography variant="body2">{fmt(schedule?.startDate)}</Typography>
                                                {schedule?.endDate && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        → {fmt(schedule.endDate)}
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            {/* Contact info */}
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {booking?.contactInfo?.fullName || '—'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {booking?.contactInfo?.phone || ''}
                                                </Typography>
                                                {booking?.contactInfo?.contactMethod && booking.contactInfo.contactMethod !== 'None' && (
                                                    <Chip
                                                        label={booking.contactInfo.contactMethod}
                                                        size="small"
                                                        sx={{ height: 18, fontSize: 10, mt: 0.5 }}
                                                        variant="outlined"
                                                    />
                                                )}
                                            </TableCell>

                                            {/* Guests */}
                                            <TableCell align="center">
                                                <Typography fontWeight={600}>{booking?.totalGuests || 0}</Typography>
                                            </TableCell>

                                            {/* Price */}
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={600} color="success.dark">
                                                    {fmtMoney(booking?.totalPrice)}
                                                </Typography>
                                            </TableCell>

                                            {/* Booking status */}
                                            <TableCell>
                                                <Chip label={bStatus.label} size="small" color={bStatus.color} />
                                            </TableCell>

                                            {/* Assigned by */}
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {a.assignedBy?.fullName || a.assignedBy?.username || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Note */}
                                            <TableCell sx={{ maxWidth: 160 }}>
                                                {a.note ? (
                                                    <Tooltip title={a.note} arrow>
                                                        <Typography variant="body2" noWrap color="text.secondary" sx={{ cursor: 'help' }}>
                                                            {a.note}
                                                        </Typography>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="text.disabled">—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Assignment actions */}
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                {a.status === 'pending' ? (
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="info"
                                                            onClick={() => handleStatusChange(a._id, 'in_progress')}
                                                        >
                                                            Tiếp nhận
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => handleStatusChange(a._id, 'cancelled')}
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    </Box>
                                                ) : (
                                                    <Chip
                                                        label={STATUS_META[a.status]?.label || a.status}
                                                        size="small"
                                                        color={STATUS_META[a.status]?.color || 'default'}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, v) => { setPage(v); fetchAssignments(v, status); }}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}

            <StaffBookingDetailModal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                bookingId={selectedBookingId}
                tourCode={selectedTourCode}
            />
        </Box>
    );
}
