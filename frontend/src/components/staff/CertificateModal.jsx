import React, { useEffect, useState, useRef } from 'react';
import {
    Dialog, DialogContent, DialogActions, Button,
    CircularProgress, Typography, Box,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import { getCertificateByParticipant } from '../../services/certificateApi';
import CertificateTemplate from '../certificate/CertificateTemplate';

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
            .catch(() => { })
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
