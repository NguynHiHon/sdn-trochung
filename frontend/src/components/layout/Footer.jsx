import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
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
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Son Doong Expedition</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Tu Lan Cave Encounter</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Hang En Adventure</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Hang Ba Deep Jungle</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: '#005941' } }}>Family Tours</Link>
                        </Box>
                    </Grid>

                    {/* Information */}
                    <Grid xs={12} sm={6} md={3} sx={{ width: { xs: "100%", sm: "50%", md: "25%" } }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                            INFORMATION
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>About Us</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Our Team</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Safety Standards</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Conservation</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Careers</Link>
                        </Box>
                    </Grid>

                    {/* Booking Info */}
                    <Grid xs={12} sm={6} md={3} sx={{ width: { xs: "100%", sm: "50%", md: "25%" } }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                            SUPPORT
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>FAQs</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Booking Conditions</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Privacy Policy</Link>
                            <Link href="#" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', color: '#aaa', '&:hover': { color: 'white' } }}>Contact Us</Link>
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
