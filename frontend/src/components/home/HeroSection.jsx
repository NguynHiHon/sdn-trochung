import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '../common/ImageWithFallback';

export default function HeroSection() {
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                position: 'relative',
                height: '90vh',
                minHeight: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                bgcolor: '#005941', // Dark forest green fallback
            }}
        >
            {/* Background Video/Image Placeholder */}
            <ImageWithFallback
                src="/images/hero-bg.jpg"
                fallbackSrc="https://images.unsplash.com/photo-1596484552834-6a58f850d0a1?q=80&w=2070&auto=format&fit=crop"
                alt="Son Doong Cave"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1,
                    opacity: 0.8,
                }}
            />

            {/* Dark Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 2,
                }}
            />

            {/* Content */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3, textAlign: 'center', color: 'white' }}>
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        fontWeight: 800,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        mb: 2,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        fontSize: { xs: '2.5rem', md: '4rem' }
                    }}
                >
                    {t('home.heroTitle')}
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        mb: 4,
                        fontWeight: 400,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        maxWidth: '800px',
                        mx: 'auto'
                    }}
                >
                    {t('home.heroSubtitle')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            bgcolor: '#005941',
                            color: 'white',
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '50px',
                            '&:hover': {
                                bgcolor: '#003d2b',
                            }
                        }}
                    >
                        {t('home.findYourTour')}
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<PlayCircleOutlineIcon />}
                        sx={{
                            borderColor: 'white',
                            color: 'white',
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '50px',
                            '&:hover': {
                                borderColor: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)',
                            }
                        }}
                    >
                        {t('home.watchVideo')}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
