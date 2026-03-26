import React from 'react';
import { Box, Typography } from '@mui/material';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

export default function CertificateTemplate({ cert }) {
    if (!cert) return null;

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
            {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(
                ([v, h]) => (
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
                )
            )}

            <Typography
                sx={{
                    fontSize: 13,
                    letterSpacing: 4,
                    color: '#888',
                    textTransform: 'uppercase',
                    mb: 1,
                }}
            >
                Trung tâm Du lịch Phiêu Lưu
            </Typography>

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

            <Box
                sx={{
                    width: 80,
                    height: 3,
                    bgcolor: '#c9a227',
                    mx: 'auto',
                    mb: 3,
                    borderRadius: 2,
                }}
            />

            <Typography sx={{ fontSize: 15, color: '#555', mb: 1 }}>
                Trân trọng chứng nhận
            </Typography>

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

            <Typography
                sx={{
                    fontSize: { xs: 18, sm: 22 },
                    fontWeight: 700,
                    color: '#2b6f56',
                    mb: 0.5,
                }}
            >
                {cert.tourName}
            </Typography>

            <Typography sx={{ fontSize: 14, color: '#777', mb: 3 }}>
                Từ {fmt(cert.startDate)} đến {fmt(cert.endDate)}
            </Typography>

            <Box sx={{ width: 60, height: 2, bgcolor: '#e0e0e0', mx: 'auto', mb: 3 }} />

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    mt: 1,
                }}
            >
                <Box sx={{ textAlign: 'left' }}>
                    <Typography
                        sx={{
                            fontSize: 11,
                            color: '#aaa',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
                        Mã chứng chỉ
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#444',
                            letterSpacing: 2,
                            fontFamily: 'monospace',
                        }}
                    >
                        {cert.certificateCode}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography
                        sx={{
                            fontSize: 11,
                            color: '#aaa',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
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
