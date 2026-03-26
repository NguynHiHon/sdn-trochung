import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getCertificateByCodePublic } from '../../services/certificateApi';
import CertificateTemplate from '../../components/certificate/CertificateTemplate';
import html2canvas from 'html2canvas';

export default function CertificateLookupPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCode = useMemo(() => (searchParams.get('code') || '').trim(), [searchParams]);

    const [code, setCode] = useState(initialCode);
    const [loading, setLoading] = useState(false);
    const [cert, setCert] = useState(null);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);

    const certRef = useRef(null);

    const fetchCert = async (nextCode) => {
        const normalized = String(nextCode || '').trim();
        if (!normalized) {
            setCert(null);
            setError('Vui lòng nhập mã chứng chỉ');
            return;
        }

        setLoading(true);
        setError('');
        setCert(null);
        try {
            const res = await getCertificateByCodePublic(normalized);
            if (res?.success) {
                setCert(res.data);
            } else {
                setError(res?.message || 'Không tìm thấy chứng chỉ');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Không thể tra cứu chứng chỉ';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialCode) {
            fetchCert(initialCode);
        }
    }, [initialCode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const normalized = String(code || '').trim();
        setSearchParams(normalized ? { code: normalized } : {});
        fetchCert(normalized);
    };

    const handleDownloadImage = async () => {
        if (!cert) return;
        const el = certRef.current;
        if (!el) {
            toast.error('Không thể tải ảnh lúc này');
            return;
        }

        setDownloading(true);
        try {
            const canvas = await html2canvas(el, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
            });
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${cert.certificateCode || 'certificate'}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            const msg = err?.message || 'Không thể tạo ảnh chứng chỉ';
            toast.error(msg);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 980, mx: 'auto', px: 2, py: 4 }}>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                Tra cứu chứng chỉ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nhập mã chứng chỉ (ví dụ: CERT-2026-ABC123) để kiểm tra thông tin.
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                        label="Mã chứng chỉ"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        size="small"
                        sx={{ flex: 1, minWidth: 280 }}
                        placeholder="CERT-2026-XXXXXX"
                    />
                    <Button type="submit" variant="contained" disabled={loading}>
                        Tra cứu
                    </Button>
                </Box>
                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}
            </Paper>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && cert && (
                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleDownloadImage}
                            disabled={downloading}
                        >
                            {downloading ? 'Đang tạo ảnh…' : 'Tải ảnh chứng chỉ'}
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box ref={certRef} sx={{ width: '100%', maxWidth: 860 }}>
                            <CertificateTemplate cert={cert} />
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}
