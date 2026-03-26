import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Chip, TextField, MenuItem, Pagination,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Divider, Alert,
    Autocomplete, Stack
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { toast } from 'sonner';
import { getAllBookings, confirmBooking, cancelBookingByAdmin, completeBooking } from '../../services/bookingApi';
import { getParticipantsByBookingId, updateParticipantReviewStatus } from '../../services/participantApi';
import { getAllTours } from '../../services/tourApi';
import { getStaffList } from '../../services/userApi';
import { assignBooking } from '../../services/assignmentApi';

const statusColor = { HOLD: 'warning', CONFIRMED: 'success', CANCELLED: 'error', COMPLETED: 'info' };

export default function BookingManager() {
    const [bookings, setBookings] = useState([]);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterTour, setFilterTour] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [openDetail, setOpenDetail] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [updatingParticipantId, setUpdatingParticipantId] = useState('');

    const [assignDialog, setAssignDialog] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [assignNote, setAssignNote] = useState('');
    const [assigning, setAssigning] = useState(false);

    const [updatingBookingStatus, setUpdatingBookingStatus] = useState(false);
    const [cancelReasonDialog, setCancelReasonDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const fetchBookings = useCallback(async (t = filterTour, st = filterStatus, p = 1) => {
        try {
            setLoading(true);
            const res = await getAllBookings({ tourId: t, status: st, page: p, limit: 10 });
            if (res.success) {
                setBookings(res.data || []);
                setTotalPages(res.totalPages || 1);
                setPage(res.page || 1);
            }
        } catch (err) {
            toast.error('Lỗi tải danh sách Booking: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [filterTour, filterStatus]);

    useEffect(() => {
        fetchBookings();
        getAllTours({ limit: 100 }).then((res) => { if (res.success) setTours(res.data); });
    }, [fetchBookings]);

    const handleSearch = () => {
        setPage(1);
        fetchBookings(filterTour, filterStatus, 1);
    };

    const handleOpenAssign = async (booking) => {
        setAssignDialog(booking);
        setSelectedStaff(booking?.consultantAssignment?.staff?._id || '');
        setAssignNote(booking?.consultantAssignment?.note || '');
        try {
            const res = await getStaffList();
            if (res.success) setStaffList(res.data);
        } catch {
            toast.error('Không thể tải danh sách nhân viên');
        }
    };

    const handleAssign = async () => {
        setAssigning(true);
        try {
            const res = await assignBooking({ bookingId: assignDialog._id, staffId: selectedStaff, note: assignNote });
            if (res.success) {
                toast.success(res.message || 'Đã phân công');
                setAssignDialog(null);
                fetchBookings(filterTour, filterStatus, page);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi phân công');
        } finally {
            setAssigning(false);
        }
    };

    const handleViewDetail = async (booking) => {
        setSelectedBooking(booking);
        setOpenDetail(true);
        setLoadingParticipants(true);
        try {
            const res = await getParticipantsByBookingId(booking._id);
            if (res.success) {
                setParticipants(res.data || []);
            }
        } catch {
            toast.error('Không thể tải thông tin hành khách');
        } finally {
            setLoadingParticipants(false);
        }
    };

    const reviewStatusLabel = {
        approved: 'Đáp ứng',
        rejected: 'Không đáp ứng',
    };

    const reviewStatusColor = {
        approved: 'success',
        rejected: 'error',
    };

    const isBookingStage = ['HOLD', 'CONFIRMED'].includes(selectedBooking?.status);

    const handleUpdateParticipantReviewStatus = async (participantId, nextStatus) => {
        if (!isBookingStage) {
            toast.warning('Booking đã hoàn thành/hủy, không thể đổi trạng thái khách');
            return;
        }

        setUpdatingParticipantId(participantId);
        try {
            const res = await updateParticipantReviewStatus(participantId, nextStatus);
            if (res.success) {
                toast.success('Đã cập nhật trạng thái khách');
                setParticipants((prev) => prev.map((p) => (p._id === participantId ? res.data : p)));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái khách');
        } finally {
            setUpdatingParticipantId('');
        }
    };

    const handleUpdateBookingStatus = async (action) => {
        if (!selectedBooking) return;
        if (action === 'cancel' && cancelReason.trim().length > 500) {
            toast.warning('Lý do hủy tối đa 500 ký tự');
            return;
        }

        setUpdatingBookingStatus(true);
        try {
            let res;
            if (action === 'confirm') {
                res = await confirmBooking(selectedBooking._id);
            } else if (action === 'complete') {
                res = await completeBooking(selectedBooking._id);
            } else if (action === 'cancel') {
                res = await cancelBookingByAdmin(selectedBooking._id, cancelReason);
            }

            if (res?.success) {
                toast.success(res.message || 'Đã cập nhật trạng thái booking');
                setSelectedBooking((prev) => ({ ...prev, status: res.data.status }));
                fetchBookings(filterTour, filterStatus, page);
                if (action === 'cancel') {
                    setCancelReasonDialog(false);
                    setCancelReason('');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái booking');
        } finally {
            setUpdatingBookingStatus(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Quản Lý Booking</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField size="small" select label="Chọn Tour" value={filterTour} onChange={(e) => setFilterTour(e.target.value)} sx={{ minWidth: 220, bgcolor: 'white' }}>
                    <MenuItem value="all">Tất cả Tour</MenuItem>
                    {tours.map((t) => <MenuItem key={t._id} value={t._id}>{t.name?.vi || t.code}</MenuItem>)}
                </TextField>
                <TextField size="small" select label="Trạng thái booking" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 180, bgcolor: 'white' }}>
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="HOLD">Giữ chỗ</MenuItem>
                    <MenuItem value="CONFIRMED">Đã xác nhận</MenuItem>
                    <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                    <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                </TextField>
                <Button variant="outlined" onClick={handleSearch} startIcon={<SearchIcon />}>Lọc</Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Mã Booking</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thông tin liên hệ</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tour / Lịch khởi hành</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Số khách</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center">Chưa có Booking nào</TableCell></TableRow>
                                ) : bookings.map((b) => (
                                    <TableRow key={b._id} hover>
                                        <TableCell fontWeight="bold">{b.bookingCode}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{b.contactInfo?.fullName}</Typography>
                                            <Typography variant="caption" color="text.secondary">{b.contactInfo?.phone}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {b.tourId?.code}<br />
                                            <Typography variant="caption" color="text.secondary">
                                                Khởi hành: {b.scheduleId ? new Date(b.scheduleId.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">{b.totalGuests}</TableCell>
                                        <TableCell>{b.totalPrice?.toLocaleString()} VNĐ</TableCell>
                                        <TableCell>
                                            <Chip label={b.status} size="small" color={statusColor[b.status] || 'default'} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack spacing={0.5} alignItems="flex-end">
                                                <Typography variant="caption" color="text.secondary">
                                                    {b.consultantAssignment?.staff
                                                        ? `Đã gán TV: ${b.consultantAssignment.staff.fullName || b.consultantAssignment.staff.username}`
                                                        : 'Chưa gán tư vấn'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button size="small" variant="contained" onClick={() => handleViewDetail(b)}>Chi tiết</Button>
                                                    <Button size="small" variant="outlined" color="secondary" startIcon={<AssignmentIndIcon />} onClick={() => handleOpenAssign(b)}>
                                                        {b.consultantAssignment?.staff ? 'Đổi tư vấn' : 'Phân công'}
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination count={totalPages} page={page} onChange={(e, v) => fetchBookings(filterTour, filterStatus, v)} color="primary" />
                        </Box>
                    )}
                </>
            )}

            <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Chi tiết Booking: {selectedBooking?.bookingCode}</DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#f8fafc', maxHeight: '80vh' }}>
                    {selectedBooking && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Thông tin người đặt</Typography>
                                        <Typography variant="body2"><strong>Họ tên:</strong> {selectedBooking.contactInfo?.fullName}</Typography>
                                        <Typography variant="body2"><strong>Email:</strong> {selectedBooking.contactInfo?.email}</Typography>
                                        <Typography variant="body2"><strong>SĐT:</strong> {selectedBooking.contactInfo?.phone}</Typography>

                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Thông tin tour</Typography>
                                        <Typography variant="body2"><strong>Tour:</strong> {selectedBooking.tourId?.name?.vi}</Typography>
                                        <Typography variant="body2">
                                            <strong>Ngày khởi hành:</strong> {selectedBooking.scheduleId ? new Date(selectedBooking.scheduleId.startDate).toLocaleDateString('vi-VN') : ''}
                                        </Typography>
                                        <Typography variant="body2" color="error" fontWeight="bold" mt={1}>
                                            Tổng hóa đơn: {selectedBooking.totalPrice?.toLocaleString()} VNĐ
                                        </Typography>

                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Trạng thái booking</Typography>
                                        <Chip label={selectedBooking.status} color={statusColor[selectedBooking.status] || 'default'} size="small" sx={{ mb: 1 }} />
                                        <Stack spacing={1}>
                                            {selectedBooking.status === 'HOLD' && (
                                                <Button variant="contained" color="success" size="small" disabled={updatingBookingStatus} onClick={() => handleUpdateBookingStatus('confirm')}>
                                                    {updatingBookingStatus ? <CircularProgress size={16} color="inherit" /> : 'Xác nhận booking'}
                                                </Button>
                                            )}
                                            {selectedBooking.status === 'CONFIRMED' && (
                                                <Button variant="contained" color="info" size="small" disabled={updatingBookingStatus} onClick={() => handleUpdateBookingStatus('complete')}>
                                                    {updatingBookingStatus ? <CircularProgress size={16} color="inherit" /> : 'Hoàn thành tour'}
                                                </Button>
                                            )}
                                            {(selectedBooking.status === 'HOLD' || selectedBooking.status === 'CONFIRMED') && (
                                                <Button variant="outlined" color="error" size="small" disabled={updatingBookingStatus} onClick={() => setCancelReasonDialog(true)}>
                                                    Hủy booking
                                                </Button>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Typography variant="h6" gutterBottom fontWeight="bold">Người trong booking</Typography>
                                {loadingParticipants ? <CircularProgress size={24} /> : (
                                    <Box sx={{ display: 'grid', gap: 2, maxHeight: { xs: 'none', md: '66vh' }, overflowY: { xs: 'visible', md: 'auto' }, pr: { xs: 0, md: 1 } }}>
                                        {participants.map((p, idx) => {
                                            const age = p.dob ? (new Date().getFullYear() - new Date(p.dob).getFullYear()) : null;
                                            const hasMedicalIssue = Boolean(p.healthSurvey?.medicalConditions?.trim());
                                            const hasAllergy = Boolean(p.preferences?.allergies?.trim());

                                            return (
                                                <Card key={p._id} elevation={0} sx={{ border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                                    <CardContent>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                mb: 1,
                                                                pb: 1,
                                                                borderBottom: '1px dashed #cbd5e1',
                                                            }}
                                                        >
                                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: 0 }}>#{idx + 1} - {p.fullName}</Typography>
                                                            <Chip
                                                                size="small"
                                                                color={reviewStatusColor[p.reviewStatus] || (hasMedicalIssue || hasAllergy ? 'warning' : 'default')}
                                                                label={reviewStatusLabel[p.reviewStatus] || 'Chưa đánh giá'}
                                                                sx={{ flexShrink: 0 }}
                                                            />
                                                        </Box>

                                                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                                            <TextField
                                                                select
                                                                size="small"
                                                                label="Trạng thái khách"
                                                                value={p.reviewStatus || 'approved'}
                                                                onChange={(e) => handleUpdateParticipantReviewStatus(p._id, e.target.value)}
                                                                disabled={!isBookingStage || updatingParticipantId === p._id}
                                                                sx={{ minWidth: 220, bgcolor: 'white' }}
                                                            >
                                                                <MenuItem value="approved">Đáp ứng</MenuItem>
                                                                <MenuItem value="rejected">Không đáp ứng</MenuItem>
                                                            </TextField>
                                                            {!isBookingStage && (
                                                                <Alert severity="info" sx={{ py: 0 }}>
                                                                    Booking đã hoàn thành/hủy nên không thể đổi trạng thái khách.
                                                                </Alert>
                                                            )}
                                                        </Box>

                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                            {p.dob ? `Ngày sinh: ${new Date(p.dob).toLocaleDateString('vi-VN')}` : 'Ngày sinh: Chưa có'}
                                                            {' | '}
                                                            Giới tính: {p.gender || 'Chưa có'}
                                                            {age !== null ? ` | Tuổi: ${age}` : ''}
                                                        </Typography>

                                                        <Box sx={{ p: 1.5, bgcolor: '#eaf2ff', borderRadius: 1.5, border: '1px solid #93c5fd', borderLeft: '6px solid #2563eb', mb: 1.5 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                                                                <PersonOutlineIcon fontSize="small" sx={{ color: '#1d4ed8' }} />
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1e40af' }}>Thông tin cá nhân</Typography>
                                                            </Box>
                                                            <Grid container spacing={1.5}>
                                                                <Grid item xs={12} sm={6}>
                                                                    <TextField fullWidth size="small" label="Họ tên" value={p.fullName || ''} InputProps={{ readOnly: true }} />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <TextField fullWidth size="small" label="Điện thoại" value={p.phone || ''} InputProps={{ readOnly: true }} />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <TextField fullWidth size="small" label="Email" value={p.email || ''} InputProps={{ readOnly: true }} />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <TextField fullWidth size="small" label="CCCD/Hộ chiếu" value={p.passportOrId || ''} InputProps={{ readOnly: true }} />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <TextField fullWidth size="small" label="Quốc tịch" value={p.nationality || ''} InputProps={{ readOnly: true }} />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <TextField fullWidth size="small" label="Cách liên hệ" value={p.contactMethod || 'None'} InputProps={{ readOnly: true }} />
                                                                </Grid>
                                                            </Grid>
                                                        </Box>

                                                        <Box sx={{ p: 1.5, bgcolor: '#fff0e0', borderRadius: 1.5, border: '1px solid #fdba74', borderLeft: '6px solid #ea580c', mb: 1.5 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                                                                <FavoriteBorderIcon fontSize="small" sx={{ color: '#c2410c' }} />
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#9a3412' }}>Sức khỏe</Typography>
                                                            </Box>
                                                            <Grid container spacing={1.5}>
                                                                <Grid item xs={12} md={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Bệnh lý nền"
                                                                        value={p.healthSurvey?.medicalConditions || 'Không có'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} md={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Khả năng bơi"
                                                                        value={p.healthSurvey?.swimmingAbility || 'Không có'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Thể lực"
                                                                        value={p.healthSurvey?.fitnessLevel || 'Không có'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Tần suất vận động"
                                                                        value={p.healthSurvey?.exerciseFrequency || 'Không có'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Kinh nghiệm trekking"
                                                                        value={p.healthSurvey?.trekkingExperience || 'Không có'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Box>

                                                        <Box sx={{ p: 1.5, bgcolor: '#ddfbff', borderRadius: 1.5, border: '1px solid #22d3ee', borderLeft: '6px solid #0891b2' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                                                                <RestaurantMenuIcon fontSize="small" sx={{ color: '#0e7490' }} />
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#155e75' }}>Nhu cầu dịch vụ</Typography>
                                                            </Box>
                                                            <Grid container spacing={1.5}>
                                                                <Grid item xs={12} md={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Dị ứng"
                                                                        value={p.preferences?.allergies || 'Không có'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} md={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Nhu cầu ăn uống"
                                                                        value={p.preferences?.dietaryPreference || 'None'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} md={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Nhu cầu lưu trú"
                                                                        value={p.preferences?.accommodationOption || 'None'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} md={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Nhu cầu lều"
                                                                        value={p.preferences?.tentPreference || 'None'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Box>

                                                        {(hasMedicalIssue || hasAllergy) && (
                                                            <Alert severity="warning" sx={{ mt: 2 }}>
                                                                Participant này có thông tin cần lưu ý: {hasMedicalIssue ? 'bệnh lý nền' : ''}{hasMedicalIssue && hasAllergy ? ' và ' : ''}{hasAllergy ? 'dị ứng' : ''}.
                                                            </Alert>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetail(false)} variant="contained">Đóng</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!assignDialog} onClose={() => setAssignDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {assignDialog?.consultantAssignment?.staff ? 'Đổi nhân viên tư vấn' : 'Phân công tư vấn'} — {assignDialog?.bookingCode}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Alert severity="info">Chọn nhân viên tư vấn cho khách: <strong>{assignDialog?.contactInfo?.fullName}</strong></Alert>
                        <Autocomplete
                            options={staffList}
                            value={staffList.find((s) => s._id === selectedStaff) || null}
                            onChange={(_, value) => setSelectedStaff(value?._id || '')}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            getOptionLabel={(option) => option.fullName || option.username || ''}
                            filterOptions={(options, { inputValue }) => {
                                const keyword = inputValue.trim().toLowerCase();
                                if (!keyword) return options;
                                return options.filter((option) =>
                                    `${option.fullName || ''} ${option.username || ''} ${option.phone || ''} ${option.email || ''}`
                                        .toLowerCase()
                                        .includes(keyword)
                                );
                            }}
                            renderInput={(params) => <TextField {...params} size="small" label="Tìm nhân viên theo tên/SĐT/email" />}
                        />
                        <TextField size="small" label="Ghi chú (tuỳ chọn)" multiline rows={2} value={assignNote} onChange={(e) => setAssignNote(e.target.value)} fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAssignDialog(null)}>Huỷ</Button>
                    <Button variant="contained" disabled={!selectedStaff || assigning} onClick={handleAssign}>
                        {assigning ? <CircularProgress size={20} /> : (assignDialog?.consultantAssignment?.staff ? 'Cập nhật phân công' : 'Phân công')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelReasonDialog} onClose={() => setCancelReasonDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Hủy booking</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Lý do hủy (tuỳ chọn)"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelReasonDialog(false)}>Đóng</Button>
                    <Button color="error" variant="contained" onClick={() => handleUpdateBookingStatus('cancel')} disabled={updatingBookingStatus}>
                        {updatingBookingStatus ? <CircularProgress size={16} color="inherit" /> : 'Xác nhận hủy'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
