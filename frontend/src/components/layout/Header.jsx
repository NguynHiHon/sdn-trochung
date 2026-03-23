import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AppBar, Toolbar, Typography, Button, Container, Box, IconButton,
    Drawer, List, ListItem, ListItemText, Collapse, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useNavigate } from 'react-router-dom';

const navItems = [
    {
        title: { vi: 'Tours', en: 'Tours' },
        dropdown: [
            { label: { vi: 'Tour Dài Ngày', en: 'Multi-Day Tours' }, link: '/#tours' },
            { label: { vi: 'Tour Qua Đêm', en: 'Overnight Tours' }, link: '/#tours' },
            { label: { vi: 'Tour Trong Ngày', en: 'Day Tours' }, link: '/#tours' },
            { label: { vi: 'Tour Gia Đình', en: 'Family Tours' }, link: '/#tours' },
        ]
    },
    {
        title: { vi: 'Điểm đến', en: 'Destinations' },
        dropdown: [
            { label: { vi: 'Phong Nha', en: 'Phong Nha' }, link: '/' },
            { label: { vi: 'Khu Rừng Tu Lan', en: 'Tu Lan Jungle' }, link: '/' },
            { label: { vi: 'Quảng Bình', en: 'Quang Binh' }, link: '/' },
        ]
    },
    {
        title: { vi: 'Về Chúng Tôi', en: 'About Us' },
        dropdown: [
            { label: { vi: 'Câu chuyện', en: 'Our Story' }, link: '/' },
            { label: { vi: 'Giá trị cốt lõi', en: 'Core Values' }, link: '/' },
            { label: { vi: 'Bảo tồn', en: 'Conservation' }, link: '/' },
        ]
    },
];

export default function Header() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const lang = i18n.language === 'en' ? 'en' : 'vi';

    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileExpand, setMobileExpand] = useState({});
    const [hovered, setHovered] = useState(null);

    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    return (
        <>
            <AppBar position="sticky" elevation={0}
                sx={{
                    bgcolor: 'rgba(255,255,255,0.97)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    color: '#1b3a2d',
                }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 56, md: 72 } }}>

                        {/* Logo */}
                        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 1.5 }}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2b6f56, #1a5a3e)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 900, fontSize: '0.9rem',
                            }}>O</Box>
                            <Typography sx={{
                                fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.15rem',
                                color: '#1b3a2d', fontFamily: '"Inter", sans-serif',
                            }}>
                                OXALIS
                            </Typography>
                        </Box>

                        {/* Desktop Nav */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                            {navItems.map((item) => (
                                <Box key={item.title.en}
                                    onMouseEnter={() => setHovered(item.title.en)}
                                    onMouseLeave={() => setHovered(null)}
                                    sx={{ position: 'relative' }}>
                                    <Button
                                        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important', transition: 'transform .2s', transform: hovered === item.title.en ? 'rotate(180deg)' : 'none' }} />}
                                        sx={{
                                            color: hovered === item.title.en ? '#2b6f56' : '#444',
                                            fontWeight: 600, fontSize: '0.88rem', textTransform: 'none',
                                            px: 2, py: 1,
                                            transition: 'color .2s',
                                        }}>
                                        {item.title[lang]}
                                    </Button>
                                    {/* Dropdown */}
                                    <Box sx={{
                                        position: 'absolute', top: '100%', left: '50%',
                                        minWidth: 200, bgcolor: 'white', borderRadius: 2,
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        opacity: hovered === item.title.en ? 1 : 0,
                                        visibility: hovered === item.title.en ? 'visible' : 'hidden',
                                        transform: hovered === item.title.en ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)',
                                        transition: 'all .25s ease',
                                        py: 1, zIndex: 100,
                                    }}>
                                        {item.dropdown.map(sub => (
                                            <Box key={sub.label.en} component={Link} to={sub.link}
                                                sx={{
                                                    display: 'block', px: 2.5, py: 1.2,
                                                    color: '#444', textDecoration: 'none',
                                                    fontSize: '0.88rem', fontWeight: 500,
                                                    transition: 'all .15s',
                                                    '&:hover': { bgcolor: '#f0faf5', color: '#2b6f56', pl: 3 },
                                                }}>
                                                {sub.label[lang]}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        {/* Desktop Right */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                display: 'flex', border: '1px solid #ddd', borderRadius: 5, overflow: 'hidden',
                            }}>
                                {['EN', 'VI'].map(lng => (
                                    <Button key={lng} size="small" onClick={() => changeLanguage(lng.toLowerCase())}
                                        sx={{
                                            minWidth: 36, px: 1.5, py: 0.4, fontSize: '0.75rem', fontWeight: 700,
                                            color: i18n.language === lng.toLowerCase() ? 'white' : '#888',
                                            bgcolor: i18n.language === lng.toLowerCase() ? '#2b6f56' : 'transparent',
                                            borderRadius: 0,
                                            '&:hover': { bgcolor: i18n.language === lng.toLowerCase() ? '#1a5a3e' : '#f5f5f5' },
                                        }}>
                                        {lng}
                                    </Button>
                                ))}
                            </Box>
                            <Button variant="contained" onClick={() => navigate('/#tours')}
                                sx={{
                                    bgcolor: '#2b6f56', fontWeight: 700, fontSize: '0.85rem',
                                    borderRadius: 6, px: 3, py: 0.9, textTransform: 'none',
                                    boxShadow: '0 2px 12px rgba(43,111,86,0.25)',
                                    '&:hover': { bgcolor: '#1a5a3e', boxShadow: '0 4px 16px rgba(43,111,86,0.35)' },
                                }}>
                                {t('header.bookNow')}
                            </Button>
                        </Box>

                        {/* Mobile menu btn */}
                        <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' }, color: '#1b3a2d' }}>
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
                sx={{ '& .MuiDrawer-paper': { width: 280, bgcolor: '#faf8f4' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography fontWeight={900} color="#1b3a2d" fontSize="1.2rem">OXALIS</Typography>
                    <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
                </Box>
                <Divider />
                <List sx={{ px: 1 }}>
                    {navItems.map(item => (
                        <React.Fragment key={item.title.en}>
                            <ListItem button onClick={() => setMobileExpand(prev => ({ ...prev, [item.title.en]: !prev[item.title.en] }))}
                                sx={{ borderRadius: 2, mb: 0.5 }}>
                                <ListItemText primary={item.title[lang]} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} />
                                {mobileExpand[item.title.en] ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                            <Collapse in={mobileExpand[item.title.en]} timeout="auto" unmountOnExit>
                                <List disablePadding>
                                    {item.dropdown.map(sub => (
                                        <ListItem button key={sub.label.en} component={Link} to={sub.link}
                                            onClick={() => setMobileOpen(false)}
                                            sx={{ pl: 4, borderRadius: 1, '&:hover': { bgcolor: '#edf8f2' } }}>
                                            <ListItemText primary={sub.label[lang]} primaryTypographyProps={{ fontSize: '0.88rem', color: '#555' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </React.Fragment>
                    ))}
                </List>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, p: 2 }}>
                    {['EN', 'VI'].map(lng => (
                        <Button key={lng} variant={i18n.language === lng.toLowerCase() ? 'contained' : 'outlined'}
                            onClick={() => changeLanguage(lng.toLowerCase())}
                            sx={{
                                minWidth: 44, fontWeight: 700, fontSize: '0.8rem',
                                bgcolor: i18n.language === lng.toLowerCase() ? '#2b6f56' : 'transparent',
                                borderColor: '#2b6f56', color: i18n.language === lng.toLowerCase() ? 'white' : '#2b6f56',
                            }}>
                            {lng}
                        </Button>
                    ))}
                </Box>
            </Drawer>
        </>
    );
}
