import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, Chip, TextField, MenuItem, Pagination,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Divider, Alert,
  FormControl, InputLabel, Select
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { toast } from 'sonner';
import { getAllBookings } from '../../services/bookingApi';
import { getParticipantsByBookingId } from '../../services/participantApi';
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

  // Detail Dialog
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Assignment Dialog
  const [assignDialog, setAssignDialog] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchBookings();
    getAllTours({ limit: 100 }).then(res => { if (res.success) setTours(res.data); });
  }, []);

  const fetchBookings = async (t = filterTour, st = filterStatus, p = 1) => {
    try {
      setLoading(true);
      const res = await getAllBookings({ tourId: t, status: st, page: p, limit: 10 });
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

  const handleSearch = () => { setPage(1); fetchBookings(filterTour, filterStatus, 1); };

  const handleOpenAssign = async (booking) => {
    setAssignDialog(booking);
    setSelectedStaff('');
    setAssignNote('');
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
      }
    } catch (err) {
      toast.error('Không thể tải thông tin hành khách');
    } finally {
      setLoadingParticipants(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Quản Lý Booking & Khảo Sát Sức Khỏe</Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField size="small" select label="Chọn Tour" value={filterTour} onChange={(e) => setFilterTour(e.target.value)} sx={{ minWidth: 250, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả Tour</MenuItem>
          {tours.map(t => <MenuItem key={t._id} value={t._id}>{t.name?.vi || t.code}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Trạng thái" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 150, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="HOLD">Giữ chỗ (HOLD)</MenuItem>
          <MenuItem value="CONFIRMED">Đã xác nhận</MenuItem>
          <MenuItem value="PAID">Đã thanh toán (PAID)</MenuItem>
          <MenuItem value="CANCELLED">Đã hủy</MenuItem>
          <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
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
                  <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Số khách</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
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
                      {b.tourId?.code} <br />
                      <Typography variant="caption" color="text.secondary">
                        Khởi hành: {b.scheduleId ? new Date(b.scheduleId.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{b.totalGuests}</TableCell>
                    <TableCell>{b.totalPrice?.toLocaleString()} VNĐ</TableCell>
                    <TableCell>
                      <Chip label={b.status} size="small" color={statusColor[b.status] || 'default'} />
                    </TableCell>
                    <TableCell align="right" sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="contained" onClick={() => handleViewDetail(b)}>Chi tiết</Button>
                      <Button size="small" variant="outlined" color="secondary" startIcon={<AssignmentIndIcon />}
                        onClick={() => handleOpenAssign(b)}>Phân công</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(e, v) => handleSearch(v)} color="primary" />
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

                      return (
                        <Card key={p._id} elevation={0} sx={{ border: '1px solid', borderColor: isHighRisk ? 'error.main' : '#e2e8f0' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">#{idx + 1} - {p.fullName} ({new Date().getFullYear() - new Date(p.dob).getFullYear()} tuổi)</Typography>
                              {isHighRisk && <Chip icon={<WarningAmberIcon />} label="Lưu ý Sức khỏe" color="error" size="small" />}
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>Phân công Tư vấn — {assignDialog?.bookingCode}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">Chọn nhân viên tư vấn sẽ liên hệ khách hàng: <strong>{assignDialog?.contactInfo?.fullName}</strong></Alert>
            <FormControl fullWidth size="small">
              <InputLabel>Chọn nhân viên</InputLabel>
              <Select value={selectedStaff} label="Chọn nhân viên" onChange={e => setSelectedStaff(e.target.value)}>
                {staffList.map(s => (
                  <MenuItem key={s._id} value={s._id}>{s.fullName || s.username} — {s.phone || s.email || ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Ghi chú (tuỳ chọn)" multiline rows={2} value={assignNote}
              onChange={e => setAssignNote(e.target.value)} fullWidth size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignDialog(null)}>Huỷ</Button>
          <Button variant="contained" disabled={!selectedStaff || assigning} onClick={handleAssign}
            sx={{ bgcolor: '#2b6f56', '&:hover': { bgcolor: '#1a5a3e' } }}>
            {assigning ? <CircularProgress size={20} /> : 'Phân công'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
