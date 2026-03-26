import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Paper, Chip, CircularProgress, TextField, MenuItem,
    Pagination, Card, CardContent, Grid, LinearProgress, IconButton,
    Tooltip, Dialog, DialogTitle, DialogContent, Divider, FormControl,
    Select, Button, Collapse,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { toast } from 'sonner';
import { getAllSchedules, updateSchedule } from '../../services/scheduleApi';
import { getAllBookings, cancelBookingByAdmin, completeBooking } from '../../services/bookingApi';
import { getAllTours } from '../../services/tourApi';
import { getParticipantsByBookingId, updateParticipant } from '../../services/participantApi';
import CertificateModal from '../../components/staff/CertificateModal';

const STATUS_META = {
    Available: { label: 'Còn chỗ',     color: 'success' },
    Full:      { label: 'Hết chỗ',     color: 'error'   },
    Cancelled: { label: 'Đã hủy',      color: 'default' },
    Completed: { label: 'Hoàn thành',  color: 'info'    },
};

const BOOKING_STATUS = {
    HOLD:      { label: 'Giữ chỗ',     color: 'warning' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'success' },
    CANCELLED: { label: 'Đã hủy',      color: 'default' },
    COMPLETED: { label: 'Hoàn thành',  color: 'info'    },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtMoney = (n) => n != null ? n.toLocaleString('vi-VN') + ' ₫' : '—';

/* ── Stat Card ── */
function StatCard({ icon, label, value, color, bg }) {
    return (
        <Card elevation={0} sx={{ border: '1px solid #eee', borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                    width: 52, height: 52, borderRadius: 2, bgcolor: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color, flexShrink: 0,
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

/* ── Capacity progress bar ── */
function CapacityBar({ booked, capacity }) {
    const pct = capacity > 0 ? Math.min((booked / capacity) * 100, 100) : 0;
    const color = pct >= 100 ? 'error' : pct >= 70 ? 'warning' : 'success';
    return (
        <Box sx={{ minWidth: 120 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography variant="caption" fontWeight={700} color={`${color}.main`}>
                    {booked}/{capacity}
                </Typography>
                <Typography variant="caption" color="text.secondary">{Math.round(pct)}%</Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={pct}
                color={color}
                sx={{ height: 6, borderRadius: 3 }}
            />
        </Box>
    );
}

export default function StaffTours() {
    const now = new Date();
    const [schedules, setSchedules] = useState([]);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    /* Filters */
    const [filterTour, setFilterTour] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
    const [filterYear, setFilterYear] = useState(now.getFullYear());
    const [useMonthFilter, setUseMonthFilter] = useState(false);

    /* Stats (tháng hiện tại) */
    const [stats, setStats] = useState({ total: 0, available: 0, full: 0, completed: 0 });

    /* Booking detail dialog */
    const [bookingDialog, setBookingDialog] = useState(null); // schedule object
    const [bookings, setBookings] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);

    /* Participants expand */
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [participantsMap, setParticipantsMap] = useState({}); // bookingId → participants[]
    const [participantsLoading, setParticipantsLoading] = useState(null); // bookingId đang load

    /* Certificate modal */
    const [certModalParticipant, setCertModalParticipant] = useState(null); // { _id, fullName }

    /* Participant status update */
    const [participantUpdating, setParticipantUpdating] = useState(null);
    const [participantCancelTarget, setParticipantCancelTarget] = useState(null); // { participantId, bookingId, fullName }
    const [participantCancelReason, setParticipantCancelReason] = useState('');
    const [participantCancelling, setParticipantCancelling] = useState(false);

    /* Status update loading */
    const [updatingId, setUpdatingId] = useState(null);

    /* Cancel reason dialog */
    const [cancelTarget, setCancelTarget] = useState(null); // booking object
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [completing, setCompleting] = useState(null); // bookingId đang complete

    /* Load tours for filter */
    useEffect(() => {
        getAllTours({ limit: 100 })
            .then((res) => { if (res.success) setTours(res.data || []); })
            .catch(() => {});
    }, []);

    /* Load stats: tháng hiện tại, tất cả tour */
    useEffect(() => {
        getAllSchedules({ month: now.getMonth() + 1, year: now.getFullYear(), page: 1, limit: 200 })
            .then((res) => {
                const all = res?.data || [];
                setStats({
                    total: all.length,
                    available: all.filter(s => s.status === 'Available').length,
                    full:      all.filter(s => s.status === 'Full').length,
                    completed: all.filter(s => s.status === 'Completed').length,
                });
            })
            .catch(() => {});
    }, []);

    const fetchPage = useCallback(async (p) => {
        setLoading(true);
        try {
            const params = { tourId: filterTour, status: filterStatus, page: p, limit: 12 };
            if (useMonthFilter) { params.month = filterMonth; params.year = filterYear; }
            const res = await getAllSchedules(params);
            if (res.success) {
                setSchedules(res.data || []);
                setPage(res.page || 1);
                setTotalPages(res.totalPages || 1);
                setTotal(res.total || 0);
            }
        } catch (err) {
            toast.error('Lỗi tải danh sách: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [filterTour, filterStatus, filterMonth, filterYear, useMonthFilter]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                const params = { tourId: filterTour, status: filterStatus, page: 1, limit: 12 };
                if (useMonthFilter) { params.month = filterMonth; params.year = filterYear; }
                const res = await getAllSchedules(params);
                if (cancelled) return;
                if (res.success) {
                    setSchedules(res.data || []);
                    setPage(res.page || 1);
                    setTotalPages(res.totalPages || 1);
                    setTotal(res.total || 0);
                }
            } catch (err) {
                if (!cancelled) toast.error('Lỗi tải danh sách: ' + (err.response?.data?.message || err.message));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterTour, filterStatus, filterMonth, filterYear, useMonthFilter]);

    /* Cập nhật trạng thái lịch */
    const handleStatusChange = async (scheduleId, newStatus) => {
        setUpdatingId(scheduleId);
        try {
            const res = await updateSchedule(scheduleId, { status: newStatus });
            if (res.success) {
                setSchedules((prev) =>
                    prev.map((s) => (s._id === scheduleId ? { ...s, status: newStatus } : s))
                );
                toast.success('Cập nhật trạng thái thành công');
            } else {
                toast.error(res.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    /* Xem danh sách booking theo lịch */
    const openBookingDialog = async (schedule) => {
        setBookingDialog(schedule);
        setBookings([]);
        setBookingLoading(true);
        setExpandedBookingId(null);
        setParticipantsMap({});
        try {
            const res = await getAllBookings({ scheduleId: schedule._id, limit: 50 });
            setBookings(res?.data || []);
        } catch (err) {
            toast.error('Lỗi tải booking: ' + (err.response?.data?.message || err.message));
        } finally {
            setBookingLoading(false);
        }
    };

    /* Participant status handlers */
    const handleParticipantComplete = async (participant, bookingId) => {
        setParticipantUpdating(participant._id);
        try {
            const res = await updateParticipant(participant._id, { status: 'completed' });
            if (res.success) {
                setParticipantsMap((prev) => ({
                    ...prev,
                    [bookingId]: prev[bookingId].map((p) =>
                        p._id === participant._id ? { ...p, status: 'completed' } : p
                    ),
                }));
                toast.success(`Đã hoàn thành phục vụ: ${participant.fullName}`);
                setCertModalParticipant({ _id: participant._id, fullName: participant.fullName });
            } else {
                toast.error(res.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
        } finally {
            setParticipantUpdating(null);
        }
    };

    const openParticipantCancelDialog = (participant, bookingId) => {
        setParticipantCancelTarget({ participantId: participant._id, bookingId, fullName: participant.fullName });
        setParticipantCancelReason('');
    };

    const handleParticipantConfirmCancel = async () => {
        if (!participantCancelTarget) return;
        setParticipantCancelling(true);
        try {
            const res = await updateParticipant(participantCancelTarget.participantId, {
                status: 'cancelled',
                cancelReason: participantCancelReason,
            });
            if (res.success) {
                setParticipantsMap((prev) => ({
                    ...prev,
                    [participantCancelTarget.bookingId]: prev[participantCancelTarget.bookingId].map((p) =>
                        p._id === participantCancelTarget.participantId
                            ? { ...p, status: 'cancelled', cancelReason: participantCancelReason }
                            : p
                    ),
                }));
                toast.success(`Đã ngưng phục vụ: ${participantCancelTarget.fullName}`);
                setParticipantCancelTarget(null);
            } else {
                toast.error(res.message || 'Thao tác thất bại');
            }
        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
        } finally {
            setParticipantCancelling(false);
        }
    };

    /* Hoàn thành booking */
    const handleComplete = async (booking) => {
        setCompleting(booking._id);
        try {
            const res = await completeBooking(booking._id);
            if (res.success) {
                setBookings((prev) =>
                    prev.map((b) => b._id === booking._id ? { ...b, status: 'COMPLETED' } : b)
                );
                toast.success(`Đã hoàn thành booking ${booking.bookingCode}`);
            } else {
                toast.error(res.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
        } finally {
            setCompleting(null);
        }
    };

    /* Toggle danh sách người đi của booking */
    const toggleParticipants = async (bookingId) => {
        if (expandedBookingId === bookingId) {
            setExpandedBookingId(null);
            return;
        }
        setExpandedBookingId(bookingId);
        if (participantsMap[bookingId]) return; // đã cache
        setParticipantsLoading(bookingId);
        try {
            const res = await getParticipantsByBookingId(bookingId);
            setParticipantsMap((prev) => ({ ...prev, [bookingId]: res?.data || [] }));
        } catch {
            setParticipantsMap((prev) => ({ ...prev, [bookingId]: [] }));
        } finally {
            setParticipantsLoading(null);
        }
    };

    /* Mở dialog nhập lý do dừng phục vụ */
    const openCancelDialog = (booking) => {
        setCancelTarget(booking);
        setCancelReason('');
    };

    /* Xác nhận dừng phục vụ */
    const handleConfirmCancel = async () => {
        if (!cancelTarget) return;
        setCancelling(true);
        try {
            const res = await cancelBookingByAdmin(cancelTarget._id, cancelReason);
            if (res.success) {
                setBookings((prev) =>
                    prev.map((b) => b._id === cancelTarget._id
                        ? { ...b, status: 'CANCELLED', cancelReason }
                        : b
                    )
                );
                toast.success(`Đã dừng phục vụ booking ${cancelTarget.bookingCode}`);
                setCancelTarget(null);
            } else {
                toast.error(res.message || 'Thao tác thất bại');
            }
        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
        } finally {
            setCancelling(false);
        }
    };

    const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

    return (
        <Box>
            {/* ── Header ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <CalendarMonthIcon sx={{ color: '#2b6f56', fontSize: 28 }} />
                <Box>
                    <Typography variant="h5" fontWeight={700}>Quản lý Lịch Khởi Hành</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Xem, theo dõi và cập nhật trạng thái lịch tour
                    </Typography>
                </Box>
            </Box>

            {/* ── Stat Cards (tháng hiện tại) ── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <StatCard
                        icon={<CalendarMonthIcon />}
                        label={`Lịch tháng ${now.getMonth() + 1}`}
                        value={stats.total}
                        color="#2b6f56"
                        bg="rgba(43,111,86,0.08)"
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard
                        icon={<EventAvailableIcon />}
                        label="Còn chỗ"
                        value={stats.available}
                        color="#2e7d32"
                        bg="rgba(46,125,50,0.08)"
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard
                        icon={<PeopleIcon />}
                        label="Hết chỗ"
                        value={stats.full}
                        color="#c62828"
                        bg="rgba(198,40,40,0.08)"
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard
                        icon={<CheckCircleIcon />}
                        label="Hoàn thành"
                        value={stats.completed}
                        color="#0277bd"
                        bg="rgba(2,119,189,0.08)"
                    />
                </Grid>
            </Grid>

            {/* ── Filter Bar ── */}
            <Paper elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small" select label="Tour" value={filterTour}
                        onChange={(e) => setFilterTour(e.target.value)}
                        sx={{ minWidth: 220, bgcolor: 'white' }}
                    >
                        <MenuItem value="all">Tất cả tour</MenuItem>
                        {tours.map((t) => (
                            <MenuItem key={t._id} value={t._id}>
                                {t.code} — {t.name?.vi || t.name?.en}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small" select label="Trạng thái" value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        sx={{ minWidth: 160, bgcolor: 'white' }}
                    >
                        <MenuItem value="all">Tất cả</MenuItem>
                        {Object.entries(STATUS_META).map(([val, { label }]) => (
                            <MenuItem key={val} value={val}>{label}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small" select label="Lọc theo tháng" value={useMonthFilter ? 'yes' : 'no'}
                        onChange={(e) => setUseMonthFilter(e.target.value === 'yes')}
                        sx={{ minWidth: 160, bgcolor: 'white' }}
                    >
                        <MenuItem value="no">Tất cả thời gian</MenuItem>
                        <MenuItem value="yes">Lọc theo tháng</MenuItem>
                    </TextField>

                    {useMonthFilter && (
                        <>
                            <TextField
                                size="small" select label="Tháng" value={filterMonth}
                                onChange={(e) => setFilterMonth(Number(e.target.value))}
                                sx={{ width: 90, bgcolor: 'white' }}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>T{i + 1}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                size="small" select label="Năm" value={filterYear}
                                onChange={(e) => setFilterYear(Number(e.target.value))}
                                sx={{ width: 100, bgcolor: 'white' }}
                            >
                                {yearOptions.map((y) => (
                                    <MenuItem key={y} value={y}>{y}</MenuItem>
                                ))}
                            </TextField>
                        </>
                    )}

                    {!loading && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                            Tổng: <strong>{total}</strong> lịch
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* ── Table ── */}
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
                                    <TableCell sx={{ fontWeight: 700 }}>Tour</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Ngày khởi hành</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Ngày kết thúc</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Trưởng đoàn</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Sức chứa</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="center">Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {schedules.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                            Không có lịch trình nào
                                        </TableCell>
                                    </TableRow>
                                ) : schedules.map((sch) => (
                                    <TableRow key={sch._id} hover>
                                        {/* Tour */}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700}>
                                                {sch.tourId?.code || '—'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ maxWidth: 160 }}>
                                                {sch.tourId?.name?.vi || ''}
                                            </Typography>
                                        </TableCell>

                                        {/* Ngày KH */}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>{fmt(sch.startDate)}</Typography>
                                        </TableCell>

                                        {/* Ngày KT */}
                                        <TableCell>
                                            <Typography variant="body2">{fmt(sch.endDate)}</Typography>
                                        </TableCell>

                                        {/* Trưởng đoàn */}
                                        <TableCell>
                                            {sch.tourGuideId ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PersonIcon sx={{ fontSize: 15, color: '#2b6f56' }} />
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {sch.tourGuideId.fullName || sch.tourGuideId.username}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Chip label="Chưa gán" size="small" variant="outlined" />
                                            )}
                                        </TableCell>

                                        {/* Capacity bar */}
                                        <TableCell sx={{ minWidth: 140 }}>
                                            <CapacityBar booked={sch.bookedSlots} capacity={sch.capacity} />
                                        </TableCell>

                                        {/* Status (editable) */}
                                        <TableCell>
                                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                                {updatingId === sch._id ? (
                                                    <CircularProgress size={20} sx={{ color: '#2b6f56' }} />
                                                ) : (
                                                    <Select
                                                        value={sch.status}
                                                        onChange={(e) => handleStatusChange(sch._id, e.target.value)}
                                                        renderValue={(val) => (
                                                            <Chip
                                                                label={STATUS_META[val]?.label || val}
                                                                size="small"
                                                                color={STATUS_META[val]?.color || 'default'}
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        )}
                                                    >
                                                        {Object.entries(STATUS_META).map(([val, { label }]) => (
                                                            <MenuItem key={val} value={val}>{label}</MenuItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            </FormControl>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell align="center">
                                            <Tooltip title="Xem danh sách khách">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<GroupsIcon />}
                                                    onClick={() => openBookingDialog(sch)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        borderColor: '#2b6f56',
                                                        color: '#2b6f56',
                                                        '&:hover': { borderColor: '#1a4a39', bgcolor: 'rgba(43,111,86,0.05)' },
                                                    }}
                                                >
                                                    Xem khách
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, v) => fetchPage(v)}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}

            {/* ── Dialog: Danh sách booking theo lịch ── */}
            <Dialog
                open={Boolean(bookingDialog)}
                onClose={() => { setBookingDialog(null); setExpandedBookingId(null); setParticipantsMap({}); }}
                maxWidth="xl"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography fontWeight={700} fontSize={17}>
                                Danh sách khách — {bookingDialog?.tourId?.code}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {fmt(bookingDialog?.startDate)} → {fmt(bookingDialog?.endDate)}
                                &nbsp;·&nbsp;
                                {bookingDialog?.bookedSlots}/{bookingDialog?.capacity} chỗ
                            </Typography>
                        </Box>
                        <IconButton onClick={() => { setBookingDialog(null); setExpandedBookingId(null); setParticipantsMap({}); }} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 2, pb: 3, overflow: 'auto' }}>
                    {bookingLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress sx={{ color: '#2b6f56' }} />
                        </Box>
                    ) : bookings.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                            Chưa có booking nào trong lịch này.
                        </Typography>
                    ) : (
                        <TableContainer sx={{ border: '1px solid #eee', borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                    <TableRow>
                                        <TableCell sx={{ width: 40 }} />
                                        <TableCell sx={{ fontWeight: 700 }}>Mã Booking</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Khách hàng</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Liên hệ</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="center">Số KH</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Tổng tiền</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="center">Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bookings.map((b) => {
                                        const bStatus = BOOKING_STATUS[b.status] || { label: b.status, color: 'default' };
                                        const canAct = b.status === 'HOLD' || b.status === 'CONFIRMED';
                                        const isCompleting = completing === b._id;
                                        const isExpanded = expandedBookingId === b._id;
                                        const isLoadingP = participantsLoading === b._id;
                                        const participants = participantsMap[b._id] || [];
                                        return (
                                            <React.Fragment key={b._id}>
                                                <TableRow hover>
                                                    <TableCell>
                                                        <Tooltip title={isExpanded ? 'Ẩn danh sách người đi' : 'Xem danh sách người đi'}>
                                                            <IconButton size="small" onClick={() => toggleParticipants(b._id)}>
                                                                {isLoadingP
                                                                    ? <CircularProgress size={16} />
                                                                    : isExpanded
                                                                        ? <KeyboardArrowUpIcon fontSize="small" />
                                                                        : <KeyboardArrowDownIcon fontSize="small" />
                                                                }
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={700} color="primary.main">
                                                            {b.bookingCode}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {b.contactInfo?.fullName || '—'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{b.contactInfo?.phone || '—'}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {b.contactInfo?.email || ''}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography fontWeight={600}>{b.totalGuests}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" fontWeight={600} color="success.dark">
                                                            {fmtMoney(b.totalPrice)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Chip
                                                                label={bStatus.label}
                                                                size="small"
                                                                color={bStatus.color}
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                            {b.status === 'CANCELLED' && b.cancelReason && (
                                                                <Tooltip title={`Lý do: ${b.cancelReason}`} arrow>
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                        display="block"
                                                                        noWrap
                                                                        sx={{ maxWidth: 120, cursor: 'help', mt: 0.3 }}
                                                                    >
                                                                        {b.cancelReason}
                                                                    </Typography>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {canAct ? (
                                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                                <Tooltip title="Hoàn thành">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="success"
                                                                        onClick={() => handleComplete(b)}
                                                                        disabled={isCompleting}
                                                                    >
                                                                        {isCompleting
                                                                            ? <CircularProgress size={16} color="success" />
                                                                            : <TaskAltIcon fontSize="small" />
                                                                        }
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Dừng phục vụ">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => openCancelDialog(b)}
                                                                    >
                                                                        <BlockIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="caption" color="text.disabled">—</Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>

                                                {/* Sub-row: danh sách người đi */}
                                                <TableRow>
                                                    <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                            <Box sx={{ m: 1, ml: 4, mb: 1.5 }}>
                                                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                                                    DANH SÁCH NGƯỜI ĐI — {b.bookingCode} ({participants.length} người)
                                                                </Typography>
                                                                {participants.length === 0 ? (
                                                                    <Typography variant="caption" color="text.disabled">
                                                                        Chưa có thông tin người đi.
                                                                    </Typography>
                                                                ) : (
                                                                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                                                        <Table size="small">
                                                                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                                                                <TableRow>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }}>#</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }}>Họ tên</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }}>Ngày sinh</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }}>Giới tính</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }}>CMND/Hộ chiếu</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }}>Quốc tịch</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }}>Thể lực</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }}>Chế độ ăn</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }}>Trạng thái</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 600, py: 0.8 }} align="center">Hành động</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {participants.map((p, idx) => {
                                                                                    const isUpdating = participantUpdating === p._id;
                                                                                    const canActP = !p.status || p.status === 'active';
                                                                                    return (
                                                                                    <TableRow key={p._id} hover>
                                                                                        <TableCell sx={{ py: 0.8 }}>{idx + 1}</TableCell>
                                                                                        <TableCell sx={{ py: 0.8 }}>
                                                                                            <Typography variant="body2" fontWeight={600}>{p.fullName}</Typography>
                                                                                            {p.phone && (
                                                                                                <Typography variant="caption" color="text.secondary" display="block">{p.phone}</Typography>
                                                                                            )}
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ py: 0.8 }}>
                                                                                            <Typography variant="body2">{fmt(p.dob)}</Typography>
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ py: 0.8 }}>
                                                                                            <Typography variant="body2">
                                                                                                {p.gender === 'Male' ? 'Nam' : p.gender === 'Female' ? 'Nữ' : 'Khác'}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ py: 0.8 }}>
                                                                                            <Typography variant="body2" fontFamily="monospace">{p.passportOrId}</Typography>
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ py: 0.8 }}>
                                                                                            <Typography variant="body2">{p.nationality}</Typography>
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ py: 0.8 }}>
                                                                                            <Typography variant="body2">{p.healthSurvey?.fitnessLevel || '—'}</Typography>
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ py: 0.8 }}>
                                                                                            <Typography variant="body2">
                                                                                                {p.preferences?.dietaryPreference === 'None' ? '—' : (p.preferences?.dietaryPreference || '—')}
                                                                                            </Typography>
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ py: 0.8 }}>
                                                                                            {p.status === 'completed' && (
                                                                                                <Chip label="Hoàn thành" size="small" color="success" sx={{ fontWeight: 600 }} />
                                                                                            )}
                                                                                            {p.status === 'cancelled' && (
                                                                                                <Tooltip title={p.cancelReason ? `Lý do: ${p.cancelReason}` : ''} arrow>
                                                                                                    <Chip label="Ngưng phục vụ" size="small" color="error" sx={{ fontWeight: 600, cursor: p.cancelReason ? 'help' : 'default' }} />
                                                                                                </Tooltip>
                                                                                            )}
                                                                                            {(p.status === 'active' || !p.status) && (
                                                                                                <Chip label="Đang phục vụ" size="small" color="info" sx={{ fontWeight: 600 }} />
                                                                                            )}
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ py: 0.8 }} align="center">
                                                                                            {canActP ? (
                                                                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                                                                    <Tooltip title="Hoàn thành">
                                                                                                        <IconButton size="small" color="success" onClick={() => handleParticipantComplete(p, b._id)} disabled={isUpdating}>
                                                                                                            {isUpdating ? <CircularProgress size={14} color="success" /> : <TaskAltIcon fontSize="small" />}
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                    <Tooltip title="Ngưng phục vụ">
                                                                                                        <IconButton size="small" color="error" onClick={() => openParticipantCancelDialog(p, b._id)} disabled={isUpdating}>
                                                                                                            <BlockIcon fontSize="small" />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                </Box>
                                                                                            ) : p.status === 'completed' ? (
                                                                                                <Tooltip title="Xem chứng chỉ">
                                                                                                    <IconButton size="small" sx={{ color: '#c9a227' }} onClick={() => setCertModalParticipant({ _id: p._id, fullName: p.fullName })}>
                                                                                                        <WorkspacePremiumIcon fontSize="small" />
                                                                                                    </IconButton>
                                                                                                </Tooltip>
                                                                                            ) : (
                                                                                                <Typography variant="caption" color="text.disabled">—</Typography>
                                                                                            )}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    );
                                                                                })}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </TableContainer>
                                                                )}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Tổng kết */}
                    {bookings.length > 0 && (
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', gap: 3 }}>
                            <Typography variant="body2">
                                Tổng booking: <strong>{bookings.length}</strong>
                            </Typography>
                            <Typography variant="body2">
                                Đã xác nhận: <strong>{bookings.filter(b => b.status === 'CONFIRMED').length}</strong>
                            </Typography>
                            <Typography variant="body2">
                                Giữ chỗ: <strong>{bookings.filter(b => b.status === 'HOLD').length}</strong>
                            </Typography>
                            <Typography variant="body2" color="success.dark">
                                Doanh thu: <strong>
                                    {fmtMoney(
                                        bookings
                                            .filter(b => b.status !== 'CANCELLED')
                                            .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                                    )}
                                </strong>
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Dialog: Ngưng phục vụ hành khách ── */}
            <Dialog
                open={Boolean(participantCancelTarget)}
                onClose={() => !participantCancelling && setParticipantCancelTarget(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BlockIcon color="error" />
                    <Box>
                        <Typography fontWeight={700}>Ngưng phục vụ hành khách</Typography>
                        <Typography variant="body2" color="text.secondary">{participantCancelTarget?.fullName}</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 2.5, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Hành khách sẽ được đánh dấu <strong>Ngưng phục vụ</strong>. Vui lòng nhập lý do.
                    </Typography>
                    <TextField
                        fullWidth multiline rows={3}
                        label="Lý do ngưng phục vụ"
                        placeholder="Ví dụ: không đủ điều kiện sức khỏe, từ chối tham gia..."
                        value={participantCancelReason}
                        onChange={(e) => setParticipantCancelReason(e.target.value)}
                        required
                        error={!participantCancelReason.trim()}
                        helperText={!participantCancelReason.trim() ? 'Vui lòng nhập lý do' : ' '}
                        inputProps={{ maxLength: 300 }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'right', mt: -1 }}>
                        {participantCancelReason.length}/300
                    </Typography>
                </DialogContent>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 3, py: 2 }}>
                    <Button variant="outlined" onClick={() => setParticipantCancelTarget(null)} disabled={participantCancelling} sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained" color="error"
                        onClick={handleParticipantConfirmCancel}
                        disabled={participantCancelling || !participantCancelReason.trim()}
                        startIcon={participantCancelling ? <CircularProgress size={16} color="inherit" /> : <BlockIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        {participantCancelling ? 'Đang xử lý...' : 'Xác nhận'}
                    </Button>
                </Box>
            </Dialog>

            {/* ── Dialog: Dừng phục vụ — nhập lý do ── */}
            <Dialog
                open={Boolean(cancelTarget)}
                onClose={() => !cancelling && setCancelTarget(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BlockIcon color="error" />
                    <Box>
                        <Typography fontWeight={700}>Dừng phục vụ</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {cancelTarget?.bookingCode} — {cancelTarget?.contactInfo?.fullName}
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 2.5, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Booking sẽ chuyển sang trạng thái <strong>Đã hủy</strong>. Thao tác này không thể hoàn tác.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Lý do dừng phục vụ"
                        placeholder="Nhập lý do (ví dụ: khách không đủ điều kiện sức khỏe, hủy theo yêu cầu...)"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        required
                        error={!cancelReason.trim()}
                        helperText={!cancelReason.trim() ? 'Vui lòng nhập lý do' : ' '}
                        inputProps={{ maxLength: 300 }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'right', mt: -1 }}>
                        {cancelReason.length}/300
                    </Typography>
                </DialogContent>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 3, py: 2, borderTop: '1px solid #eee' }}>
                    <Button
                        variant="outlined"
                        onClick={() => setCancelTarget(null)}
                        disabled={cancelling}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmCancel}
                        disabled={cancelling || !cancelReason.trim()}
                        startIcon={cancelling ? <CircularProgress size={16} color="inherit" /> : <BlockIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        {cancelling ? 'Đang xử lý...' : 'Xác nhận dừng'}
                    </Button>
                </Box>
            </Dialog>

            {/* Certificate modal */}
            <CertificateModal
                open={!!certModalParticipant}
                onClose={() => setCertModalParticipant(null)}
                participantId={certModalParticipant?._id}
                participantName={certModalParticipant?.fullName}
            />
        </Box>
    );
}
