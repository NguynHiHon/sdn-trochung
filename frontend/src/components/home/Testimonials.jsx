import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, Rating } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '../common/ImageWithFallback';

const Testimonials = () => {
    const { t } = useTranslation();

    const testimonials = [
        {
            name: t('testimonials.reviews.1.author'),
            avatar: '/images/testimonial1.png',
            rating: 5,
            text: t('testimonials.reviews.1.text')
        },
        {
            name: t('testimonials.reviews.2.author'),
            avatar: '/images/testimonial2.png',
            rating: 5,
            text: t('testimonials.reviews.2.text')
        }
    ];

    return (
        <Box sx={{ py: 8, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#005941' }}>
                {t('testimonials.title')}
            </Typography>
            <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
                {testimonials.map((t, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, boxShadow: 3 }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ mr: 2 }}>
                                        <ImageWithFallback src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{t.name}</Typography>
                                        <Rating value={t.rating} readOnly size="small" />
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="text.secondary">{t.text}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Testimonials;
