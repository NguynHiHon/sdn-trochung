import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Button, TextField, MenuItem, Paper,
    Stepper, Step, StepLabel, CircularProgress, Divider, Chip,
    FormControl, InputLabel, Select, Radio, RadioGroup, FormControlLabel,
    FormLabel, IconButton, Alert
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTourById } from '../services/tourApi';
import { getAllSchedules } from '../services/scheduleApi';
import { holdBooking } from '../services/bookingApi';
import { toast } from 'sonner';
import AvailabilityCalendar from '../components/common/AvailabilityCalendar';

const STEPS_VI = ['Chọn ngày & Số khách', 'Thông tin & Khảo sát', 'Xác nhận & Gửi'];
const STEPS_EN = ['Select Date & Guests', 'Info & Survey', 'Confirm & Submit'];

const emptyParticipant = () => ({
    fullName: '', dob: '', gender: 'Male', passportOrId: '', nationality: 'Vietnam',
    email: '', phone: '', contactMethod: 'Zalo',
    healthSurvey: {
        medicalConditions: '',
        exerciseFrequency: 'None',
        trekkingExperience: 'Never',
        fitnessLevel: 'Average',
        swimmingAbility: 'Cannot swim',
    },
    preferences: {
        allergies: '',
        dietaryPreference: 'None',
        accommodationOption: 'None',
        tentPreference: 'None',
    }
});

export default function TourBookingPage() {
    const { code } = useParams();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'vi';

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [success, setSuccess] = useState(null);

    // Step 1
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [totalGuests, setTotalGuests] = useState(1);

    // Step 2
    const [contactInfo, setContactInfo] = useState({
        fullName: '', email: '', phone: '', address: '', specialRequest: '',
        contactMethod: 'Zalo',
    });
    const [participants, setParticipants] = useState([emptyParticipant()]);

    useEffect(() => {
        getTourById(code)
            .then(res => { if (res.success) setTour(res.data); })
            .catch(() => toast.error('Lỗi tải tour'))
            .finally(() => setLoading(false));
    }, [code]);

    // When tour loads, fetch schedules for current month
    useEffect(() => {
        if (!tour) return;
        const now = new Date();
        getAllSchedules({ tourId: tour._id, month: now.getMonth() + 1, year: now.getFullYear(), limit: 50 })
            .then(res => { if (res.success) setSchedules(res.data); });
    }, [tour]);

    // Keep participants array in sync with totalGuests
    useEffect(() => {
        setParticipants(prev => {
            if (totalGuests > prev.length) {
                return [...prev, ...Array(totalGuests - prev.length).fill(null).map(() => emptyParticipant())];
            }
            return prev.slice(0, totalGuests);
        });
    }, [totalGuests]);

    const updateContact = (field, value) => setContactInfo(prev => ({ ...prev, [field]: value }));
    const updateParticipant = (idx, field, value) => setParticipants(prev => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], [field]: value };
        return copy;
    });
    const updateHealth = (idx, field, value) => setParticipants(prev => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], healthSurvey: { ...copy[idx].healthSurvey, [field]: value } };
        return copy;
    });
    const updatePref = (idx, field, value) => setParticipants(prev => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], preferences: { ...copy[idx].preferences, [field]: value } };
        return copy;
    });

    const handleCalendarSelect = (info) => {
        const found = schedules.find(s => s._id === info.id);
        if (found) setSelectedSchedule(found);
        else {
            setSelectedSchedule({
                _id: info.id,
                startDate: info.startDate,
                capacity: info.capacity,
                remaining: info.remaining
            });
        }
    };

    const canGoStep2 = selectedSchedule && totalGuests >= 1;
    const canGoStep3 = contactInfo.fullName && contactInfo.email && contactInfo.phone &&
        participants.every(p => p.fullName && p.dob && p.passportOrId);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                tourId: tour._id,
                scheduleId: selectedSchedule._id,
                totalGuests,
                totalPrice: (tour.priceVND || 0) * totalGuests,
                contactInfo: {
                    fullName: contactInfo.fullName,
                    email: contactInfo.email,
                    phone: contactInfo.phone,
                    contactMethod: contactInfo.contactMethod || 'Zalo',
                    address: contactInfo.address,
                    specialRequest: contactInfo.specialRequest,
                },
                participants: participants.map(p => ({
                    fullName: p.fullName,
                    dob: p.dob,
                    gender: p.gender,
                    passportOrId: p.passportOrId,
                    nationality: p.nationality,
                    email: p.email,
                    phone: p.phone,
                    contactMethod: p.contactMethod,
                    healthSurvey: p.healthSurvey,
                    preferences: p.preferences,
                }))
            };
            const res = await holdBooking(payload);
            if (res.success) {
                setSuccess(res.data);
            } else {
                toast.error(res.message || 'Lỗi khi đặt tour');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Lỗi khi đặt tour');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress sx={{ color: '#2b6f56' }} /></Box>;
    if (!tour) return <Container sx={{ py: 15, textAlign: 'center' }}><Typography variant="h5">Tour not found</Typography></Container>;

    const steps = lang === 'vi' ? STEPS_VI : STEPS_EN;
    const scheduleDate = selectedSchedule ? new Date(selectedSchedule.startDate).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

    // ── SUCCESS SCREEN ──
    if (success) return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={0} sx={{ maxWidth: 560, mx: 'auto', p: 6, borderRadius: 4, textAlign: 'center', border: '1px solid #d6e8de' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 72, color: '#2b6f56', mb: 2 }} />
                <Typography variant="h4" fontWeight={800} color="#1b3a2d" mb={1}>
                    {lang === 'vi' ? 'Đã gửi đơn thành công!' : 'Booking Submitted!'}
                </Typography>
                <Typography color="#666" mb={3} lineHeight={1.8}>
                    {lang === 'vi'
                        ? 'Đơn đặt tour của bạn đã được ghi nhận. Nhân viên tư vấn sẽ liên hệ bạn trong vòng 24 giờ để xác nhận và hướng dẫn thanh toán.'
                        : 'Your booking request has been received. Our team will contact you within 24 hours to confirm and provide payment instructions.'}
                </Typography>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ textAlign: 'left', bgcolor: '#f0faf5', p: 3, borderRadius: 2, mb: 3 }}>
                    <Typography variant="body2" color="#888" mb={1}>Booking Code</Typography>
                    <Typography variant="h5" fontWeight={800} color="#2b6f56" mb={2}>{success.bookingCode}</Typography>
                    <Typography variant="body2"><strong>Tour:</strong> {tour.name[lang]}</Typography>
                    <Typography variant="body2"><strong>{lang === 'vi' ? 'Ngày khởi hành' : 'Departure'}:</strong> {scheduleDate}</Typography>
                    <Typography variant="body2"><strong>{lang === 'vi' ? 'Số khách' : 'Guests'}:</strong> {success.totalGuests}</Typography>
                    <Typography variant="body2"><strong>{lang === 'vi' ? 'Tổng tiền' : 'Total'}:</strong> {success.totalPrice?.toLocaleString('vi-VN')}₫</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button variant="outlined" onClick={() => navigate(`/tour/${code}`)} sx={{ borderColor: '#2b6f56', color: '#2b6f56' }}>
                        ← {lang === 'vi' ? 'Về trang Tour' : 'Back to Tour'}
                    </Button>
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: '#2b6f56', '&:hover': { bgcolor: '#1a5a3e' } }}>
                        {lang === 'vi' ? 'Về Trang Chủ' : 'Home'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f5f0' }}>
            {/* Header */}
            <Box sx={{ bgcolor: '#1b3a2d', color: 'white', py: 4 }}>
                <Container maxWidth="lg">
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/tour/${code}`)}
                        sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', mb: 2 }}>
                        ← {tour.name[lang]}
                    </Button>
                    <Typography variant="h4" fontWeight={800}>{lang === 'vi' ? 'Đặt Tour' : 'Book Tour'}</Typography>
                    <Typography color="rgba(255,255,255,0.65)" mt={0.5}>{tour.name[lang]}</Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 5 }}>
                {/* Stepper */}
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
                    {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                <Grid container spacing={5}>
                    {/* Main */}
                    <Grid item xs={12} md={8}>
                        {/* ═══ STEP 1 ═══ */}
                        {activeStep === 0 && (
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2ddd3' }}>
                                <Typography variant="h6" fontWeight={700} color="#1b3a2d" mb={3}>
                                    {lang === 'vi' ? '📅 Chọn ngày khởi hành' : '📅 Select Departure Date'}
                                </Typography>
                                <AvailabilityCalendar tourId={tour._id} lang={lang} onSelectDate={handleCalendarSelect} />

                                {selectedSchedule && (
                                    <Alert severity="success" sx={{ mt: 3 }}>
                                        {lang === 'vi' ? 'Đã chọn ngày: ' : 'Selected: '}<strong>{scheduleDate}</strong>
                                    </Alert>
                                )}

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="h6" fontWeight={700} color="#1b3a2d" mb={2}>
                                    {lang === 'vi' ? '👥 Số lượng khách' : '👥 Number of Guests'}
                                </Typography>
                                <TextField type="number" size="small" value={totalGuests}
                                    onChange={e => setTotalGuests(Math.max(1, parseInt(e.target.value) || 1))}
                                    inputProps={{ min: 1, max: selectedSchedule?.remaining || 20 }}
                                    sx={{ width: 160 }}
                                    label={lang === 'vi' ? 'Số khách' : 'Guests'} />
                            </Paper>
                        )}

                        {/* ═══ STEP 2 ═══ */}
                        {activeStep === 1 && (
                            <Box>
                                {/* Contact Info */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2ddd3', mb: 4 }}>
                                    <Typography variant="h6" fontWeight={700} color="#1b3a2d" mb={3}>
                                        {lang === 'vi' ? '📋 Thông tin người đặt' : '📋 Booker Information'}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth required label={lang === 'vi' ? 'Họ và tên' : 'Full Name'}
                                                value={contactInfo.fullName} onChange={e => updateContact('fullName', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth required label="Email" type="email"
                                                value={contactInfo.email} onChange={e => updateContact('email', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField fullWidth required label={lang === 'vi' ? 'Số điện thoại' : 'Phone'}
                                                value={contactInfo.phone} onChange={e => updateContact('phone', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField fullWidth label={lang === 'vi' ? 'Địa chỉ' : 'Address'}
                                                value={contactInfo.address} onChange={e => updateContact('address', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth>
                                                <InputLabel>{lang === 'vi' ? 'Liên lạc qua' : 'Contact via'}</InputLabel>
                                                <Select value={contactInfo.contactMethod} label={lang === 'vi' ? 'Liên lạc qua' : 'Contact via'}
                                                    onChange={e => updateContact('contactMethod', e.target.value)}>
                                                    {['Zalo', 'Viber', 'Email', 'WhatsApp', 'Phone'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth multiline rows={2} label={lang === 'vi' ? 'Yêu cầu đặc biệt' : 'Special Request'}
                                                value={contactInfo.specialRequest} onChange={e => updateContact('specialRequest', e.target.value)} />
                                        </Grid>
                                    </Grid>
                                </Paper>

                                {/* Each Participant */}
                                {participants.map((p, idx) => (
                                    <Paper key={idx} elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2ddd3', mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                            <PersonAddIcon sx={{ color: '#2b6f56' }} />
                                            <Typography variant="h6" fontWeight={700} color="#1b3a2d">
                                                {lang === 'vi' ? `Khách ${idx + 1}` : `Guest ${idx + 1}`} / {totalGuests}
                                            </Typography>
                                        </Box>

                                        {/* Basic Info */}
                                        <Typography variant="subtitle2" color="#888" fontWeight={600} mb={1.5}>
                                            {lang === 'vi' ? 'Thông tin cá nhân' : 'Personal Info'}
                                        </Typography>
                                        <Grid container spacing={2} sx={{ mb: 3 }}>
                                            <Grid item xs={12} md={4}>
                                                <TextField fullWidth required size="small" label={lang === 'vi' ? 'Họ tên' : 'Full Name'}
                                                    value={p.fullName} onChange={e => updateParticipant(idx, 'fullName', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField fullWidth required size="small" type="date" label={lang === 'vi' ? 'Ngày sinh' : 'Date of Birth'}
                                                    InputLabelProps={{ shrink: true }}
                                                    value={p.dob} onChange={e => updateParticipant(idx, 'dob', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={6} md={2}>
                                                <TextField fullWidth select size="small" label={lang === 'vi' ? 'Giới tính' : 'Gender'}
                                                    value={p.gender} onChange={e => updateParticipant(idx, 'gender', e.target.value)}>
                                                    <MenuItem value="Male">{lang === 'vi' ? 'Nam' : 'Male'}</MenuItem>
                                                    <MenuItem value="Female">{lang === 'vi' ? 'Nữ' : 'Female'}</MenuItem>
                                                    <MenuItem value="Other">{lang === 'vi' ? 'Khác' : 'Other'}</MenuItem>
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={6} md={6}>
                                                <TextField fullWidth required size="small" label="CMND / Passport"
                                                    value={p.passportOrId} onChange={e => updateParticipant(idx, 'passportOrId', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField fullWidth size="small" label={lang === 'vi' ? 'Quốc tịch' : 'Nationality'}
                                                    value={p.nationality} onChange={e => updateParticipant(idx, 'nationality', e.target.value)} />
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        {/* Health Survey */}
                                        <Typography variant="subtitle2" color="#e74c3c" fontWeight={700} mb={2}>
                                            🏥 {lang === 'vi' ? 'Khảo sát Sức khỏe' : 'Health Survey'}
                                        </Typography>

                                        <Box sx={{ mb: 2.5 }}>
                                            <TextField fullWidth size="small" multiline rows={2}
                                                label={lang === 'vi' ? 'Bệnh lý nền / tiền sử bệnh (nếu có)' : 'Medical Conditions / History (if any)'}
                                                placeholder={lang === 'vi' ? 'Ví dụ: hen suyễn, tim mạch, đau khớp...' : 'E.g. asthma, heart issues, joint pain...'}
                                                value={p.healthSurvey.medicalConditions}
                                                onChange={e => updateHealth(idx, 'medicalConditions', e.target.value)} />
                                        </Box>

                                        <FormControl sx={{ mb: 2.5, display: 'block' }}>
                                            <FormLabel sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1b3a2d', mb: 0.5 }}>
                                                {lang === 'vi' ? 'Bạn vận động / tập thể dục thường xuyên không?' : 'How often do you exercise?'}
                                            </FormLabel>
                                            <RadioGroup value={p.healthSurvey.exerciseFrequency} onChange={e => updateHealth(idx, 'exerciseFrequency', e.target.value)}>
                                                {[
                                                    { v: 'None', vi: 'Không bao giờ / Rất ít', en: 'None / Rarely' },
                                                    { v: '1-2 times/week', vi: '1-2 lần / tuần', en: '1-2 times/week' },
                                                    { v: '3-4 times/week', vi: '3-4 lần / tuần', en: '3-4 times/week' },
                                                    { v: '5+ times/week', vi: '5+ lần / tuần', en: '5+ times/week' },
                                                ].map(o => <FormControlLabel key={o.v} value={o.v} control={<Radio size="small" />} label={lang === 'vi' ? o.vi : o.en} sx={{ '& .MuiTypography-root': { fontSize: '0.88rem' } }} />)}
                                            </RadioGroup>
                                        </FormControl>

                                        <FormControl sx={{ mb: 2.5, display: 'block' }}>
                                            <FormLabel sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1b3a2d', mb: 0.5 }}>
                                                {lang === 'vi' ? 'Bạn đã từng tham gia trekking / leo núi chưa?' : 'Trekking / hiking experience?'}
                                            </FormLabel>
                                            <RadioGroup value={p.healthSurvey.trekkingExperience} onChange={e => updateHealth(idx, 'trekkingExperience', e.target.value)}>
                                                {[
                                                    { v: 'Never', vi: 'Chưa bao giờ', en: 'Never' },
                                                    { v: 'Beginner', vi: 'Mới bắt đầu (1-2 lần)', en: 'Beginner (1-2 times)' },
                                                    { v: 'Intermediate', vi: 'Trung bình (vài lần)', en: 'Intermediate (several times)' },
                                                    { v: 'Advanced', vi: 'Có kinh nghiệm nhiều', en: 'Advanced (experienced)' },
                                                ].map(o => <FormControlLabel key={o.v} value={o.v} control={<Radio size="small" />} label={lang === 'vi' ? o.vi : o.en} sx={{ '& .MuiTypography-root': { fontSize: '0.88rem' } }} />)}
                                            </RadioGroup>
                                        </FormControl>

                                        <FormControl sx={{ mb: 2.5, display: 'block' }}>
                                            <FormLabel sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1b3a2d', mb: 0.5 }}>
                                                {lang === 'vi' ? 'Tự đánh giá mức thể lực của bạn?' : 'How would you rate your fitness level?'}
                                            </FormLabel>
                                            <RadioGroup row value={p.healthSurvey.fitnessLevel} onChange={e => updateHealth(idx, 'fitnessLevel', e.target.value)}>
                                                {[
                                                    { v: 'Average', vi: 'Trung bình', en: 'Average' },
                                                    { v: 'Good', vi: 'Tốt', en: 'Good' },
                                                    { v: 'Excellent', vi: 'Rất tốt', en: 'Excellent' },
                                                ].map(o => <FormControlLabel key={o.v} value={o.v} control={<Radio size="small" />} label={lang === 'vi' ? o.vi : o.en} sx={{ '& .MuiTypography-root': { fontSize: '0.88rem' } }} />)}
                                            </RadioGroup>
                                        </FormControl>

                                        <FormControl sx={{ mb: 2.5, display: 'block' }}>
                                            <FormLabel sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1b3a2d', mb: 0.5 }}>
                                                {lang === 'vi' ? 'Khả năng bơi lội?' : 'Swimming ability?'}
                                            </FormLabel>
                                            <RadioGroup row value={p.healthSurvey.swimmingAbility} onChange={e => updateHealth(idx, 'swimmingAbility', e.target.value)}>
                                                {[
                                                    { v: 'Cannot swim', vi: 'Không biết bơi', en: 'Cannot swim' },
                                                    { v: 'Basic', vi: 'Bơi cơ bản', en: 'Basic' },
                                                    { v: 'Good', vi: 'Bơi tốt', en: 'Good' },
                                                ].map(o => <FormControlLabel key={o.v} value={o.v} control={<Radio size="small" />} label={lang === 'vi' ? o.vi : o.en} sx={{ '& .MuiTypography-root': { fontSize: '0.88rem' } }} />)}
                                            </RadioGroup>
                                        </FormControl>

                                        <Divider sx={{ my: 2 }} />

                                        {/* Preferences */}
                                        <Typography variant="subtitle2" color="#2b6f56" fontWeight={700} mb={2}>
                                            🎒 {lang === 'vi' ? 'Tùy chọn & Sở thích' : 'Preferences & Options'}
                                        </Typography>

                                        <Box sx={{ mb: 2.5 }}>
                                            <TextField fullWidth size="small"
                                                label={lang === 'vi' ? 'Dị ứng (thực phẩm / côn trùng / thời tiết)' : 'Allergies (food / insects / weather)'}
                                                placeholder={lang === 'vi' ? 'Ví dụ: dị ứng hải sản, phấn hoa...' : 'E.g. seafood allergy, pollen...'}
                                                value={p.preferences.allergies}
                                                onChange={e => updatePref(idx, 'allergies', e.target.value)} />
                                        </Box>

                                        <FormControl sx={{ mb: 2.5, display: 'block' }}>
                                            <FormLabel sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1b3a2d', mb: 0.5 }}>
                                                {lang === 'vi' ? 'Chế độ ăn uống?' : 'Dietary preference?'}
                                            </FormLabel>
                                            <RadioGroup value={p.preferences.dietaryPreference} onChange={e => updatePref(idx, 'dietaryPreference', e.target.value)}>
                                                {[
                                                    { v: 'None', vi: 'Bình thường (ăn tất cả)', en: 'Normal (eat everything)' },
                                                    { v: 'Vegetarian', vi: 'Ăn chay', en: 'Vegetarian' },
                                                    { v: 'Vegan', vi: 'Thuần chay (Vegan)', en: 'Vegan' },
                                                    { v: 'No Beef', vi: 'Không ăn bò', en: 'No Beef' },
                                                    { v: 'No Pork', vi: 'Không ăn heo', en: 'No Pork' },
                                                    { v: 'Gluten Free', vi: 'Không gluten', en: 'Gluten Free' },
                                                    { v: 'Other', vi: 'Khác', en: 'Other' },
                                                ].map(o => <FormControlLabel key={o.v} value={o.v} control={<Radio size="small" />} label={lang === 'vi' ? o.vi : o.en} sx={{ '& .MuiTypography-root': { fontSize: '0.88rem' } }} />)}
                                            </RadioGroup>
                                        </FormControl>

                                        <FormControl sx={{ mb: 2.5, display: 'block' }}>
                                            <FormLabel sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1b3a2d', mb: 0.5 }}>
                                                {lang === 'vi' ? 'Bạn muốn ở đâu?' : 'Accommodation preference?'}
                                            </FormLabel>
                                            <RadioGroup row value={p.preferences.accommodationOption} onChange={e => updatePref(idx, 'accommodationOption', e.target.value)}>
                                                {[
                                                    { v: 'None', vi: 'Chưa chọn', en: 'Not decided' },
                                                    { v: 'Hotel', vi: 'Khách sạn', en: 'Hotel' },
                                                    { v: 'Camping', vi: 'Cắm trại', en: 'Camping' },
                                                    { v: 'Homestay', vi: 'Homestay', en: 'Homestay' },
                                                ].map(o => <FormControlLabel key={o.v} value={o.v} control={<Radio size="small" />} label={lang === 'vi' ? o.vi : o.en} sx={{ '& .MuiTypography-root': { fontSize: '0.88rem' } }} />)}
                                            </RadioGroup>
                                        </FormControl>

                                        {p.preferences.accommodationOption === 'Camping' && (
                                            <FormControl sx={{ mb: 2, display: 'block' }}>
                                                <FormLabel sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1b3a2d', mb: 0.5 }}>
                                                    {lang === 'vi' ? 'Loại lều?' : 'Tent preference?'}
                                                </FormLabel>
                                                <RadioGroup row value={p.preferences.tentPreference} onChange={e => updatePref(idx, 'tentPreference', e.target.value)}>
                                                    {[
                                                        { v: 'None', vi: 'Chưa chọn', en: 'Not decided' },
                                                        { v: 'Single', vi: 'Lều riêng', en: 'Single tent' },
                                                        { v: 'Shared', vi: 'Lều chung', en: 'Shared tent' },
                                                    ].map(o => <FormControlLabel key={o.v} value={o.v} control={<Radio size="small" />} label={lang === 'vi' ? o.vi : o.en} sx={{ '& .MuiTypography-root': { fontSize: '0.88rem' } }} />)}
                                                </RadioGroup>
                                            </FormControl>
                                        )}
                                    </Paper>
                                ))}
                            </Box>
                        )}

                        {/* ═══ STEP 3 ═══ */}
                        {activeStep === 2 && (
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2ddd3' }}>
                                <Typography variant="h6" fontWeight={700} color="#1b3a2d" mb={3}>
                                    ✅ {lang === 'vi' ? 'Xác nhận thông tin' : 'Review & Confirm'}
                                </Typography>

                                <Box sx={{ bgcolor: '#f0faf5', p: 3, borderRadius: 2, mb: 3 }}>
                                    <Typography fontWeight={700} color="#2b6f56" mb={1}>{tour.name[lang]}</Typography>
                                    <Typography variant="body2"><strong>{lang === 'vi' ? 'Ngày khởi hành' : 'Departure'}:</strong> {scheduleDate}</Typography>
                                    <Typography variant="body2"><strong>{lang === 'vi' ? 'Số khách' : 'Guests'}:</strong> {totalGuests}</Typography>
                                    <Typography variant="body2"><strong>{lang === 'vi' ? 'Tổng tiền tạm tính' : 'Estimated Total'}:</strong> {((tour.priceVND || 0) * totalGuests).toLocaleString('vi-VN')}₫</Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>{lang === 'vi' ? 'Người đặt' : 'Booker'}</Typography>
                                <Typography variant="body2">{contactInfo.fullName} — {contactInfo.email} — {contactInfo.phone}</Typography>
                                <Typography variant="body2">{lang === 'vi' ? 'Liên lạc qua' : 'Contact via'}: {contactInfo.contactMethod}</Typography>

                                {participants.map((p, idx) => (
                                    <Box key={idx} sx={{ mt: 3, p: 2, bgcolor: '#faf8f4', borderRadius: 2, border: '1px solid #e8e0d5' }}>
                                        <Typography fontWeight={700} color="#1b3a2d" mb={0.5}>
                                            {lang === 'vi' ? `Khách ${idx + 1}` : `Guest ${idx + 1}`}: {p.fullName}
                                        </Typography>
                                        <Typography variant="body2" color="#666">
                                            {lang === 'vi' ? 'Sinh' : 'DOB'}: {p.dob} | {p.gender} | {p.nationality} | {p.passportOrId}
                                        </Typography>
                                        {p.healthSurvey.medicalConditions && (
                                            <Typography variant="body2" color="#e74c3c">
                                                ⚠ {lang === 'vi' ? 'Bệnh lý' : 'Medical'}: {p.healthSurvey.medicalConditions}
                                            </Typography>
                                        )}
                                        {p.preferences.allergies && (
                                            <Typography variant="body2" color="#e74c3c">
                                                ⚠ {lang === 'vi' ? 'Dị ứng' : 'Allergies'}: {p.preferences.allergies}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" color="#888">
                                            {lang === 'vi' ? 'Ăn' : 'Diet'}: {p.preferences.dietaryPreference} | {lang === 'vi' ? 'Ở' : 'Accommodation'}: {p.preferences.accommodationOption}
                                        </Typography>
                                    </Box>
                                ))}

                                <Alert severity="info" sx={{ mt: 3 }}>
                                    {lang === 'vi'
                                        ? '💬 Sau khi gửi đơn, nhân viên tư vấn sẽ liên hệ bạn trong vòng 24 giờ để xác nhận và hướng dẫn thanh toán. Không cần thanh toán ngay.'
                                        : '💬 After submitting, our team will contact you within 24 hours to confirm and provide payment instructions. No payment required now.'}
                                </Alert>
                            </Paper>
                        )}

                        {/* Navigation Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button variant="outlined" disabled={activeStep === 0}
                                onClick={() => setActiveStep(s => s - 1)}
                                startIcon={<ArrowBackIcon />}
                                sx={{ borderColor: '#2b6f56', color: '#2b6f56' }}>
                                {lang === 'vi' ? 'Quay lại' : 'Back'}
                            </Button>

                            {activeStep < 2 ? (
                                <Button variant="contained"
                                    disabled={activeStep === 0 ? !canGoStep2 : !canGoStep3}
                                    onClick={() => setActiveStep(s => s + 1)}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{ bgcolor: '#2b6f56', '&:hover': { bgcolor: '#1a5a3e' } }}>
                                    {lang === 'vi' ? 'Tiếp tục' : 'Next'}
                                </Button>
                            ) : (
                                <Button variant="contained" disabled={submitting}
                                    onClick={handleSubmit}
                                    endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                                    sx={{ bgcolor: '#f55d14', px: 5, '&:hover': { bgcolor: '#d94e0c' } }}>
                                    {submitting
                                        ? (lang === 'vi' ? 'Đang gửi...' : 'Submitting...')
                                        : (lang === 'vi' ? 'GỬI ĐƠN ĐẶT TOUR' : 'SUBMIT BOOKING')}
                                </Button>
                            )}
                        </Box>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #d6e8de', overflow: 'hidden', position: 'sticky', top: 100 }}>
                            <Box sx={{ background: 'linear-gradient(135deg, #1a5a3e, #2b6f56)', p: 3, textAlign: 'center' }}>
                                <Typography fontWeight={800} color="white" fontSize="1.1rem">{tour.name[lang]}</Typography>
                                <Typography variant="h5" color="white" fontWeight={900} mt={0.5}>
                                    {tour.priceVND?.toLocaleString('vi-VN')}₫
                                </Typography>
                                <Typography color="rgba(255,255,255,0.6)" fontSize="0.8rem">{lang === 'vi' ? '/ người' : '/ person'}</Typography>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                {selectedSchedule && (
                                    <Box sx={{ mb: 2, p: 2, bgcolor: '#edf8f2', borderRadius: 2 }}>
                                        <Typography variant="body2" fontWeight={700} color="#2b6f56">📅 {scheduleDate}</Typography>
                                        <Typography variant="body2" color="#666">{totalGuests} {lang === 'vi' ? 'khách' : 'guests'}</Typography>
                                    </Box>
                                )}
                                <Divider sx={{ my: 1.5 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" color="#888">📅 {lang === 'vi' ? 'Thời lượng' : 'Duration'}</Typography>
                                    <Typography variant="body2" fontWeight={700}>{tour.durationDays} {lang === 'vi' ? 'ngày' : 'days'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="body2" color="#888">⚡ Level</Typography>
                                    <Typography variant="body2" fontWeight={700}>{tour.adventureLevel}/6</Typography>
                                </Box>
                                {totalGuests > 0 && (
                                    <>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                            <Typography variant="body2" fontWeight={700}>{lang === 'vi' ? 'Tạm tính' : 'Estimated'}</Typography>
                                            <Typography variant="body1" fontWeight={800} color="#f55d14">
                                                {((tour.priceVND || 0) * totalGuests).toLocaleString('vi-VN')}₫
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
