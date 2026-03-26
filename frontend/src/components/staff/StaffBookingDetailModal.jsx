import React, { useEffect, useState } from 'react';
import {
    Box, Button, Chip, CircularProgress, Dialog, DialogContent,
    DialogTitle, Divider, Grid, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import TourIcon from '@mui/icons-material/Explore';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import GroupIcon from '@mui/icons-material/Group';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getBookingById } from '../../services/bookingApi';
import { getParticipantsByBookingId } from '../../services/participantApi';

const BOOKING_STATUS = {
    HOLD: { label: 'Giữ chỗ', color: 'warning' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'success' },
    DEPARTED: { label: 'Khởi hành', color: 'warning' },
    CANCELLED: { label: 'Đã hủy', color: 'default' },
    COMPLETED: { label: 'Hoàn thành', color: 'info' },
};

const GENDER_LABEL = { Male: 'Nam', Female: 'Nữ', Other: 'Khác' };

const fmt = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtMoney = (n) => n != null ? n.toLocaleString('vi-VN') + ' ₫' : '—';

function InfoRow({ label, value }) {
    return (
        <Box sx={{ display: 'flex', gap: 1, mb: 0.8 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
                {value || '—'}
            </Typography>
        </Box>
    );
}

function SectionTitle({ icon, title }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, mt: 2.5 }}>
            <Box sx={{ color: '#2b6f56' }}>{icon}</Box>
            <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
            <Divider sx={{ flex: 1, ml: 1 }} />
        </Box>
    );
}

/**
 * Modal xem chi tiết booking khi staff click vào 1 dòng trong danh sách tư vấn.
 *
 * Props:
 *   open         boolean
 *   onClose      () => void
 *   bookingId    string   — _id của booking cần load
 *   tourCode     string   — code của tour để tạo link /tour/:code (optional, fallback từ booking)
 */
export default function StaffBookingDetailModal({ open, onClose, bookingId, tourCode }) {
    const [booking, setBooking] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !bookingId) return;

        const load = async () => {
            setLoading(true);
            setBooking(null);
            setParticipants([]);
            try {
                const [bRes, pRes] = await Promise.all([
                    getBookingById(bookingId),
                    getParticipantsByBookingId(bookingId),
                ]);
                setBooking(bRes?.data || null);
                setParticipants(pRes?.data || []);
            } catch (err) {
                toast.error('Không tải được chi tiết booking: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [open, bookingId]);

    const tour = booking?.tourId;
    const schedule = booking?.scheduleId;
    const contact = booking?.contactInfo;
    const resolvedTourCode = tourCode || tour?.code;
    const bStatus = BOOKING_STATUS[booking?.status] || { label: booking?.status, color: 'default' };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            {/* Header */}
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h6" fontWeight={700}>
                            {loading ? 'Đang tải...' : (booking?.bookingCode || 'Chi tiết Booking')}
                        </Typography>
                        {!loading && booking && (
                            <Chip
                                label={bStatus.label}
                                color={bStatus.color}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        )}
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2, pb: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress sx={{ color: '#2b6f56' }} />
                    </Box>
                ) : !booking ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        Không tìm thấy thông tin booking.
                    </Typography>
                ) : (
                    <>
                        {/* ── THÔNG TIN TOUR ── */}
                        <SectionTitle icon={<TourIcon />} title="Thông tin Tour" />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <InfoRow label="Mã tour" value={tour?.code} />
                                <InfoRow label="Tên tour" value={tour?.name?.vi || tour?.name?.en} />
                                <InfoRow label="Thời gian" value={tour?.durationDays ? `${tour.durationDays} ngày` : undefined} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoRow label="Ngày khởi hành" value={fmt(schedule?.startDate)} />
                                <InfoRow label="Ngày kết thúc" value={fmt(schedule?.endDate)} />
                                <InfoRow label="Số khách" value={`${booking.totalGuests} người`} />
                            </Grid>
                        </Grid>

                        {resolvedTourCode && (
                            <Box sx={{ mt: 1 }}>
                                <Button
                                    component={Link}
                                    to={`/tour/${resolvedTourCode}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="small"
                                    variant="outlined"
                                    endIcon={<OpenInNewIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        borderColor: '#2b6f56',
                                        color: '#2b6f56',
                                        '&:hover': { borderColor: '#1a4a39', bgcolor: 'rgba(43,111,86,0.05)' },
                                    }}
                                >
                                    Xem trang Tour
                                </Button>
                            </Box>
                        )}

                        {/* ── THÔNG TIN LIÊN HỆ ── */}
                        <SectionTitle icon={<ContactPhoneIcon />} title="Thông tin liên hệ" />
                        <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <InfoRow label="Họ tên" value={contact?.fullName} />
                                    <InfoRow label="Email" value={contact?.email} />
                                    <InfoRow label="SĐT" value={contact?.phone} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoRow label="Kênh liên hệ" value={contact?.contactMethod} />
                                    <InfoRow label="Địa chỉ" value={contact?.address} />
                                    <InfoRow
                                        label="Tổng tiền"
                                        value={
                                            <Typography component="span" fontWeight={700} color="success.dark" fontSize={14}>
                                                {fmtMoney(booking.totalPrice)}
                                            </Typography>
                                        }
                                    />
                                </Grid>
                            </Grid>
                            {contact?.specialRequest && (
                                <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #ddd' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.3 }}>
                                        Yêu cầu đặc biệt:
                                    </Typography>
                                    <Typography variant="body2" fontStyle="italic">
                                        {contact.specialRequest}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* ── DANH SÁCH HÀNH KHÁCH ── */}
                        <SectionTitle
                            icon={<GroupIcon />}
                            title={`Hành khách (${participants.length})`}
                        />
                        {participants.length === 0 ? (
                            <Typography color="text.secondary" fontSize={14}>
                                Chưa có thông tin hành khách.
                            </Typography>
                        ) : (
                            <TableContainer sx={{ border: '1px solid #eee', borderRadius: 2 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Họ tên</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Ngày sinh</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>GT</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>CCCD / Hộ chiếu</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Quốc tịch</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Thể lực</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Bơi lội</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Ăn kiêng</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {participants.map((p, i) => (
                                            <TableRow key={p._id} hover>
                                                <TableCell>
                                                    <Box sx={{
                                                        width: 22, height: 22, borderRadius: '50%',
                                                        bgcolor: '#2b6f56', color: '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 11, fontWeight: 700,
                                                    }}>
                                                        {i + 1}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <PersonIcon sx={{ fontSize: 15, color: '#888' }} />
                                                        <Typography variant="body2" fontWeight={600}>{p.fullName}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{fmt(p.dob)}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{GENDER_LABEL[p.gender] || p.gender}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontFamily="monospace">{p.passportOrId}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{p.nationality}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={p.healthSurvey?.fitnessLevel || '—'}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: 11, height: 20 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontSize={12}>
                                                        {p.healthSurvey?.swimmingAbility || '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontSize={12}>
                                                        {p.preferences?.dietaryPreference || '—'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Bệnh lý / dị ứng đặc biệt */}
                        {participants.some(p => p.healthSurvey?.medicalConditions || p.preferences?.allergies) && (
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe082' }}>
                                <Typography variant="body2" fontWeight={700} color="warning.dark" sx={{ mb: 1 }}>
                                    ⚠ Lưu ý sức khỏe / dị ứng
                                </Typography>
                                {participants.map((p) => {
                                    const notes = [
                                        p.healthSurvey?.medicalConditions && `Bệnh lý: ${p.healthSurvey.medicalConditions}`,
                                        p.preferences?.allergies && `Dị ứng: ${p.preferences.allergies}`,
                                    ].filter(Boolean);
                                    if (!notes.length) return null;
                                    return (
                                        <Box key={p._id} sx={{ mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight={600} component="span">{p.fullName}: </Typography>
                                            <Typography variant="body2" component="span" color="text.secondary">
                                                {notes.join(' | ')}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
