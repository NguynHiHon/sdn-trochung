import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Container, Typography, Card, CardContent, Button, IconButton,
    Skeleton, Chip
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TerrainIcon from '@mui/icons-material/Terrain';
import ImageWithFallback from '../common/ImageWithFallback';
import { getAllTours } from '../../services/tourApi';

const TOUR_TYPE_MAP = {
    vi: {
        all: 'Tất cả',
        multiday: 'Tour dài ngày',
        overnight: 'Tour qua đêm',
        daytour: 'Tour trong ngày',
        family: 'Tour gia đình',
    },
    en: {
        all: 'All Tours',
        multiday: 'Multi-Day',
        overnight: 'Overnight',
        daytour: 'Day Tours',
        family: 'Family',
    }
};

const TYPE_KEYS = ['all', 'multiday', 'overnight', 'daytour', 'family'];

export default function TourGridSection() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const lang = i18n.language === 'en' ? 'en' : 'vi';

    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState('all');
    const scrollRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await getAllTours({ status: 'published', limit: 50 });
                setTours(res.data || []);
            } catch (err) {
                console.error('Failed to load tours:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = activeType === 'all'
        ? tours
        : tours.filter(t => t.tourType === activeType);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
        }
    };

    const formatPrice = (price) => {
        if (!price) return '';
        return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
    };

    return (
        <Box id="tours" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#faf8f4' }}>
            <Container maxWidth="lg" sx={{ position: 'relative' }}>

                {/* Section Header */}
                <Box sx={{ mb: 1 }}>
                    <Typography sx={{
                        fontSize: '0.8rem', fontWeight: 700, color: '#2b6f56',
                        letterSpacing: '0.2em', textTransform: 'uppercase', mb: 1,
                    }}>
                        {lang === 'vi' ? 'Khám phá cùng Oxalis' : 'Explore with Oxalis'}
                    </Typography>
                    <Typography variant="h4" sx={{
                        fontWeight: 800, color: '#1b3a2d', mb: 1, fontFamily: '"Inter", sans-serif',
                        fontSize: { xs: '1.6rem', md: '2rem' },
                    }}>
                        {lang === 'vi' ? 'Các Tour Nổi Bật' : 'Featured Tours'}
                    </Typography>
                    <Box sx={{ width: 48, height: 3, bgcolor: '#2b6f56', borderRadius: 2, mb: 3 }} />
                </Box>

                {/* Filter Tabs */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
                    {TYPE_KEYS.map(key => (
                        <Button key={key}
                            onClick={() => setActiveType(key)}
                            variant={activeType === key ? 'contained' : 'outlined'}
                            sx={{
                                textTransform: 'none', fontWeight: 700, fontSize: '0.85rem',
                                color: activeType === key ? '#fff' : '#2b6f56',
                                bgcolor: activeType === key ? '#2b6f56' : 'transparent',
                                borderColor: activeType === key ? '#2b6f56' : '#c5d8ce',
                                borderRadius: 5, px: 2.5, py: 0.7,
                                boxShadow: activeType === key ? '0 3px 12px rgba(43,111,86,0.25)' : 'none',
                                '&:hover': {
                                    bgcolor: activeType === key ? '#1a5a3e' : 'rgba(43,111,86,0.06)',
                                    borderColor: '#2b6f56',
                                }
                            }}>
                            {TOUR_TYPE_MAP[lang][key]}
                        </Button>
                    ))}
                </Box>

                {/* Loading */}
                {loading && (
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        {[1, 2, 3].map(i => (
                            <Box key={i} sx={{ minWidth: 340 }}>
                                <Skeleton variant="rounded" height={230} sx={{ borderRadius: 2, mb: 1.5 }} />
                                <Skeleton width="60%" height={24} />
                                <Skeleton width="80%" height={16} sx={{ mt: 1 }} />
                            </Box>
                        ))}
                    </Box>
                )}

                {/* No tours message */}
                {!loading && filtered.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="#888" fontSize="1.1rem">
                            {lang === 'vi' ? 'Chưa có tour nào trong mục này.' : 'No tours available in this category.'}
                        </Typography>
                    </Box>
                )}

                {/* Arrows */}
                {!loading && filtered.length > 0 && (
                    <>
                        <IconButton onClick={() => scroll('left')}
                            sx={{
                                position: 'absolute', left: -16, top: '60%', transform: 'translateY(-50%)',
                                zIndex: 2, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                                '&:hover': { bgcolor: '#f0f0f0' },
                                display: { xs: 'none', md: 'flex' }, width: 40, height: 40,
                            }}>
                            <ArrowBackIosNewIcon sx={{ fontSize: '0.9rem', color: '#333' }} />
                        </IconButton>
                        <IconButton onClick={() => scroll('right')}
                            sx={{
                                position: 'absolute', right: -16, top: '60%', transform: 'translateY(-50%)',
                                zIndex: 2, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                                '&:hover': { bgcolor: '#f0f0f0' },
                                display: { xs: 'none', md: 'flex' }, width: 40, height: 40,
                            }}>
                            <ArrowForwardIosIcon sx={{ fontSize: '0.9rem', color: '#333' }} />
                        </IconButton>
                    </>
                )}

                {/* Tour Cards */}
                {!loading && filtered.length > 0 && (
                    <Box ref={scrollRef}
                        sx={{
                            display: 'flex', gap: 3, overflowX: 'auto', pb: 3, pt: 1,
                            scrollSnapType: 'x mandatory',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' },
                        }}>
                        {filtered.map(tour => {
                            const thumbUrl = tour.thumbnail?.url || 'https://images.unsplash.com/photo-1549880181-56a44cf4a9a5?q=80&w=600&auto=format&fit=crop';
                            return (
                                <Card key={tour._id}
                                    onClick={() => navigate('/tour/' + tour.code)}
                                    sx={{
                                        minWidth: { xs: '85vw', sm: 320, md: 340 },
                                        maxWidth: { xs: '85vw', sm: 320, md: 340 },
                                        scrollSnapAlign: 'start',
                                        display: 'flex', flexDirection: 'column',
                                        borderRadius: 3,
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                                        cursor: 'pointer', overflow: 'hidden',
                                        transition: 'all .35s ease',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                                        },
                                    }}>
                                    {/* Image */}
                                    <Box sx={{ height: 220, width: '100%', overflow: 'hidden', position: 'relative' }}>
                                        <ImageWithFallback
                                            src={thumbUrl}
                                            fallbackSrc="https://images.unsplash.com/photo-1549880181-56a44cf4a9a5?q=80&w=600"
                                            alt={tour.name?.[lang] || ''}
                                            sx={{
                                                height: '100%', width: '100%', objectFit: 'cover',
                                                transition: 'transform .5s ease',
                                                '&:hover': { transform: 'scale(1.08)' },
                                            }}
                                        />
                                        {/* Badge */}
                                        <Chip label={TOUR_TYPE_MAP[lang][tour.tourType] || tour.tourType}
                                            size="small"
                                            sx={{
                                                position: 'absolute', top: 12, left: 12,
                                                bgcolor: 'rgba(43,111,86,0.9)', color: 'white',
                                                fontWeight: 700, fontSize: '0.7rem',
                                                backdropFilter: 'blur(4px)',
                                            }} />
                                    </Box>
                                    {/* Content */}
                                    <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                                        <Typography sx={{
                                            fontWeight: 800, color: '#1b3a2d', fontSize: '1.15rem',
                                            mb: 1, lineHeight: 1.3,
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {tour.name?.[lang] || tour.name?.vi || ''}
                                        </Typography>

                                        {/* Meta chips */}
                                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                                            {tour.durationDays && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AccessTimeIcon sx={{ fontSize: 15, color: '#2b6f56' }} />
                                                    <Typography sx={{ fontSize: '0.78rem', color: '#666', fontWeight: 600 }}>
                                                        {tour.durationDays} {lang === 'vi' ? 'ngày' : 'days'}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {tour.adventureLevel && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <TerrainIcon sx={{ fontSize: 15, color: '#c17d24' }} />
                                                    <Typography sx={{ fontSize: '0.78rem', color: '#666', fontWeight: 600 }}>
                                                        Level {tour.adventureLevel}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Description (truncated) */}
                                        <Typography sx={{
                                            fontSize: '0.85rem', color: '#666', lineHeight: 1.55, mb: 2,
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {tour.description?.[lang] || ''}
                                        </Typography>

                                        {/* Price */}
                                        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontWeight: 800, color: '#2b6f56', fontSize: '1rem' }}>
                                                {formatPrice(tour.priceVND)}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: '0.75rem', color: '#2b6f56', fontWeight: 600,
                                                border: '1px solid #2b6f56', borderRadius: 4, px: 1.5, py: 0.3,
                                            }}>
                                                {lang === 'vi' ? 'Xem chi tiết →' : 'Explore →'}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
