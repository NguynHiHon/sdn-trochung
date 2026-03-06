import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';

import { useTranslation } from 'react-i18next';
import ImageWithFallback from '../common/ImageWithFallback';

// Dummy media logos based on the website
const mediaLogos = [
    { name: 'BBC', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BBC_Logo_2021.svg/512px-BBC_Logo_2021.svg.png' },
    { name: 'National Geographic', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/National_Geographic_Logo.svg/512px-National_Geographic_Logo.svg.png' },
    { name: 'Lonely Planet', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Lonely_Planet_Logo.svg/512px-Lonely_Planet_Logo.svg.png' },
    { name: 'The New York Times', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/The_New_York_Times_logo.png/512px-The_New_York_Times_logo.png' },
    { name: 'CNN Travel', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/CNN_International_logo.svg/512px-CNN_International_logo.svg.png' },
    { name: 'Huffpost', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/HuffPost_2017_logo.svg/512px-HuffPost_2017_logo.svg.png' },
    { name: 'The Telegraph', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Telegraph_logo.svg/512px-The_Telegraph_logo.svg.png' },
    { name: 'ABC News', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/ABC_News_logo_2021.svg/512px-ABC_News_logo_2021.svg.png' },
];

export default function CoreValuesSection() {
    const { t } = useTranslation();
    return (
        <Box sx={{ py: 10, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                {/* Core Values Area */}
                <Box sx={{ mb: 10, textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{ fontWeight: 700, mb: 4, color: '#1a1a1a' }}
                    >
                        {t('mediaSection.title')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: '800px',
                            mx: 'auto',
                            fontSize: '1.1rem',
                            lineHeight: 1.8
                        }}
                    >
                        {t('mediaSection.desc')}
                    </Typography>
                </Box>

                {/* Global Media Grid */}
                <Grid container spacing={4} justifyContent="center" alignItems="center">
                    {mediaLogos.map((logo, index) => (
                        <Grid xs={6} sm={4} md={3} key={index} sx={{ width: { xs: "50%", sm: "33.333%", md: "25%" }, textAlign: 'center' }}>
                            <ImageWithFallback
                                src={`/images/logos/${logo.name.toLowerCase().replace(/ /g, '-')}.png`}
                                fallbackSrc={logo.src}
                                alt={logo.name}
                                sx={{
                                    maxWidth: '120px',
                                    maxHeight: '60px',
                                    objectFit: 'contain',
                                    filter: 'grayscale(100%)',
                                    opacity: 0.6,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        filter: 'grayscale(0%)',
                                        opacity: 1,
                                    }
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
