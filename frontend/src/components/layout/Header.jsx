import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    Menu,
    MenuItem,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

const navItems = [
    {
        title: 'Tours',
        dropdown: ['Son Doong Expedition', 'Tu Lan Cave Encounter', 'Hang En Adventure', 'Hang Ba Deep Jungle', 'Family Tours']
    },
    {
        title: 'Destinations',
        dropdown: ['Phong Nha', 'Tu Lan Woods', 'Quang Binh']
    },
    {
        title: 'About Us',
        dropdown: ['Our Story', 'Core Values', 'Conservation', 'Safety']
    },
    {
        title: 'Media',
        dropdown: ['Photos', 'Videos', 'News']
    }
];

export default function Header() {
    const { t, i18n } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileExpand, setMobileExpand] = useState({});

    // State for Desktop Menus
    const [anchorEls, setAnchorEls] = useState({});

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const handleMobileExpand = (title) => {
        setMobileExpand((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const handleMenuOpen = (event, title) => {
        setAnchorEls((prev) => ({ ...prev, [title]: event.currentTarget }));
    };

    const handleMenuClose = (title) => {
        setAnchorEls((prev) => ({ ...prev, [title]: null }));
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const drawer = (
        <Box sx={{ width: 250 }}>
            <Box sx={{ my: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#005941', fontWeight: 'bold' }}>
                    OXALIS
                </Typography>
            </Box>
            <List>
                {navItems.map((item) => (
                    <React.Fragment key={item.title}>
                        <ListItem button onClick={() => handleMobileExpand(item.title)}>
                            <ListItemText primary={item.title} sx={{ color: '#333' }} />
                            {mobileExpand[item.title] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={mobileExpand[item.title]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {item.dropdown.map((subItem) => (
                                    <ListItem button key={subItem} sx={{ pl: 4 }}>
                                        <ListItemText primary={subItem} sx={{ color: '#666' }} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </React.Fragment>
                ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                    variant={i18n.language === 'en' ? "contained" : "outlined"}
                    onClick={() => changeLanguage('en')}
                    sx={{ minWidth: '40px', px: 1 }}
                >
                    EN
                </Button>
                <Button
                    variant={i18n.language === 'vi' ? "contained" : "outlined"}
                    onClick={() => changeLanguage('vi')}
                    sx={{ minWidth: '40px', px: 1 }}
                >
                    VI
                </Button>
            </Box>
        </Box>
    );

    return (
        <AppBar position="sticky" sx={{ bgcolor: 'white', color: '#1a1a1a', boxShadow: 1 }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>

                    {/* Logo Area */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                            variant="h5"
                            noWrap
                            component={Link}
                            to="/"
                            sx={{
                                mr: 4,
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                letterSpacing: '.2rem',
                                color: '#005941',
                                textDecoration: 'none',
                            }}
                        >
                            OXALIS
                        </Typography>
                    </Box>

                    {/* Desktop Menu */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                        {navItems.map((item) => (
                            <Box key={item.title}>
                                <Button
                                    onClick={(e) => handleMenuOpen(e, item.title)}
                                    endIcon={<KeyboardArrowDownIcon />}
                                    sx={{ my: 2, color: '#333', display: 'flex', fontWeight: 600, mx: 1 }}
                                >
                                    {item.title}
                                </Button>
                                <Menu
                                    anchorEl={anchorEls[item.title]}
                                    open={Boolean(anchorEls[item.title])}
                                    onClose={() => handleMenuClose(item.title)}
                                    MenuListProps={{ onMouseLeave: () => handleMenuClose(item.title) }}
                                    elevation={3}
                                    sx={{ mt: 1 }}
                                >
                                    {item.dropdown.map((subItem) => (
                                        <MenuItem key={subItem} onClick={() => handleMenuClose(item.title)} sx={{ minWidth: 200 }}>
                                            {subItem}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                        ))}
                    </Box>

                    {/* Desktop Right Actions & Language Switcher */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                            <Button
                                size="small"
                                onClick={() => changeLanguage('en')}
                                sx={{
                                    minWidth: '30px',
                                    p: 0.5,
                                    color: i18n.language === 'en' ? '#fff' : '#666',
                                    bgcolor: i18n.language === 'en' ? '#005941' : 'transparent',
                                    '&:hover': { bgcolor: i18n.language === 'en' ? '#003d2b' : '#f0f0f0' }
                                }}
                            >
                                EN
                            </Button>
                            <Button
                                size="small"
                                onClick={() => changeLanguage('vi')}
                                sx={{
                                    minWidth: '30px',
                                    p: 0.5,
                                    color: i18n.language === 'vi' ? '#fff' : '#666',
                                    bgcolor: i18n.language === 'vi' ? '#005941' : 'transparent',
                                    '&:hover': { bgcolor: i18n.language === 'vi' ? '#003d2b' : '#f0f0f0' }
                                }}
                            >
                                VI
                            </Button>
                        </Box>
                        <Button variant="contained" sx={{ bgcolor: '#005941', '&:hover': { bgcolor: '#003d2b' }, borderRadius: 6, px: 3 }}>
                            {t('header.bookNow')}
                        </Button>
                    </Box>

                    {/* Mobile Menu Icon */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleDrawerToggle}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                </Toolbar>
            </Container>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
                }}
            >
                {drawer}
            </Drawer>
        </AppBar>
    );
}
