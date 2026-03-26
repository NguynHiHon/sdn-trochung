import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, Chip, TextField, MenuItem, Pagination,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Divider, Alert,
  Autocomplete
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { toast } from 'sonner';
import { getAllBookings, confirmBooking, cancelBookingByAdmin, completeBooking } from '../../services/bookingApi';
import { getParticipantsByBookingId, updateParticipantAdminStatus } from '../../services/participantApi';
import { getAllTours } from '../../services/tourApi';
import { getStaffList } from '../../services/userApi';
import { assignBooking } from '../../services/assignmentApi';

const bookingStatusMeta = {
  HOLD: { label: 'Giữ chỗ', color: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'success' },
  CANCELLED: { label: 'Đã hủy booking', color: 'error' },
  COMPLETED: { label: 'Hoàn thành tour', color: 'info' },
};
const assignmentStatusMeta = {
  pending: { label: 'Chờ xử lý tư vấn', color: 'warning' },
  in_progress: { label: 'Đang tư vấn', color: 'info' },
  completed: { label: 'Đã hoàn tất tư vấn', color: 'success' },
  cancelled: { label: 'Đã hủy phân công', color: 'default' },
};
const participantStatusMeta = {
  pending_review: { label: 'Chờ duyệt hồ sơ', color: 'warning' },
  approved: { label: 'Đủ điều kiện', color: 'success' },
  rejected: { label: 'Không đủ điều kiện', color: 'error' },
  completed: { label: 'Đã hoàn tất tour', color: 'info' },
  service_suspended: { label: 'Tạm ngưng phục vụ', color: 'default' },
};

const getAssignmentConsistencyHint = (bookingStatus, assignmentStatus) => {
  if (bookingStatus === 'CANCELLED' && assignmentStatus !== 'cancelled') {
    return 'Booking đã hủy nhưng nhiệm vụ tư vấn chưa hủy';
  }
  if (bookingStatus === 'COMPLETED' && assignmentStatus !== 'completed') {
    return 'Booking đã hoàn thành nhưng nhiệm vụ tư vấn chưa hoàn tất';
  }
  return '';
};

export default function BookingManager() {
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterTour, setFilterTour] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignmentStatus, setFilterAssignmentStatus] = useState('all');
  const [filterParticipantStatus, setFilterParticipantStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Dialog
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantDrafts, setParticipantDrafts] = useState({});
  const [updatingParticipantId, setUpdatingParticipantId] = useState('');

  // Assignment Dialog
  const [assignDialog, setAssignDialog] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Booking Status Management
  const [updatingBookingStatus, setUpdatingBookingStatus] = useState(false);
  const [cancelReasonDialog, setCancelReasonDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBookings();
    getAllTours({ limit: 100 }).then(res => { if (res.success) setTours(res.data); });
  }, []);

  const fetchBookings = async (t = filterTour, st = filterStatus, ast = filterAssignmentStatus, pst = filterParticipantStatus, p = 1) => {
    try {
      setLoading(true);
      const res = await getAllBookings({ 
        tourId: t, 
        status: st, 
        assignmentStatus: ast,
        participantReviewStatus: pst,
        page: p, 
        limit: 10 
      });
      if (res.success) {
        setBookings(res.data);
        setTotalPages(res.totalPages || 1);
        setPage(res.page || 1);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách Booking: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { 
    setPage(1); 
    fetchBookings(filterTour, filterStatus, filterAssignmentStatus, filterParticipantStatus, 1); 
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
        toast.success(res.message);
        setAssignDialog(null);
        fetchBookings(filterTour, filterStatus, filterAssignmentStatus, filterParticipantStatus, page);
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
        setParticipants(res.data);
        const drafts = (res.data || []).reduce((acc, p) => {
          acc[p._id] = {
            reviewStatus: p.adminReview?.reviewStatus || 'pending_review',
            reviewNote: p.adminReview?.reviewNote || '',
          };
          return acc;
        }, {});
        setParticipantDrafts(drafts);
      }
    } catch (err) {
      toast.error('Không thể tải thông tin hành khách');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleParticipantDraftChange = (participantId, field, value) => {
    setParticipantDrafts((prev) => ({
      ...prev,
      [participantId]: {
        reviewStatus: prev[participantId]?.reviewStatus || 'pending_review',
        reviewNote: prev[participantId]?.reviewNote || '',
        [field]: value,
      },
    }));
  };

  const handleUpdateParticipantStatus = async (participantId, overridePayload = null) => {
    const draft = participantDrafts[participantId] || { reviewStatus: 'pending_review', reviewNote: '' };
    const payload = overridePayload || {
      reviewStatus: draft.reviewStatus,
      reviewNote: draft.reviewNote,
    };

    try {
      setUpdatingParticipantId(participantId);
      const res = await updateParticipantAdminStatus(participantId, payload);
      if (!res.success) return;

      setParticipants((prev) => prev.map((p) => (p._id === participantId ? res.data : p)));
      setParticipantDrafts((prev) => ({
        ...prev,
        [participantId]: {
          reviewStatus: res.data.adminReview?.reviewStatus || 'pending_review',
          reviewNote: res.data.adminReview?.reviewNote || '',
        },
      }));
      toast.success(res.message || 'Đã cập nhật trạng thái hành khách');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái hành khách');
    } finally {
      setUpdatingParticipantId('');
    }
  };

  const handleUpdateBookingStatus = async (action) => {
    if (!selectedBooking) return;

    try {
      setUpdatingBookingStatus(true);
      let res;
      
      switch (action) {
        case 'confirm':
          res = await confirmBooking(selectedBooking._id);
          break;
        case 'cancel':
          res = await cancelBookingByAdmin(selectedBooking._id, cancelReason);
          setCancelReasonDialog(false);
          setCancelReason('');
          break;
        case 'complete':
          res = await completeBooking(selectedBooking._id);
          break;
        default:
          return;
      }

      if (res.success) {
        toast.success(res.message || 'Đã cập nhật trạng thái booking');
        setSelectedBooking((prev) => ({ ...prev, status: res.data.status }));
        fetchBookings(filterTour, filterStatus, filterAssignmentStatus, filterParticipantStatus, page);
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
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Quản Lý Booking & Khảo Sát Sức Khỏe</Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Booking: Giữ chỗ / Đã xác nhận / Đã hủy booking / Hoàn thành tour • Tư vấn: Chờ xử lý / Đang tư vấn / Đã hoàn tất / Đã hủy phân công • Hành khách: Chờ duyệt hồ sơ / Đủ điều kiện / Không đủ điều kiện / Đã hoàn tất tour / Tạm ngưng phục vụ
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField size="small" select label="Chọn Tour" value={filterTour} onChange={(e) => setFilterTour(e.target.value)} sx={{ minWidth: 200, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả Tour</MenuItem>
          {tours.map(t => <MenuItem key={t._id} value={t._id}>{t.name?.vi || t.code}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Trạng thái booking" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 150, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="HOLD">Giữ chỗ</MenuItem>
          <MenuItem value="CONFIRMED">Đã xác nhận</MenuItem>
          <MenuItem value="CANCELLED">Đã hủy booking</MenuItem>
          <MenuItem value="COMPLETED">Hoàn thành tour</MenuItem>
        </TextField>
        <TextField size="small" select label="Trạng thái tư vấn" value={filterAssignmentStatus} onChange={(e) => setFilterAssignmentStatus(e.target.value)} sx={{ minWidth: 150, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="unassigned">Chưa phân công</MenuItem>
          <MenuItem value="pending">Chờ xử lý tư vấn</MenuItem>
          <MenuItem value="in_progress">Đang tư vấn</MenuItem>
          <MenuItem value="completed">Đã hoàn tất tư vấn</MenuItem>
          <MenuItem value="cancelled">Đã hủy phân công</MenuItem>
        </TextField>
        <TextField size="small" select label="Hành khách (duyệt hồ sơ)" value={filterParticipantStatus} onChange={(e) => setFilterParticipantStatus(e.target.value)} sx={{ minWidth: 150, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="pending_review">Chờ duyệt hồ sơ</MenuItem>
          <MenuItem value="approved">Đủ điều kiện</MenuItem>
          <MenuItem value="rejected">Không đủ điều kiện</MenuItem>
          <MenuItem value="completed">Đã hoàn tất tour</MenuItem>
          <MenuItem value="service_suspended">Tạm ngưng phục vụ</MenuItem>
        </TextField>
        <Button variant="outlined" onClick={handleSearch} startIcon={<SearchIcon />}>Lọc</Button>
      </Box>

      {/* Table */}
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Nhân viên tư vấn</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Số khách</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center">Chưa có Booking nào</TableCell></TableRow>
                ) : bookings.map((b) => (
                  <TableRow key={b._id} hover>
                    <TableCell fontWeight="bold">{b.bookingCode}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{b.contactInfo?.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{b.contactInfo?.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      {b.tourId?.code} <br />
                      <Typography variant="caption" color="text.secondary">
                        Khởi hành: {b.scheduleId ? new Date(b.scheduleId.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {b.consultantAssignment?.staff ? (
                        <>
                          <Typography variant="body2" fontWeight="bold">
                            {b.consultantAssignment.staff.fullName || b.consultantAssignment.staff.username}
                          </Typography>
                          <Chip
                            size="small"
                            sx={{ mt: 0.5 }}
                            label={assignmentStatusMeta[b.consultantAssignment.status]?.label || b.consultantAssignment.status}
                            color={assignmentStatusMeta[b.consultantAssignment.status]?.color || 'default'}
                          />
                          {getAssignmentConsistencyHint(b.status, b.consultantAssignment.status) && (
                            <Typography variant="caption" color="error.main" display="block" sx={{ mt: 0.5 }}>
                              {getAssignmentConsistencyHint(b.status, b.consultantAssignment.status)}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Chip size="small" variant="outlined" label="Chưa phân công" />
                      )}
                    </TableCell>
                    <TableCell align="center">{b.totalGuests}</TableCell>
                    <TableCell>{b.totalPrice?.toLocaleString()} VNĐ</TableCell>
                    <TableCell>
                      <Chip
                        label={bookingStatusMeta[b.status]?.label || b.status}
                        size="small"
                        color={bookingStatusMeta[b.status]?.color || 'default'}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="contained" onClick={() => handleViewDetail(b)}>Chi tiết</Button>
                      <Button size="small" variant="outlined" color="secondary" startIcon={<AssignmentIndIcon />}
                        onClick={() => handleOpenAssign(b)}>
                        {b.consultantAssignment?.staff ? 'Sửa phân công' : 'Phân công'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(e, v) => fetchBookings(filterTour, filterStatus, filterAssignmentStatus, filterParticipantStatus, v)} color="primary" />
            </Box>
          )}
        </>
      )}

      {/* Dialog: Booking Detail & Surveys */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Chi tiết Booking: {selectedBooking?.bookingCode}</DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#f8fafc' }}>
          {selectedBooking && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Thông tin Người Đặt</Typography>
                    <Typography variant="body2"><strong>Họ tên:</strong> {selectedBooking.contactInfo?.fullName}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedBooking.contactInfo?.email}</Typography>
                    <Typography variant="body2"><strong>SĐT:</strong> {selectedBooking.contactInfo?.phone}</Typography>
                    <Typography variant="body2"><strong>Ghi chú:</strong> {selectedBooking.contactInfo?.specialRequest || 'Không có'}</Typography>

                    <Typography variant="body2"><strong>Phương thức liên hệ:</strong> {selectedBooking.contactInfo?.contactMethod || 'Không có'}</Typography>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Thông tin Tour</Typography>
                    <Typography variant="body2"><strong>Tour:</strong> {selectedBooking.tourId?.name?.vi}</Typography>
                    <Typography variant="body2">
                      <strong>Ngày khởi hành:</strong> {selectedBooking.scheduleId ? new Date(selectedBooking.scheduleId.startDate).toLocaleDateString('vi-VN') : ''}
                    </Typography>
                    <Typography variant="body2" color="error" fontWeight="bold" mt={1}>
                      Tổng hóa đơn: {selectedBooking.totalPrice?.toLocaleString()} VNĐ
                    </Typography>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Quản Lý Booking</Typography>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">Trạng thái hiện tại:</Typography>
                      <Chip
                        sx={{ ml: 1 }}
                        label={bookingStatusMeta[selectedBooking.status]?.label || selectedBooking.status}
                        color={bookingStatusMeta[selectedBooking.status]?.color || 'default'}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedBooking.status === 'HOLD' && (
                        <>
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={updatingBookingStatus}
                            onClick={() => handleUpdateBookingStatus('confirm')}
                          >
                            {updatingBookingStatus ? <CircularProgress size={16} color="inherit" /> : 'Xác nhận booking'}
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={updatingBookingStatus}
                            onClick={() => setCancelReasonDialog(true)}
                          >
                            Hủy booking
                          </Button>
                        </>
                      )}
                      {selectedBooking.status === 'CONFIRMED' && (
                        <>
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            color="info"
                            disabled={updatingBookingStatus}
                            onClick={() => handleUpdateBookingStatus('complete')}
                          >
                            {updatingBookingStatus ? <CircularProgress size={16} color="inherit" /> : 'Hoàn thành tour'}
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={updatingBookingStatus}
                            onClick={() => setCancelReasonDialog(true)}
                          >
                            Hủy booking
                          </Button>
                        </>
                      )}
                      {(selectedBooking.status === 'CANCELLED' || selectedBooking.status === 'COMPLETED') && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Không thể thay đổi trạng thái
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom fontWeight="bold">Thông tin Hành Khách & Báo cáo Sức Khỏe</Typography>
                {loadingParticipants ? <CircularProgress size={24} /> : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {participants.map((p, idx) => {
                      // Check for red flags
                      const hasMedicalIssues = p.healthSurvey?.medicalConditions && p.healthSurvey.medicalConditions.length > 3;
                      const hasAllergies = p.preferences?.allergies && p.preferences.allergies.length > 3;
                      const isHighRisk = hasMedicalIssues || hasAllergies || p.healthSurvey?.fitnessLevel === 'Average';

                      const reviewStatus = participantDrafts[p._id]?.reviewStatus || p.adminReview?.reviewStatus || 'pending_review';
                      const reviewNote = participantDrafts[p._id]?.reviewNote ?? p.adminReview?.reviewNote ?? '';
                      const reviewMeta = participantStatusMeta[reviewStatus] || { label: reviewStatus, color: 'default' };

                      return (
                        <Card key={p._id} elevation={0} sx={{ border: '1px solid', borderColor: isHighRisk ? 'error.main' : '#e2e8f0' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">#{idx + 1} - {p.fullName} ({new Date().getFullYear() - new Date(p.dob).getFullYear()} tuổi)</Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                {isHighRisk && <Chip icon={<WarningAmberIcon />} label="Lưu ý Sức khỏe" color="error" size="small" />}
                                <Chip label={reviewMeta.label} color={reviewMeta.color} size="small" />
                                {p.adminReview?.certificateIssued && <Chip label="Đã cấp chứng chỉ" color="success" size="small" variant="outlined" />}
                              </Box>
                            </Box>

                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Ngày sinh: {new Date(p.dob).toLocaleDateString('vi-VN')} | Giới tính: {p.gender}</Typography>
                                <Typography variant="body2" color="text.secondary">Passport/CCCD: {p.passportOrId} | Quốc tịch: {p.nationality}</Typography>
                              </Grid>

                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2"><strong>Thể lực:</strong> {p.healthSurvey?.fitnessLevel} | <strong>Bơi lội:</strong> {p.healthSurvey?.swimmingAbility}</Typography>
                                <Typography variant="body2"><strong>Tần suất Vận động:</strong> {p.healthSurvey?.exerciseFrequency}</Typography>
                                <Typography variant="body2"><strong>Kinh nghiệm Trekking:</strong> {p.healthSurvey?.trekkingExperience}</Typography>
                              </Grid>
                            </Grid>

                            {(hasMedicalIssues || hasAllergies) && (
                              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff1f2', borderRadius: 1 }}>
                                {hasMedicalIssues && <Typography variant="body2" color="error.dark"><strong>Bệnh lý:</strong> {p.healthSurvey.medicalConditions}</Typography>}
                                {hasAllergies && <Typography variant="body2" color="error.dark"><strong>Dị ứng:</strong> {p.preferences.allergies}</Typography>}
                              </Box>
                            )}

                            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1 }}>
                              <Typography variant="body2" color="success.dark">
                                <strong>Ăn uống:</strong> {p.preferences?.dietaryPreference} | <strong>Chỗ ở:</strong> {p.preferences?.accommodationOption} | <strong>Lều:</strong> {p.preferences?.tentPreference}
                              </Typography>
                            </Box>

                            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1, border: '1px dashed #cbd5e1' }}>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Quản lý hành khách (Admin)</Typography>
                              <Grid container spacing={1.5}>
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    select
                                    label="Trạng thái"
                                    value={reviewStatus}
                                    onChange={(e) => handleParticipantDraftChange(p._id, 'reviewStatus', e.target.value)}
                                  >
                                    {Object.entries(participantStatusMeta).map(([value, meta]) => (
                                      <MenuItem key={value} value={value}>{meta.label}</MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Ghi chú quản trị"
                                    value={reviewNote}
                                    onChange={(e) => handleParticipantDraftChange(p._id, 'reviewNote', e.target.value)}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      disabled={updatingParticipantId === p._id}
                                      onClick={() => handleUpdateParticipantStatus(p._id)}
                                    >
                                      {updatingParticipantId === p._id ? <CircularProgress size={16} color="inherit" /> : 'Lưu trạng thái'}
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="success"
                                      disabled={updatingParticipantId === p._id}
                                      onClick={() => handleUpdateParticipantStatus(p._id, {
                                        reviewStatus: 'completed',
                                        reviewNote,
                                        certificateIssued: true,
                                      })}
                                    >
                                      Hoàn thành & cấp chứng chỉ
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      disabled={updatingParticipantId === p._id}
                                      onClick={() => handleUpdateParticipantStatus(p._id, {
                                        reviewStatus: 'service_suspended',
                                        reviewNote,
                                      })}
                                    >
                                      Ngưng phục vụ
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)} variant="contained" color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={!!assignDialog} onClose={() => setAssignDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {assignDialog?.consultantAssignment?.staff ? 'Sửa phân công Tư vấn' : 'Phân công Tư vấn'} — {assignDialog?.bookingCode}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">Chọn nhân viên tư vấn sẽ liên hệ khách hàng: <strong>{assignDialog?.contactInfo?.fullName}</strong></Alert>
            <Autocomplete
              size="small"
              options={staffList}
              value={staffList.find((s) => s._id === selectedStaff) || null}
              onChange={(_, value) => setSelectedStaff(value?._id || '')}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              getOptionLabel={(option) => option.fullName || option.username || ''}
              filterOptions={(options, { inputValue }) => {
                const keyword = inputValue.trim().toLowerCase();
                if (!keyword) return options;

                return options.filter((option) => {
                  const fullName = (option.fullName || '').toLowerCase();
                  const username = (option.username || '').toLowerCase();
                  const phone = (option.phone || '').toLowerCase();
                  const email = (option.email || '').toLowerCase();
                  return fullName.includes(keyword) || username.includes(keyword) || phone.includes(keyword) || email.includes(keyword);
                });
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option._id}>
                  {option.fullName || option.username} — {option.phone || option.email || ''}
                </Box>
              )}
              renderInput={(params) => <TextField {...params} label="Chọn nhân viên (có tìm kiếm)" />}
              noOptionsText="Không tìm thấy nhân viên"
            />
            <TextField label="Ghi chú (tuỳ chọn)" multiline rows={2} value={assignNote}
              onChange={e => setAssignNote(e.target.value)} fullWidth size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignDialog(null)}>Huỷ</Button>
          <Button variant="contained" disabled={!selectedStaff || assigning} onClick={handleAssign}
            sx={{ bgcolor: '#2b6f56', '&:hover': { bgcolor: '#1a5a3e' } }}>
            {assigning ? <CircularProgress size={20} /> : (assignDialog?.consultantAssignment?.staff ? 'Cập nhật phân công' : 'Phân công')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Cancel Reason */}
      <Dialog open={cancelReasonDialog} onClose={() => setCancelReasonDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Hủy Booking: {selectedBooking?.bookingCode}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="warning">
              Bạn sắp hủy booking <strong>{selectedBooking?.contactInfo?.fullName}</strong> — Tất cả liên quan sẽ bị hủy
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Lý do hủy (tuỳ chọn)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ví dụ: Khách yêu cầu hủy, không đủ điều kiện, v.v..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelReasonDialog(false)}>Từ chối</Button>
          <Button
            variant="contained"
            color="error"
            disabled={updatingBookingStatus}
            onClick={() => handleUpdateBookingStatus('cancel')}
          >
            {updatingBookingStatus ? <CircularProgress size={16} color="inherit" /> : 'Xác nhận hủy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
