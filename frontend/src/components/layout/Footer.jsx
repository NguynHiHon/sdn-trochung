import { Box, Container, Grid, Typography, Link as MuiLink, IconButton, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <Box sx={{ bgcolor: '#1a1a1a', color: '#e0e0e0', pt: 8, pb: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    {/* Company Info */}
                    <Grid xs={12} md={3} sx={{ width: { xs: "100%", md: "25%" } }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                            OXALIS ADVENTURE
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, color: '#aaa' }}>
                            {t('footer.address')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong style={{ color: 'white' }}>Hotline:</strong> {t('footer.phone')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            <strong style={{ color: 'white' }}>Email:</strong> {t('footer.emailUs')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <IconButton size="small" sx={{ color: '#aaa', '&:hover': { color: 'white' } }}>
                                <FacebookIcon />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#aaa', '&:hover': { color: 'white' } }}>
                                <InstagramIcon />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#aaa', '&:hover': { color: 'white' } }}>
                                <YouTubeIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Tours */}
                    <Grid xs={12} sm={6} md={3} sx={{ width: { xs: "100%", sm: "50%", md: "25%" } }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                            TOURS & EXPEDITIONS
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Son Doong Expedition</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Tu Lan Cave Encounter</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Hang En Adventure</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Hang Ba Deep Jungle</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Family Tours</MuiLink>
                        </Box>
                    </Grid>

                    {/* Information */}
                    <Grid xs={12} sm={6} md={3} sx={{ width: { xs: "100%", sm: "50%", md: "25%" } }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                            INFORMATION
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>About Us</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Our Team</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Safety Standards</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Conservation</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Careers</MuiLink>
                        </Box>
                    </Grid>

                    {/* Booking Info */}
                    <Grid xs={12} sm={6} md={3} sx={{ width: { xs: "100%", sm: "50%", md: "25%" } }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                            SUPPORT
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <MuiLink component={Link} to="/faqs" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>FAQs</MuiLink>
                            <MuiLink component={Link} to="/news" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>News</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Booking Conditions</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Privacy Policy</MuiLink>
                            <MuiLink href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Contact Us</MuiLink>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#777' }}>
                        {t('footer.rights')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#777' }}>
                            International Tour Operator License: 44-015/2014/TCDL-GP LHQT
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
