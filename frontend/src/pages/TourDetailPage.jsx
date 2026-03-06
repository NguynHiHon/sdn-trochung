import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import ImageWithFallback from '../components/common/ImageWithFallback';
import Grid from '@mui/material/GridLegacy';
import { useTranslation } from 'react-i18next';
export default function TourDetailPage() {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('highlights');

    const sections = [
        { id: 'highlights', label: t('tourDetail.sections.highlights') },
        { id: 'itinerary', label: t('tourDetail.sections.itinerary') },
        { id: 'photos', label: t('tourDetail.sections.photos') },
        { id: 'weather', label: t('tourDetail.sections.weather') },
        { id: 'adventure-level', label: t('tourDetail.sections.adventureLevel') },
        { id: 'fitness', label: t('tourDetail.sections.fitness') },
        { id: 'safety', label: t('tourDetail.sections.safety') },
        { id: 'communication', label: t('tourDetail.sections.communication') },
        { id: 'what-to-bring', label: t('tourDetail.sections.whatToBring') },
        { id: 'swimming', label: t('tourDetail.sections.swimming') },
        { id: 'toilet', label: t('tourDetail.sections.toilet') },
        { id: 'directions', label: t('tourDetail.sections.directions') },
        { id: 'booking-process', label: t('tourDetail.sections.bookingProcess') },
        { id: 'price', label: t('tourDetail.sections.priceDates') },
        { id: 'cancellation', label: t('tourDetail.sections.cancellation') },
        { id: 'price-includes', label: t('tourDetail.sections.priceIncludes') },
        { id: 'faqs', label: t('tourDetail.sections.faqs') }
    ];

    // Observation logic for scrollspy
    useEffect(() => {
        const handleScroll = () => {
            let current = '';
            for (let section of sections) {
                const element = document.getElementById(section.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // If the top of the element is near the top of the viewport
                    if (rect.top <= 150) {
                        current = section.id;
                    }
                }
            }
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100; // 100px offset for header
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fcfaf6' }}>
            <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
                <Grid container spacing={6}>
                    {/* Left Column: Main Content */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 3, color: '#1a1a1a' }}>
                            Hang Tien-Tu Lan Discovery
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic', fontWeight: 600, color: '#4a4a4a', lineHeight: 1.8 }}>
                            Embark on the Hang Tien-Tu Lan Discovery adventure, a seamless blend of the Tu Lan Cave Experience and Hang Tien Discovery tours. This expedition invites you to immerse yourself in the enchanting realms of the Tu Lan cave system and Hang Tien cave.
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 6, color: '#444', lineHeight: 1.8 }}>
                            Spanning two days and one night, the Hang Tien-Tu Lan exploration offers an unparalleled journey for nature enthusiasts eager to uncover the secrets of Quang Binh's caverns. Enjoy exhilarating activities like mountain trekking, forest navigation, and swimming in pristine pools. Venture into Hang Tien, the crown jewel of the Tu Lan system, and stand in awe of its towering stalactites.
                        </Typography>

                        {/* Sections */}
                        <Box id="highlights" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Highlights</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                - Trek through dense tropical jungle.<br />
                                - Swim in underground rivers.<br />
                                - Camp in spectacular natural locations.<br />
                                - Explore magnificent stalactites and stalagmites.
                            </Typography>
                        </Box>

                        <Box id="itinerary" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Itinerary</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Day 1: Phong Nha - Tan Hoa - Tu Lan</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8, mb: 3 }}>
                                We start with a safety briefing before beginning the trek across peanut fields and through the river into the jungle heading to the first caves...
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Day 2: Tu Lan - Hang Tien - Phong Nha</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Wake up to the sounds of exactly nothing but nature. Have breakfast then trek to Hang Tien before returning back to civilization.
                            </Typography>
                        </Box>

                        <Box id="photos" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Photos</Typography>
                            <ImageWithFallback src="/images/tour2.png" alt="Hang Tien" sx={{ width: '100%', borderRadius: 2, mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <ImageWithFallback src="/images/tour1.png" alt="Tu Lan" sx={{ width: '100%', borderRadius: 2 }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <ImageWithFallback src="/images/tour3.png" alt="Hang En" sx={{ width: '100%', borderRadius: 2 }} />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box id="weather" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Weather and Climate</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Weather in Phong Nha varies depending on the season. Expect hot and humid conditions in the summer and cooler, wetter weather in the winter. We operate most tours from mid-November to mid-September.
                            </Typography>
                        </Box>

                        <Box id="adventure-level" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Adventure level on tour</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                This tour is rated Level 2 - Easy. It is designed for those who have basic fitness and allows guests to experience the beauty of the jungle without excessive strain.
                            </Typography>
                        </Box>

                        <Box id="fitness" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Fitness preparation for Hang Tien-Tu Lan Discovery</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                The basic physical fitness requirements for participating include:<br /><br />
                                <strong>• Trekking experience requirements:</strong> Having experience in trekking and camping in the forest is an advantage.<br />
                                <strong>• Fitness Preparation:</strong> Regularly participating in physical activities (such as yoga, swimming, hiking, running, stair climbing, gym) to maintain physical fitness. This ensures that you are able to:<br />
                                - Run continuously for 3km within 30 minutes.<br />
                                - Climb 5 floors continuously without becoming out of breath or dizzy.
                            </Typography>
                        </Box>

                        <Box id="safety" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Safety measures on the tour</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                This is always the top priority. We only use high-quality equipment meeting international standards, mainly imported from France, the UK, and Switzerland. The tour guides must undergo professional training and be tested for skills regularly.
                            </Typography>
                        </Box>

                        <Box id="communication" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Communication on tour</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Please note that there is no cell phone or internet coverage inside the cave or jungle areas. Our guides are equipped with satellite phones for emergency use.
                            </Typography>
                        </Box>

                        <Box id="what-to-bring" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>What to bring</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Long trousers, comfortable trekking shoes, a long-sleeved shirt, bug spray, a hat, and a camera. We provide the safety and camping gear.
                            </Typography>
                        </Box>

                        <Box id="swimming" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Swimming at campsites</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Swimming is available at designated campsites and in certain caves. Life jackets are provided and mandatory during all water activities.
                            </Typography>
                        </Box>

                        <Box id="toilet" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Toilet at the campsites</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Eco-friendly composting toilets are set up at every campsite to minimize our environmental footprint while providing comfort for our guests.
                            </Typography>
                        </Box>

                        <Box id="directions" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Directions to Phong Nha</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Phong Nha can be reached via flight, train, or sleeper bus. The nearest airport and train station are located in Dong Hoi city, about a 45-minute drive from our headquarters.
                            </Typography>
                        </Box>

                        <Box id="booking-process" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Tour booking process</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Bookings can be made directly on our website. You will receive an immediate confirmation email, followed by a separate email containing payment instructions and waiver forms.
                            </Typography>
                        </Box>

                        <Box id="price" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Tour price and available dates</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                The price is VND 5,800,000 per person. Group size is heavily restricted to ensure the conservation of the caves and an exclusive experience for guests. Check our booking calendar for exact availability.
                            </Typography>
                        </Box>

                        <Box id="cancellation" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Terms of tour cancellation</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Cancellations made more than 30 days prior to departure will receive a full refund. Please read our detailed terms and conditions for late cancellation policies.
                            </Typography>
                        </Box>

                        <Box id="price-includes" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>Price includes</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                - National park entrance fees<br />
                                - All meals during the tour<br />
                                - Safety and camping equipment<br />
                                - Professional guide team and porters
                            </Typography>
                        </Box>

                        <Box id="faqs" sx={{ mb: 8, pt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>FAQs</Typography>
                            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                                Got questions? Head over to our FAQ page where we answer common inquiries about packing, food, fitness, and more.
                            </Typography>
                        </Box>

                    </Grid>

                    {/* Right Column: Sticky Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: 'sticky', top: 100 }}>
                            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{t('tours.hangtien.name')}</Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                    {t('tourDetail.level')} <strong>Level 2</strong><br />
                                    {t('tourDetail.age')}<br />
                                    {t('tourDetail.groupSize')}<br />
                                    {t('tourDetail.tourType')}<br />
                                    {t('tourDetail.operation')}<br />
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 3 }}>
                                    {t('tours.hangtien.price')}
                                </Typography>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        bgcolor: '#f55d14', // Vibrant orange from screenshot
                                        color: '#fff',
                                        fontWeight: 800,
                                        fontSize: '1.1rem',
                                        py: 1.5,
                                        borderRadius: 1,
                                        '&:hover': { bgcolor: '#e04e0a' }
                                    }}
                                >
                                    {t('tourDetail.bookNow')}
                                </Button>
                            </Paper>

                            <Paper elevation={0} sx={{ border: '1px solid #eaeaea', borderRadius: 2, overflow: 'hidden', overflowY: 'scroll' }}>
                                <List disablePadding>
                                    {sections.map((section, index) => (
                                        <React.Fragment key={section.id}>
                                            <ListItem
                                                button
                                                onClick={() => scrollToSection(section.id)}
                                                sx={{
                                                    borderLeft: activeSection === section.id ? '4px solid #2b6f56' : '4px solid transparent',
                                                    bgcolor: activeSection === section.id ? 'rgba(43, 111, 86, 0.08)' : 'transparent',
                                                    '&:hover': { bgcolor: 'rgba(43, 111, 86, 0.04)' },
                                                    py: 1.5
                                                }}
                                            >
                                                <ListItemText
                                                    primary={section.label}
                                                    primaryTypographyProps={{
                                                        fontWeight: activeSection === section.id ? 700 : 500,
                                                        color: activeSection === section.id ? '#2b6f56' : '#555',
                                                        fontSize: '0.95rem'
                                                    }}
                                                />
                                            </ListItem>
                                            {index < sections.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
