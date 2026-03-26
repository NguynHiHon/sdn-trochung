import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, IconButton, Chip, TextField, MenuItem, Pagination,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'sonner';
import { getAllSchedules, deleteSchedule, bulkCreateSchedules, updateSchedule } from '../../services/scheduleApi';
import { getAllTours } from '../../services/tourApi';
import { getStaffList } from '../../services/userApi';

const statusColor = { Available: 'success', Full: 'error', Cancelled: 'default', Completed: 'info' };
const guideActionMeta = {
  assigned: { label: 'Đã phân công', color: 'success' },
  unassigned: { label: 'Đã bỏ phân công', color: 'default' },
};

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  const [filterTour, setFilterTour] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk Create Dialog state
  const [openBulk, setOpenBulk] = useState(false);
  const [bulkTourId, setBulkTourId] = useState('');
  const [bulkDates, setBulkDates] = useState([]);
  const [tempDate, setTempDate] = useState('');
  const [bulkErrors, setBulkErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Assign tour guide dialog
  const [assignDialog, setAssignDialog] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState('');
  const [assigningGuide, setAssigningGuide] = useState(false);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    fetchSchedules();
    getAllTours({ limit: 100 }).then(res => { if (res.success) setTours(res.data); });
    getStaffList().then(res => { if (res.success) setStaffList(res.data); });
  }, []);

  const fetchSchedules = async (t = filterTour, st = filterStatus, p = 1) => {
    try {
      setLoading(true);
      const res = await getAllSchedules({ tourId: t, status: st, page: p, limit: 12 });
      if (res.success) {
        setSchedules(res.data);
        setTotalPages(res.totalPages || 1);
        setPage(res.page || 1);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); fetchSchedules(filterTour, filterStatus, 1); };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa lịch trình này? Các booking bên trong sẽ bị lỗi!')) return;
    try {
      await deleteSchedule(id);
      toast.success('Đã xóa');
      fetchSchedules();
    } catch (err) { toast.error('Lỗi: ' + (err.response?.data?.message || err.message)); }
  };

  const handleAddBulkDate = () => {
    if (!tempDate) {
      setBulkErrors((prev) => ({ ...prev, tempDate: 'Vui lòng chọn ngày trước khi thêm' }));
      return;
    }
    if (bulkDates.includes(tempDate)) {
      setBulkErrors((prev) => ({ ...prev, tempDate: 'Ngày này đã tồn tại trong danh sách' }));
      toast.warning('Ngày này đã được thêm');
      return;
    }
    setBulkDates([...bulkDates, tempDate].sort());
    setTempDate('');
    setBulkErrors((prev) => {
      const next = { ...prev };
      delete next.tempDate;
      delete next.bulkDates;
      return next;
    });
  };

  const openAssignGuide = (schedule) => {
    setAssignDialog(schedule);
    setSelectedGuide(schedule?.tourGuideId?._id || '');
    setAssignError('');
  };

  const submitAssignGuide = async () => {
    if (!assignDialog) return;

    if (selectedGuide && !staffList.some((s) => s._id === selectedGuide)) {
      setAssignError('Nhân viên được chọn không hợp lệ');
      toast.warning('Vui lòng chọn lại nhân viên hợp lệ');
      return;
    }

    setAssigningGuide(true);
    try {
      const isUnassign = !selectedGuide;
      const res = await updateSchedule(assignDialog._id, { tourGuideId: selectedGuide || null });
      if (res.success) {
        toast.success(isUnassign ? 'Đã bỏ phân công trưởng đoàn' : 'Đã gán trưởng đoàn');
        setAssignDialog(null);
        fetchSchedules();
      } else {
        toast.error(res.message || 'Cập nhật trưởng đoàn thất bại');
      }
    } catch (err) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setAssigningGuide(false);
    }
  };

  const submitBulkCreate = async () => {
    const nextErrors = {};
    if (!bulkTourId) nextErrors.bulkTourId = 'Vui lòng chọn tour';
    if (bulkDates.length === 0) nextErrors.bulkDates = 'Vui lòng thêm ít nhất 1 ngày';
    setBulkErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning('Vui lòng kiểm tra các trường đang báo đỏ trước khi tạo lịch');
      return;
    }

    setCreating(true);
    try {
      const res = await bulkCreateSchedules(bulkTourId, bulkDates);
      toast.success(res.message || 'Tạo lịch thành công');
      setOpenBulk(false);
      setBulkDates([]);
      setBulkTourId('');
      setBulkErrors({});
      fetchSchedules();
    } catch (err) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Quản Lý Lịch Khởi Hành</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenBulk(true)}>
          Tạo Lịch Hàng Loạt
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField size="small" select label="Chọn Tour" value={filterTour} onChange={(e) => setFilterTour(e.target.value)} sx={{ minWidth: 250, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả Tour</MenuItem>
          {tours.map(t => <MenuItem key={t._id} value={t._id}>{t.name?.vi || t.code}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Trạng thái" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 150, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="Available">Mở bán (Available)</MenuItem>
          <MenuItem value="Full">Hết chỗ (Full)</MenuItem>
          <MenuItem value="Cancelled">Đã hủy</MenuItem>
          <MenuItem value="Completed">Hoàn thành</MenuItem>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Tour</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trưởng đoàn</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ngày Khởi Hành</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ngày Kết Thúc</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Chỗ đã đặt / Tổng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">Chưa có lịch trình nào</TableCell></TableRow>
                ) : schedules.map((sch) => (
                  <TableRow key={sch._id} hover>
                    <TableCell>
                      {sch.tourId?.code} <br />
                      <Typography variant="caption" color="text.secondary">{sch.tourId?.name?.vi}</Typography>
                    </TableCell>
                    <TableCell>
                      {sch.tourGuideId ? (
                        <>
                          <Typography variant="body2" fontWeight={600}>{sch.tourGuideId?.fullName || sch.tourGuideId?.username}</Typography>
                          <Chip size="small" sx={{ mt: 0.5 }} label="Đang phụ trách" color="success" />
                        </>
                      ) : (
                        <Chip label="Chưa gán" size="small" variant="outlined" />
                      )}
                      {sch.lastGuideAction && (
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={guideActionMeta[sch.lastGuideAction.action]?.color || 'default'}
                            label={`${guideActionMeta[sch.lastGuideAction.action]?.label || sch.lastGuideAction.action} - ${new Date(sch.lastGuideAction.changedAt).toLocaleDateString('vi-VN')}`}
                          />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{new Date(sch.startDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{new Date(sch.endDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold" color={sch.bookedSlots >= sch.capacity ? 'error' : 'primary'}>
                        {sch.bookedSlots} / {sch.capacity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={sch.status} size="small" color={statusColor[sch.status] || 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openAssignGuide(sch)}>
                        {sch.tourGuideId ? 'Sửa trưởng đoàn' : 'Gán trưởng đoàn'}
                      </Button>
                      <IconButton size="small" onClick={() => handleDelete(sch._id)}><DeleteIcon color="error" fontSize="small" /></IconButton>
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

      {/* Dialog: Bulk Create */}
      <Dialog open={openBulk} onClose={() => setOpenBulk(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo Lịch Khởi Hành Hàng Loạt</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth select label="Chọn Tour cần tạo lịch" value={bulkTourId} error={!!bulkErrors.bulkTourId} helperText={bulkErrors.bulkTourId || ''} onChange={e => {
            setBulkTourId(e.target.value);
            setBulkErrors((prev) => {
              const next = { ...prev };
              delete next.bulkTourId;
              return next;
            });
          }} sx={{ mb: 3 }}>
            <MenuItem value="">-- Vui lòng chọn --</MenuItem>
            {tours.map(t => <MenuItem key={t._id} value={t._id}>{t.code} - {t.name?.vi}</MenuItem>)}
          </TextField>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField type="date" size="small" fullWidth value={tempDate} onChange={e => {
              setTempDate(e.target.value);
              setBulkErrors((prev) => {
                if (!prev.tempDate) return prev;
                const next = { ...prev };
                delete next.tempDate;
                return next;
              });
            }}
              error={!!bulkErrors.tempDate}
              helperText={bulkErrors.tempDate || ''}
              InputLabelProps={{ shrink: true }} label="Chọn ngày" />
            <Button variant="contained" onClick={handleAddBulkDate}>Thêm</Button>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, minHeight: 100, bgcolor: '#f8fafc' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Danh sách ngày sẽ tạo ({bulkDates.length}):</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {bulkDates.length === 0 && <Typography variant="body2" color="text.secondary">Chưa chọn ngày nào...</Typography>}
              {bulkDates.map((d, i) => (
                <Chip key={i} label={new Date(d).toLocaleDateString('vi-VN')} onDelete={() => setBulkDates(bulkDates.filter(x => x !== d))} color="primary" variant="outlined" />
              ))}
            </Box>
          </Paper>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Hệ thống sẽ tự động tính ngày kết thúc dựa trên số ngày của Tour.
          </Typography>
          {!!bulkErrors.bulkDates && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {bulkErrors.bulkDates}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulk(false)}>Hủy</Button>
          <Button variant="contained" onClick={submitBulkCreate} disabled={creating}>
            {creating ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Assign Tour Guide */}
      <Dialog open={Boolean(assignDialog)} onClose={() => setAssignDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {assignDialog?.tourGuideId ? 'Sửa trưởng đoàn' : 'Gán trưởng đoàn'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            {assignDialog?.tourId?.code} — {assignDialog?.tourId?.name?.vi}
          </Typography>
          <Autocomplete
            size="small"
            options={staffList}
            value={staffList.find((s) => s._id === selectedGuide) || null}
            onChange={(_, value) => {
              setSelectedGuide(value?._id || '');
              if (assignError) setAssignError('');
            }}
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
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tìm và chọn nhân viên"
                error={!!assignError}
                helperText={assignError || 'Có thể tìm theo tên, username, số điện thoại hoặc email'}
              />
            )}
            noOptionsText="Không tìm thấy nhân viên"
          />
        </DialogContent>
        <DialogActions>
          {assignDialog?.tourGuideId && (
            <Button
              color="warning"
              onClick={() => {
                setSelectedGuide('');
                if (assignError) setAssignError('');
              }}
            >
              Bỏ gán
            </Button>
          )}
          <Button onClick={() => setAssignDialog(null)}>Hủy</Button>
          <Button variant="contained" onClick={submitAssignGuide} disabled={assigningGuide}>
            {assigningGuide ? <CircularProgress size={20} color="inherit" /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
