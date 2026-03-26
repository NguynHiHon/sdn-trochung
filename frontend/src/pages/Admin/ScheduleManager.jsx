import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, IconButton, Chip, TextField, MenuItem, Pagination,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
    Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'sonner';
import { getAllSchedules, deleteSchedule, bulkCreateSchedules, updateSchedule } from '../../services/scheduleApi';
import { getAllTours } from '../../services/tourApi';
import { getStaffList } from '../../services/userApi';

const statusColor = { Available: 'success', Full: 'error', Started: 'warning', Cancelled: 'default', Completed: 'info' };

export default function ScheduleManager() {
    const [schedules, setSchedules] = useState([]);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);

    const [filterTour, setFilterTour] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterHidden, setFilterHidden] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [openBulk, setOpenBulk] = useState(false);
    const [bulkTourId, setBulkTourId] = useState('');
    const [bulkDates, setBulkDates] = useState([]);
    const [tempDate, setTempDate] = useState('');
    const [creating, setCreating] = useState(false);

    const [assignDialog, setAssignDialog] = useState(null);
    const [selectedGuide, setSelectedGuide] = useState('');
    const [assigningGuide, setAssigningGuide] = useState(false);

    const [editDialog, setEditDialog] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(false);

    const fetchSchedules = useCallback(async (t = filterTour, st = filterStatus, hidden = filterHidden, p = 1) => {
        try {
            setLoading(true);
            const res = await getAllSchedules({ tourId: t, status: st, hidden, page: p, limit: 12 });
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
    }, [filterTour, filterStatus, filterHidden]);

    useEffect(() => {
        fetchSchedules();
        getAllTours({ limit: 100 }).then((res) => { if (res.success) setTours(res.data); });
        getStaffList().then((res) => { if (res.success) setStaffList(res.data); });
    }, [fetchSchedules]);

    const handleSearch = () => {
        setPage(1);
        fetchSchedules(filterTour, filterStatus, filterHidden, 1);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa lịch trình này? Các booking bên trong sẽ bị ảnh hưởng!')) return;
        try {
            await deleteSchedule(id);
            toast.success('Đã xóa lịch');
            fetchSchedules(filterTour, filterStatus, filterHidden, page);
        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAddBulkDate = () => {
        if (!tempDate) return;

        const picked = new Date(tempDate);
        if (Number.isNaN(picked.getTime())) {
            toast.warning('Ngày khởi hành không hợp lệ');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        picked.setHours(0, 0, 0, 0);
        if (picked < today) {
            toast.warning('Không thể tạo lịch với ngày trong quá khứ');
            return;
        }

        if (bulkDates.includes(tempDate)) {
            toast.warning('Ngày này đã được thêm');
            return;
        }
        setBulkDates([...bulkDates, tempDate].sort());
        setTempDate('');
    };

    const openAssignGuide = (schedule) => {
        setAssignDialog(schedule);
        setSelectedGuide(schedule?.tourGuideId?._id || '');
    };

    const submitAssignGuide = async () => {
        if (!assignDialog) return;

        setAssigningGuide(true);
        try {
            const res = await updateSchedule(assignDialog._id, { tourGuideId: selectedGuide || null });
            if (res.success) {
                toast.success('Đã cập nhật trưởng đoàn');
                setAssignDialog(null);
                fetchSchedules(filterTour, filterStatus, filterHidden, page);
            } else {
                toast.error(res.message || 'Gán trưởng đoàn thất bại');
            }
        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
        } finally {
            setAssigningGuide(false);
        }
    };

    const submitBulkCreate = async () => {
        if (!bulkTourId) return toast.warning('Vui lòng chọn Tour');
        if (bulkDates.length === 0) return toast.warning('Vui lòng thêm ít nhất 1 ngày');

        setCreating(true);
        try {
            const res = await bulkCreateSchedules(bulkTourId, bulkDates);
            toast.success(res.message || 'Tạo lịch thành công');
            setOpenBulk(false);
            setBulkDates([]);
            setBulkTourId('');
            fetchSchedules(filterTour, filterStatus, filterHidden, page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể tạo lịch. Vui lòng kiểm tra ngày trùng.');
        } finally {
            setCreating(false);
        }
    };

    const openEditDialog = (schedule) => {
        setEditDialog({
            _id: schedule._id,
            code: schedule.tourId?.code,
            tourName: schedule.tourId?.name?.vi,
            capacity: schedule.capacity,
            status: schedule.status,
            isHidden: Boolean(schedule.isHidden),
        });
    };

    const submitEditSchedule = async () => {
        if (!editDialog) return;
        if (!Number.isInteger(Number(editDialog.capacity)) || Number(editDialog.capacity) < 1) {
            toast.warning('Sức chứa phải là số nguyên >= 1');
            return;
        }

        setEditingSchedule(true);
        try {
            const res = await updateSchedule(editDialog._id, {
                capacity: Number(editDialog.capacity),
                status: editDialog.status,
                isHidden: Boolean(editDialog.isHidden),
            });
            if (res.success) {
                toast.success('Đã cập nhật lịch');
                setEditDialog(null);
                fetchSchedules(filterTour, filterStatus, filterHidden, page);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể cập nhật lịch');
        } finally {
            setEditingSchedule(false);
        }
    };

    const toggleHidden = async (schedule) => {
        try {
            const res = await updateSchedule(schedule._id, { isHidden: !schedule.isHidden });
            if (res.success) {
                toast.success(schedule.isHidden ? 'Đã hiện lịch' : 'Đã ẩn lịch');
                fetchSchedules(filterTour, filterStatus, filterHidden, page);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể đổi trạng thái ẩn/hiện');
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

            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField size="small" select label="Chọn Tour" value={filterTour} onChange={(e) => setFilterTour(e.target.value)} sx={{ minWidth: 220, bgcolor: 'white' }}>
                    <MenuItem value="all">Tất cả Tour</MenuItem>
                    {tours.map((t) => <MenuItem key={t._id} value={t._id}>{t.name?.vi || t.code}</MenuItem>)}
                </TextField>
                <TextField size="small" select label="Trạng thái" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 150, bgcolor: 'white' }}>
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="Available">Mở bán</MenuItem>
                    <MenuItem value="Full">Hết chỗ</MenuItem>
                    <MenuItem value="Started">Khởi hành</MenuItem>
                    <MenuItem value="Cancelled">Đã hủy</MenuItem>
                    <MenuItem value="Completed">Hoàn thành</MenuItem>
                </TextField>
                <TextField size="small" select label="Hiển thị" value={filterHidden} onChange={(e) => setFilterHidden(e.target.value)} sx={{ minWidth: 150, bgcolor: 'white' }}>
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="visible">Đang hiển thị</MenuItem>
                    <MenuItem value="hidden">Đang ẩn</MenuItem>
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
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tour</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trưởng đoàn</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày Khởi Hành</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày Kết Thúc</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Chỗ đã đặt / Tổng</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Hiển thị</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {schedules.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} align="center">Chưa có lịch trình nào</TableCell></TableRow>
                                ) : schedules.map((sch) => (
                                    <TableRow key={sch._id} hover>
                                        <TableCell>
                                            {sch.tourId?.code}<br />
                                            <Typography variant="caption" color="text.secondary">{sch.tourId?.name?.vi}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {sch.tourGuideId ? (
                                                <Typography variant="body2" fontWeight={600}>{sch.tourGuideId?.fullName || sch.tourGuideId?.username}</Typography>
                                            ) : (
                                                <Chip label="Chưa gán" size="small" variant="outlined" />
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
                                        <TableCell>
                                            <Chip size="small" label={sch.isHidden ? 'Đang ẩn' : 'Đang hiện'} color={sch.isHidden ? 'default' : 'success'} variant={sch.isHidden ? 'outlined' : 'filled'} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="column" spacing={0.5} alignItems="flex-end">
                                                <Typography variant="caption" color="text.secondary">
                                                    {sch.tourGuideId ? `Đã gán: ${sch.tourGuideId.fullName || sch.tourGuideId.username}` : 'Chưa gán trưởng đoàn'}
                                                </Typography>
                                                <Box>
                                                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openAssignGuide(sch)}>Gán trưởng đoàn</Button>
                                                    <IconButton size="small" onClick={() => openEditDialog(sch)}><EditIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" onClick={() => toggleHidden(sch)}>
                                                        {sch.isHidden ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(sch._id)}><DeleteIcon color="error" fontSize="small" /></IconButton>
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
                            <Pagination count={totalPages} page={page} onChange={(e, v) => fetchSchedules(filterTour, filterStatus, filterHidden, v)} color="primary" />
                        </Box>
                    )}
                </>
            )}

            <Dialog open={openBulk} onClose={() => setOpenBulk(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo Lịch Khởi Hành Hàng Loạt</DialogTitle>
                <DialogContent dividers>
                    <TextField fullWidth select label="Chọn Tour cần tạo lịch" value={bulkTourId} onChange={(e) => setBulkTourId(e.target.value)} sx={{ mb: 3 }}>
                        <MenuItem value="">-- Vui lòng chọn --</MenuItem>
                        {tours.map((t) => <MenuItem key={t._id} value={t._id}>{t.code} - {t.name?.vi}</MenuItem>)}
                    </TextField>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField type="date" size="small" fullWidth value={tempDate} onChange={(e) => setTempDate(e.target.value)} InputLabelProps={{ shrink: true }} label="Chọn ngày" />
                        <Button variant="contained" onClick={handleAddBulkDate}>Thêm</Button>
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2, minHeight: 100, bgcolor: '#f8fafc' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Danh sách ngày sẽ tạo ({bulkDates.length}):</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {bulkDates.length === 0 && <Typography variant="body2" color="text.secondary">Chưa chọn ngày nào...</Typography>}
                            {bulkDates.map((d, i) => (
                                <Chip key={i} label={new Date(d).toLocaleDateString('vi-VN')} onDelete={() => setBulkDates(bulkDates.filter((x) => x !== d))} color="primary" variant="outlined" />
                            ))}
                        </Box>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Hệ thống tự động tính ngày kết thúc dựa trên số ngày của Tour.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulk(false)}>Hủy</Button>
                    <Button variant="contained" onClick={submitBulkCreate} disabled={creating}>
                        {creating ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận Tạo'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(assignDialog)} onClose={() => setAssignDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Gán trưởng đoàn</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        {assignDialog?.tourId?.code} — {assignDialog?.tourId?.name?.vi}
                    </Typography>
                    <Autocomplete
                        options={staffList}
                        value={staffList.find((s) => s._id === selectedGuide) || null}
                        onChange={(_, value) => setSelectedGuide(value?._id || '')}
                        getOptionLabel={(option) => `${option.fullName || option.username || ''} ${option.phone ? `- ${option.phone}` : ''}`.trim()}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        filterOptions={(options, { inputValue }) => {
                            const kw = inputValue.trim().toLowerCase();
                            if (!kw) return options;
                            return options.filter((s) =>
                                `${s.fullName || ''} ${s.username || ''} ${s.phone || ''} ${s.email || ''}`.toLowerCase().includes(kw)
                            );
                        }}
                        renderInput={(params) => <TextField {...params} label="Tìm và chọn nhân viên" size="small" />}
                    />
                    <Button size="small" sx={{ mt: 1 }} onClick={() => setSelectedGuide('')}>Bỏ gán</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialog(null)}>Hủy</Button>
                    <Button variant="contained" onClick={submitAssignGuide} disabled={assigningGuide}>
                        {assigningGuide ? <CircularProgress size={20} color="inherit" /> : 'Lưu'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(editDialog)} onClose={() => setEditDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Chỉnh sửa lịch khởi hành</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {editDialog?.code} — {editDialog?.tourName}
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            size="small"
                            label="Sức chứa"
                            type="number"
                            value={editDialog?.capacity ?? ''}
                            onChange={(e) => setEditDialog((prev) => ({ ...prev, capacity: e.target.value }))}
                        />
                        <TextField
                            size="small"
                            select
                            label="Trạng thái"
                            value={editDialog?.status || 'Available'}
                            onChange={(e) => setEditDialog((prev) => ({ ...prev, status: e.target.value }))}
                        >
                            <MenuItem value="Available">Mở bán</MenuItem>
                            <MenuItem value="Full">Hết chỗ</MenuItem>
                            <MenuItem value="Started">Khởi hành</MenuItem>
                            <MenuItem value="Cancelled">Đã hủy</MenuItem>
                            <MenuItem value="Completed">Hoàn thành</MenuItem>
                        </TextField>
                        <TextField
                            size="small"
                            select
                            label="Hiển thị"
                            value={editDialog?.isHidden ? 'hidden' : 'visible'}
                            onChange={(e) => setEditDialog((prev) => ({ ...prev, isHidden: e.target.value === 'hidden' }))}
                        >
                            <MenuItem value="visible">Hiện trên hệ thống</MenuItem>
                            <MenuItem value="hidden">Ẩn khỏi hệ thống</MenuItem>
                        </TextField>
                        <Typography variant="caption" color="warning.main">
                            Lưu ý: Không cho phép sửa ngày khởi hành/kết thúc. Nếu cần đổi ngày, hãy tạo lịch mới.
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog(null)}>Hủy</Button>
                    <Button variant="contained" onClick={submitEditSchedule} disabled={editingSchedule}>
                        {editingSchedule ? <CircularProgress size={20} color="inherit" /> : 'Lưu thay đổi'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
