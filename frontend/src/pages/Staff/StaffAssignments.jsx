import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Chip, CircularProgress, TextField, MenuItem,
    Pagination, FormControl, Select
} from '@mui/material';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getAssignments, updateAssignmentStatus } from '../../services/assignmentApi';

const statusColor = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'default'
};

export default function StaffAssignments() {
    const currentUser = useSelector((state) => state.auth.currentUser);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAssignments = useCallback(async (p = page, st = status) => {
        if (!currentUser?._id) return;
        setLoading(true);
        try {
            const res = await getAssignments({ staffId: currentUser._id, status: st, page: p, limit: 10 });
            if (res.success) {
                setAssignments(res.data || []);
                setPage(res.page || 1);
                setTotalPages(res.totalPages || 1);
            }
        } catch (err) {
            toast.error('Lỗi tải danh sách: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [currentUser?._id, page, status]);

    useEffect(() => {
        fetchAssignments(1, status);
    }, [fetchAssignments, status]);

    const handleChangeStatus = async (assignmentId, nextStatus) => {
        try {
            const res = await updateAssignmentStatus(assignmentId, nextStatus);
            if (res.success) {
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
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Danh sách tư vấn khách hàng</Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    size="small"
                    select
                    label="Trạng thái"
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    sx={{ minWidth: 180, bgcolor: 'white' }}
                >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="pending">Chờ xử lý</MenuItem>
                    <MenuItem value="in_progress">Đang tư vấn</MenuItem>
                    <MenuItem value="completed">Hoàn thành</MenuItem>
                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                </TextField>
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
                                    <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Số khách</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Tổng tiền</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Cập nhật</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assignments.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} align="center">Chưa có nhiệm vụ nào</TableCell></TableRow>
                                ) : assignments.map((a) => (
                                    <TableRow key={a._id} hover>
                                        <TableCell>{a.bookingId?.bookingCode}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600}>{a.bookingId?.contactInfo?.fullName || '—'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{a.bookingId?.contactInfo?.phone || ''}</Typography>
                                        </TableCell>
                                        <TableCell align="center">{a.bookingId?.totalGuests || 0}</TableCell>
                                        <TableCell align="right">{a.bookingId?.totalPrice?.toLocaleString('vi-VN')}₫</TableCell>
                                        <TableCell>
                                            <Chip label={a.status} size="small" color={statusColor[a.status] || 'default'} />
                                        </TableCell>
                                        <TableCell>
                                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                                <Select
                                                    value={a.status}
                                                    onChange={(e) => handleChangeStatus(a._id, e.target.value)}
                                                >
                                                    <MenuItem value="pending">Chờ xử lý</MenuItem>
                                                    <MenuItem value="in_progress">Đang tư vấn</MenuItem>
                                                    <MenuItem value="completed">Hoàn thành</MenuItem>
                                                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination count={totalPages} page={page} onChange={(e, v) => { setPage(v); fetchAssignments(v, status); }} color="primary" />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
