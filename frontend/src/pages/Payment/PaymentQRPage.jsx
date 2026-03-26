import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { getPaymentInfoByBookingCode } from '../../services/bookingApi';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:9999';

export default function PaymentQRPage() {
    const { bookingCode } = useParams();
    const navigate = useNavigate();
    const socketRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [info, setInfo] = useState(null);

    const normalizedCode = useMemo(() => String(bookingCode || '').trim().toUpperCase(), [bookingCode]);

    const paymentStatus = info?.paymentRequest?.status || 'none';
    const canShowQr = info?.status === 'CONFIRMED' && paymentStatus === 'requested';

    const qrImgUrl = useMemo(() => {
        if (!info?.bankAccount || !info?.bankName || !info?.totalPrice || !info?.bookingCode) return '';
        const acc = encodeURIComponent(info.bankAccount);
        const bank = encodeURIComponent(info.bankName);
        const amount = encodeURIComponent(info.totalPrice);
        const des = encodeURIComponent(info.bookingCode);
        return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}&template=compact`;
    }, [info]);

    useEffect(() => {
        let mounted = true;
        if (!normalizedCode) {
            setError('Thiếu mã booking');
            setLoading(false);
            return;
        }

        const fetchInfo = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getPaymentInfoByBookingCode(normalizedCode);
                if (!mounted) return;
                if (res?.success) {
                    setInfo(res.data);
                } else {
                    setError(res?.message || 'Không thể tải thông tin thanh toán');
                }
            } catch (e) {
                if (!mounted) return;
                setError(e?.response?.data?.message || e?.message || 'Không thể tải thông tin thanh toán');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchInfo();
        return () => { mounted = false; };
    }, [normalizedCode]);

    useEffect(() => {
        if (!normalizedCode) return;
        if (!canShowQr) return;

        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join-booking-room', normalizedCode);
        });

        socket.on('paymentSuccess', (data) => {
            const code = String(data?.bookingCode || '').trim().toUpperCase();
            if (code && code !== normalizedCode) return;

            toast.success('Thanh toán thành công');
            setInfo((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    paymentRequest: {
                        ...(prev.paymentRequest || {}),
                        status: 'paid',
                        paidAt: data?.paidAt || new Date().toISOString(),
                        paidAmount: data?.amount ?? prev.totalPrice,
                    },
                };
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [normalizedCode, canShowQr]);

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                <Card sx={{ maxWidth: 520, width: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">Đang tải thông tin thanh toán...</Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                <Card sx={{ maxWidth: 520, width: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Không thể mở trang thanh toán</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{error}</Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 700 }}
                            onClick={() => navigate('/')}
                        >
                            Về trang chủ
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 6, bgcolor: 'background.default' }}>
            <Card sx={{ maxWidth: 520, width: '100%' }}>
                <CardContent>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Thanh toán booking</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Mã booking: <b>{info?.bookingCode}</b>
                    </Typography>

                    {paymentStatus === 'paid' ? (
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200', mb: 2 }}>
                            <Typography fontWeight={800} color="success.dark">Đã thanh toán</Typography>
                            <Typography variant="body2" color="success.dark">Hệ thống đã ghi nhận thanh toán thành công.</Typography>
                        </Box>
                    ) : canShowQr ? (
                        <>
                            <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2, textAlign: 'center' }}>
                                {qrImgUrl ? (
                                    <img
                                        src={qrImgUrl}
                                        alt="SePay QR"
                                        style={{ width: '100%', maxWidth: 260, borderRadius: 12 }}
                                    />
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Không có dữ liệu QR</Typography>
                                )}
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    Nội dung chuyển khoản: <b>{info?.bookingCode}</b>
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Số tiền: <b>{Number(info?.totalPrice || 0).toLocaleString('vi-VN')}₫</b>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Ngân hàng: <b>{info?.bankName}</b>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                STK: <b>{info?.bankAccount}</b>
                            </Typography>

                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                                <Typography variant="body2" color="info.dark" fontWeight={700}>
                                    Đang chờ thanh toán...
                                </Typography>
                                <Typography variant="caption" color="info.dark">
                                    Quét QR và chuyển khoản đúng nội dung để hệ thống tự động xác nhận.
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                            <Typography fontWeight={800} color="warning.dark">Chưa sẵn sàng thanh toán</Typography>
                            <Typography variant="body2" color="warning.dark">
                                {info?.status !== 'CONFIRMED'
                                    ? 'Booking chưa được xác nhận chốt tour.'
                                    : 'Booking chưa có yêu cầu thanh toán.'}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
