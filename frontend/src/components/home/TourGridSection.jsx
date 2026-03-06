import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    IconButton
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ImageWithFallback from '../common/ImageWithFallback';

export default function TourGridSection() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Dynamic data translated from locales
    const dummyTours = [
        {
            id: 'tulan',
            category: 'multiday',
            ...t('tours.tulan', { returnObjects: true }), // name, tags, desc, price
            image: '/images/tour1.png',
        },
        {
            id: 'hangtien',
            category: 'multiday',
            ...t('tours.hangtien', { returnObjects: true }),
            image: '/images/tour2.png',
        },
        {
            id: 'sondoong',
            category: 'multiday',
            ...t('tours.sondoong', { returnObjects: true }),
            image: '/images/hero-bg.jpg',
        },
        {
            id: 'hangen',
            category: 'overnight',
            ...t('tours.hangen', { returnObjects: true }),
            image: '/images/tour3.png',
        }
    ];

    const categoryKeys = ['all', 'multiday', 'overnight', 'daytours', 'family'];
    const categories = categoryKeys.map(key => ({
        key: key,
        label: t(`home.categories.${key}`)
    }));

    const [activeTabKey, setActiveTabKey] = useState('multiday');
    const scrollRef = useRef(null);

    const filteredTours = activeTabKey === 'all'
        ? dummyTours
        : dummyTours.filter(tour => tour.category === activeTabKey || activeTabKey === 'multiday');

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            if (direction === 'left') {
                current.scrollBy({ left: -350, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: 350, behavior: 'smooth' });
            }
        }
    };

    return (
        <Box sx={{ py: 6, bgcolor: '#fdfbf7' }}>
            <Container maxWidth="lg" sx={{ position: 'relative' }}>

                {/* Filter Tabs matching exact screenshot style */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
                    {categories.map((cat) => (
                        <Button
                            key={cat.key}
                            onClick={() => setActiveTabKey(cat.key)}
                            variant={activeTabKey === cat.key ? 'contained' : 'outlined'}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: activeTabKey === cat.key ? '#fff' : '#2b6f56',
                                bgcolor: activeTabKey === cat.key ? '#2b6f56' : 'transparent',
                                borderColor: '#2b6f56',
                                borderRadius: '4px',
                                px: 2.5,
                                py: 0.8,
                                '&:hover': {
                                    bgcolor: activeTabKey === cat.key ? '#215c46' : 'rgba(43, 111, 86, 0.04)',
                                    borderColor: '#2b6f56',
                                }
                            }}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </Box>

                {/* Left Arrow */}
                <IconButton
                    onClick={() => scroll('left')}
                    sx={{
                        position: 'absolute',
                        left: -20,
                        top: '55%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        bgcolor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': { bgcolor: '#f0f0f0' },
                        display: { xs: 'none', md: 'flex' }
                    }}
                >
                    <ArrowBackIosNewIcon fontSize="small" sx={{ color: '#333' }} />
                </IconButton>

                {/* Horizontal Scrolling Card Container */}
                <Box
                    ref={scrollRef}
                    sx={{
                        display: 'flex',
                        gap: 3,
                        overflowX: 'auto',
                        pb: 4, // space for shadow
                        pt: 1,
                        scrollSnapType: 'x mandatory',
                        scrollbarWidth: 'none', // hide scrollbar for firefox
                        '&::-webkit-scrollbar': { display: 'none' }, // hide scrollbar for chrome/safari
                    }}
                >
                    {filteredTours.map((tour) => (
                        <Card
                            key={tour.id}
                            onClick={() => navigate('/tour/' + tour.id)}
                            sx={{
                                minWidth: { xs: '85vw', sm: '320px', md: '350px' },
                                maxWidth: { xs: '85vw', sm: '320px', md: '350px' },
                                scrollSnapAlign: 'start',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                border: '1px solid #eee',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                }
                            }}
                        >
                            <Box sx={{ height: 230, width: '100%', overflow: 'hidden' }}>
                                <ImageWithFallback
                                    src={tour.image}
                                    fallbackSrc="https://images.unsplash.com/photo-1549880181-56a44cf4a9a5?q=80&w=2070&auto=format&fit=crop"
                                    alt={tour.name}
                                    sx={{
                                        height: '100%',
                                        width: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                        }
                                    }}
                                />
                            </Box>

                            <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', mb: 1, letterSpacing: '0.5px' }}>
                                    {tour.tags}
                                </Typography>

                                <Typography variant="h5" component="h3" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 2, fontSize: '1.4rem' }}>
                                    {tour.name}
                                </Typography>

                                <Typography variant="body2" sx={{ color: '#4a4a4a', mb: 4, lineHeight: 1.6 }}>
                                    {tour.desc}
                                </Typography>

                                <Box sx={{ mt: 'auto' }}>
                                    <Typography sx={{ fontWeight: 800, color: '#1a1a1a', fontSize: '0.95rem' }}>
                                        {tour.price}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Right Arrow */}
                <IconButton
                    onClick={() => scroll('right')}
                    sx={{
                        position: 'absolute',
                        right: -20,
                        top: '55%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        bgcolor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': { bgcolor: '#f0f0f0' },
                        display: { xs: 'none', md: 'flex' }
                    }}
                >
                    <ArrowForwardIosIcon fontSize="small" sx={{ color: '#333' }} />
                </IconButton>

            </Container>
        </Box>
    );
}
