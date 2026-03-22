import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Chip, CircularProgress, TextField, MenuItem,
    Pagination
} from '@mui/material';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getAllSchedules } from '../../services/scheduleApi';

const statusColor = { Available: 'success', Full: 'error', Cancelled: 'default', Completed: 'info' };

export default function StaffTours() {
    const currentUser = useSelector((state) => state.auth.currentUser);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchSchedules = useCallback(async (p = page, st = status) => {
        if (!currentUser?._id) return;
        setLoading(true);
        try {
            const res = await getAllSchedules({ tourGuideId: currentUser._id, status: st, page: p, limit: 10 });
            if (res.success) {
                setSchedules(res.data || []);
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
        fetchSchedules(1, status);
    }, [fetchSchedules, status]);

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Danh sách tour được phân</Typography>

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
                    <MenuItem value="Available">Mở bán</MenuItem>
                    <MenuItem value="Full">Hết chỗ</MenuItem>
                    <MenuItem value="Cancelled">Đã hủy</MenuItem>
                    <MenuItem value="Completed">Hoàn thành</MenuItem>
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
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tour</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày Khởi Hành</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày Kết Thúc</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Chỗ đã đặt / Tổng</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {schedules.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} align="center">Chưa có tour nào</TableCell></TableRow>
                                ) : schedules.map((sch) => (
                                    <TableRow key={sch._id} hover>
                                        <TableCell>
                                            {sch.tourId?.code} <br />
                                            <Typography variant="caption" color="text.secondary">{sch.tourId?.name?.vi}</Typography>
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
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination count={totalPages} page={page} onChange={(e, v) => { setPage(v); fetchSchedules(v, status); }} color="primary" />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
