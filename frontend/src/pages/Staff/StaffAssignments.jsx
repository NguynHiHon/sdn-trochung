import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Chip, CircularProgress, TextField, MenuItem,
    Pagination, Tooltip, Badge, Button, Dialog, DialogTitle, DialogContent,
    DialogActions,
} from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import BlockIcon from '@mui/icons-material/Block';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getAssignments, updateAssignmentStatus } from '../../services/assignmentApi';
import { confirmBooking, cancelBookingByAdmin, createPaymentRequest } from '../../services/bookingApi';
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
    DEPARTED: { label: 'Khởi hành', color: 'warning' },
    CANCELLED: { label: 'Đã hủy', color: 'default' },
    COMPLETED: { label: 'Hoàn thành', color: 'info' },
};

const PAYMENT_STATUS_META = {
    none: { label: 'Chưa yêu cầu thanh toán', color: 'default' },
    requested: { label: 'Đã tạo yêu cầu thanh toán', color: 'info' },
    paid: { label: 'Đã thanh toán', color: 'success' },
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
    const [newCount, setNewCount] = useState(0);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelSubmitting, setCancelSubmitting] = useState(false);
    const [confirmingBookingId, setConfirmingBookingId] = useState(null);
    const [requestingPaymentId, setRequestingPaymentId] = useState(null);
    const [completingAssignmentId, setCompletingAssignmentId] = useState(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedTourCode, setSelectedTourCode] = useState(null);

    const handleRowClick = (assignment) => {
        setSelectedBookingId(assignment.bookingId?._id || assignment.bookingId);
        setSelectedTourCode(assignment.bookingId?.tourId?.code || null);
        setDetailOpen(true);
    };

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

    fetchRef.current = () => fetchAssignments(1, status);

    useEffect(() => {
        fetchAssignments(1, status);
    }, [fetchAssignments, status]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        const handler = (notification) => {
            if (notification?.type === 'assignment') {
                setNewCount(prev => prev + 1);
                toast.info('🔔 Bạn có một phiếu tư vấn mới!', { duration: 4000 });
                fetchRef.current?.();
            }
        };
        socket.on('newNotification', handler);
        return () => socket.off('newNotification', handler);
    }, []);

    const handleStatusChange = async (assignmentId, nextStatus) => {
        if (nextStatus === 'completed') {
            setCompletingAssignmentId(assignmentId);
        }
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
        } finally {
            if (nextStatus === 'completed') {
                setCompletingAssignmentId(null);
            }
        }
    };

    const handleConfirmBooking = async (assignment) => {
        const bookingId = assignment?.bookingId?._id;
        if (!bookingId) return;
        setConfirmingBookingId(bookingId);
        try {
            const res = await confirmBooking(bookingId);
            if (res.success) {
                setAssignments((prev) =>
                    prev.map((a) =>
                        a._id === assignment._id
                            ? { ...a, bookingId: { ...a.bookingId, status: 'CONFIRMED', holdExpiresAt: null } }
                            : a,
                    ),
                );
                toast.success('Đã xác nhận khách chốt tour thành công');
            } else {
                toast.error(res.message || 'Xác nhận khách chốt tour thất bại');
            }
        } catch (err) {
            toast.error('Lỗi xác nhận khách chốt tour: ' + (err.response?.data?.message || err.message));
        } finally {
            setConfirmingBookingId(null);
        }
    };

    const openCancelBookingDialog = (assignment) => {
        setCancelTarget(assignment);
        setCancelReason('');
    };

    const handleConfirmCancelBooking = async () => {
        const bookingId = cancelTarget?.bookingId?._id;
        if (!bookingId) return;
        setCancelSubmitting(true);
        try {
            const res = await cancelBookingByAdmin(bookingId, cancelReason.trim());
            if (res.success) {
                setAssignments((prev) =>
                    prev.map((a) =>
                        a._id === cancelTarget._id
                            ? { ...a, bookingId: { ...a.bookingId, status: 'CANCELLED', cancelReason: cancelReason.trim() } }
                            : a,
                    ),
                );
                toast.success('Đã hủy booking thành công');
                setCancelTarget(null);
            } else {
                toast.error(res.message || 'Hủy booking thất bại');
            }
        } catch (err) {
            toast.error('Lỗi hủy booking: ' + (err.response?.data?.message || err.message));
        } finally {
            setCancelSubmitting(false);
        }
    };

    const handleCreatePaymentRequest = async (assignment) => {
        const bookingId = assignment?.bookingId?._id;
        if (!bookingId) return;
        setRequestingPaymentId(bookingId);
        try {
            const res = await createPaymentRequest(bookingId);
            if (res.success) {
                setAssignments((prev) =>
                    prev.map((a) =>
                        a._id === assignment._id
                            ? {
                                ...a,
                                bookingId: {
                                    ...a.bookingId,
                                    paymentRequest: {
                                        ...(a.bookingId?.paymentRequest || {}),
                                        status: 'requested',
                                        requestedAt: new Date().toISOString(),
                                    },
                                },
                            }
                            : a,
                    ),
                );
                toast.success('Đã tạo yêu cầu thanh toán');
            } else {
                toast.error(res.message || 'Không thể tạo yêu cầu thanh toán');
            }
        } catch (err) {
            toast.error('Lỗi tạo yêu cầu thanh toán: ' + (err.response?.data?.message || err.message));
        } finally {
            setRequestingPaymentId(null);
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
                                    const paymentStatusKey = booking?.paymentRequest?.status || 'none';
                                    const paymentStatus = PAYMENT_STATUS_META[paymentStatusKey] || PAYMENT_STATUS_META.none;
                                    const canConfirmBooking = a.status === 'in_progress' && booking?.status === 'HOLD';
                                    const canCancelBooking =
                                        ['in_progress', 'completed'].includes(a.status) &&
                                        ['HOLD', 'CONFIRMED'].includes(booking?.status);
                                    const canCreatePaymentRequest =
                                        ['in_progress', 'completed'].includes(a.status) &&
                                        booking?.status === 'CONFIRMED' &&
                                        paymentStatusKey === 'none';
                                    const canOpenPaymentPage = Boolean(booking?.bookingCode) && ['requested', 'paid'].includes(paymentStatusKey);
                                    const paymentPageUrl = canOpenPaymentPage
                                        ? `${window.location.origin}/payment/qr/${encodeURIComponent(booking.bookingCode)}`
                                        : '';
                                    const canCompleteConsult =
                                        a.status === 'in_progress' && ['CONFIRMED', 'CANCELLED'].includes(booking?.status);
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
                                                <Typography variant="body2" fontWeight={600}>{tour?.code || '—'}</Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {tour?.name?.vi || ''}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2">{fmt(schedule?.startDate)}</Typography>
                                                {schedule?.endDate && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        → {fmt(schedule.endDate)}
                                                    </Typography>
                                                )}
                                            </TableCell>

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

                                            <TableCell align="center">
                                                <Typography fontWeight={600}>{booking?.totalGuests || 0}</Typography>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={600} color="success.dark">
                                                    {fmtMoney(booking?.totalPrice)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                                                    <Chip label={bStatus.label} size="small" color={bStatus.color} />
                                                    <Chip label={paymentStatus.label} size="small" color={paymentStatus.color} variant="outlined" />
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2">
                                                    {a.assignedBy?.fullName || a.assignedBy?.username || '—'}
                                                </Typography>
                                            </TableCell>

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
                                                ) : a.status === 'in_progress' ? (
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        {canConfirmBooking && (
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => handleConfirmBooking(a)}
                                                                disabled={confirmingBookingId === booking?._id}
                                                            >
                                                                {confirmingBookingId === booking?._id ? 'Đang xác nhận...' : 'Xác nhận khách chốt tour'}
                                                            </Button>
                                                        )}

                                                        {canCreatePaymentRequest && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="primary"
                                                                startIcon={<PaidOutlinedIcon fontSize="small" />}
                                                                onClick={() => handleCreatePaymentRequest(a)}
                                                                disabled={requestingPaymentId === booking?._id}
                                                            >
                                                                {requestingPaymentId === booking?._id ? 'Đang tạo...' : 'Tạo yêu cầu thanh toán'}
                                                            </Button>
                                                        )}

                                                        {canOpenPaymentPage && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => window.open(paymentPageUrl, '_blank', 'noopener,noreferrer')}
                                                            >
                                                                Mở trang thanh toán
                                                            </Button>
                                                        )}

                                                        {canCompleteConsult && (
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="info"
                                                                startIcon={<CheckCircleOutlineIcon fontSize="small" />}
                                                                onClick={() => handleStatusChange(a._id, 'completed')}
                                                                disabled={completingAssignmentId === a._id}
                                                            >
                                                                {completingAssignmentId === a._id ? 'Đang lưu...' : 'Hoàn thành tư vấn'}
                                                            </Button>
                                                        )}

                                                        {canCancelBooking && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                startIcon={<BlockIcon fontSize="small" />}
                                                                onClick={() => openCancelBookingDialog(a)}
                                                            >
                                                                Hủy booking
                                                            </Button>
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: 'flex-start' }}>
                                                        <Chip
                                                            label={STATUS_META[a.status]?.label || a.status}
                                                            size="small"
                                                            color={STATUS_META[a.status]?.color || 'default'}
                                                        />
                                                        {canCreatePaymentRequest && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="primary"
                                                                startIcon={<PaidOutlinedIcon fontSize="small" />}
                                                                onClick={() => handleCreatePaymentRequest(a)}
                                                                disabled={requestingPaymentId === booking?._id}
                                                            >
                                                                {requestingPaymentId === booking?._id ? 'Đang tạo...' : 'Tạo yêu cầu thanh toán'}
                                                            </Button>
                                                        )}

                                                        {canOpenPaymentPage && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => window.open(paymentPageUrl, '_blank', 'noopener,noreferrer')}
                                                            >
                                                                Mở trang thanh toán
                                                            </Button>
                                                        )}

                                                        {canCancelBooking && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                startIcon={<BlockIcon fontSize="small" />}
                                                                onClick={() => openCancelBookingDialog(a)}
                                                            >
                                                                Hủy booking
                                                            </Button>
                                                        )}
                                                    </Box>
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

            <Dialog
                open={Boolean(cancelTarget)}
                onClose={() => !cancelSubmitting && setCancelTarget(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Xác nhận hủy booking</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Bạn có chắc muốn hủy booking {cancelTarget?.bookingId?.bookingCode}?
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Lý do hủy booking"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Nhập lý do hủy để lưu lịch sử"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelTarget(null)} disabled={cancelSubmitting}>Đóng</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleConfirmCancelBooking}
                        disabled={cancelSubmitting}
                    >
                        {cancelSubmitting ? 'Đang hủy...' : 'Xác nhận hủy'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
