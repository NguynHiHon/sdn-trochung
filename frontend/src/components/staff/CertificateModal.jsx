import React, { useEffect, useState, useRef } from 'react';
import {
    Dialog, DialogContent, DialogActions, Button,
    CircularProgress, Typography, Box,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import { getCertificateByParticipant } from '../../services/certificateApi';

const fmt = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

export default function CertificateModal({ open, onClose, participantId, participantName }) {
    const [cert, setCert] = useState(null);
    const [loading, setLoading] = useState(false);
    const printRef = useRef(null);

    useEffect(() => {
        if (!open || !participantId) return;
        setCert(null);
        setLoading(true);
        getCertificateByParticipant(participantId)
            .then((res) => { if (res.success) setCert(res.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, participantId]);

    const handlePrint = () => {
        const content = printRef.current?.innerHTML;
        if (!content) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <!DOCTYPE html>
            <html><head>
            <meta charset="utf-8"/>
            <title>Chứng chỉ - ${participantName || ''}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Times New Roman', serif; background: #fff; padding: 20px; }
                @media print {
                    body { padding: 0; }
                    @page { margin: 15mm; }
                }
            </style>
            </head><body>${content}</body></html>
        `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent sx={{ p: 3, bgcolor: '#fafafa' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : !cert ? (
                    <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                        Không tìm thấy chứng chỉ
                    </Typography>
                ) : (
                    <div ref={printRef}>
                        <CertificateTemplate cert={cert} />
                    </div>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button startIcon={<CloseIcon />} onClick={onClose} color="inherit">
                    Đóng
                </Button>
                {cert && (
                    <Button
                        startIcon={<PrintIcon />}
                        variant="contained"
                        onClick={handlePrint}
                        sx={{ bgcolor: '#2b6f56', '&:hover': { bgcolor: '#22573f' } }}
                    >
                        In chứng chỉ
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

function CertificateTemplate({ cert }) {

    return (
        <Box
            sx={{
                border: '8px double #2b6f56',
                borderRadius: 3,
                p: { xs: 3, sm: 5 },
                textAlign: 'center',
                bgcolor: '#fff',
                position: 'relative',
                fontFamily: '"Times New Roman", serif',
            }}
        >
            {/* Corner decorations */}
            {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
                <Box
                    key={`${v}-${h}`}
                    sx={{
                        position: 'absolute',
                        [v]: 12,
                        [h]: 12,
                        width: 36,
                        height: 36,
                        border: '3px solid #2b6f56',
                        borderRadius: 1,
                    }}
                />
            ))}

            {/* Issuer */}
            <Typography sx={{ fontSize: 13, letterSpacing: 4, color: '#888', textTransform: 'uppercase', mb: 1 }}>
                Trung tâm Du lịch Phiêu Lưu
            </Typography>

            {/* Title */}
            <Typography
                sx={{
                    fontSize: { xs: 24, sm: 32 },
                    fontWeight: 700,
                    color: '#2b6f56',
                    textTransform: 'uppercase',
                    letterSpacing: 3,
                    mb: 0.5,
                }}
            >
                Chứng Chỉ Hoàn Thành
            </Typography>

            {/* Gold divider */}
            <Box sx={{ width: 80, height: 3, bgcolor: '#c9a227', mx: 'auto', mb: 3, borderRadius: 2 }} />

            <Typography sx={{ fontSize: 15, color: '#555', mb: 1 }}>Trân trọng chứng nhận</Typography>

            <Typography
                sx={{
                    fontSize: { xs: 22, sm: 30 },
                    fontWeight: 700,
                    color: '#1a1a1a',
                    fontStyle: 'italic',
                    mb: 1,
                    fontFamily: '"Georgia", serif',
                }}
            >
                {cert.participantName}
            </Typography>

            <Typography sx={{ fontSize: 15, color: '#555', mb: 0.5 }}>
                đã hoàn thành chuyến hành trình
            </Typography>

            <Typography sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 700, color: '#2b6f56', mb: 0.5 }}>
                {cert.tourName}
            </Typography>

            <Typography sx={{ fontSize: 14, color: '#777', mb: 3 }}>
                Từ {fmt(cert.startDate)} đến {fmt(cert.endDate)}
            </Typography>

            <Box sx={{ width: 60, height: 2, bgcolor: '#e0e0e0', mx: 'auto', mb: 3 }} />

            {/* Footer: cert code | issued date */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Mã chứng chỉ
                    </Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#444', letterSpacing: 2, fontFamily: 'monospace' }}>
                        {cert.certificateCode}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Ngày cấp
                    </Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#444' }}>
                        {fmt(cert.issuedAt)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
