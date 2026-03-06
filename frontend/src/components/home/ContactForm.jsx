import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '../common/ImageWithFallback';

// Simple contact form (no backend submission)
const ContactForm = () => {
    const { t } = useTranslation();
    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would send data to backend or email service.
        alert(t('contact.successMessage'));
    };

    return (
        <Box sx={{ py: 8, px: { xs: 2, md: 4 }, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ color: '#005941', fontWeight: 'bold' }}>
                {t('contact.title')}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField name="name" label={t('contact.name')} required fullWidth />
                <TextField name="email" label={t('contact.email')} type="email" required fullWidth />
                <TextField name="message" label={t('contact.message')} multiline rows={4} required fullWidth />
                <Button type="submit" variant="contained" sx={{ bgcolor: '#005941', '&:hover': { bgcolor: '#003d2b' } }}>
                    {t('contact.send')}
                </Button>
            </Box>
        </Box>
    );
};

export default ContactForm;
