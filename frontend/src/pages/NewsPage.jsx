import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Button } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getNewsFeed } from '../services/newsApi';

export default function NewsPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'vi';
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewsFeed({ perSection: 6 })
      .then((res) => {
        if (res.success) setSections(res.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#2b6f56' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fcfaf6', minHeight: '70vh', py: 5 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#1b3a2d', mb: 1, letterSpacing: '-0.02em' }}>
          {lang === 'vi' ? 'Tin tức' : 'News'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 720 }}>
          {lang === 'vi'
            ? 'Cập nhật cộng đồng, du lịch bền vững, mẹo trekking và điểm đến — nội dung do ban quản trị cập nhật.'
            : 'Community updates, sustainable travel, trekking tips and destinations — curated by our team.'}
        </Typography>

        {sections.length === 0 ? (
          <Typography color="text.secondary">{lang === 'vi' ? 'Chưa có tin tức.' : 'No news yet.'}</Typography>
        ) : (
          sections.map(({ category, articles }) => (
            <Box key={category._id} sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1b3a2d' }}>
                  {category.name?.[lang] || category.slug}
                </Typography>
                <Button component={Link} to={`/news/category/${category.slug}`} size="small" sx={{ color: '#2b6f56', fontWeight: 600 }}>
                  {lang === 'vi' ? 'Xem thêm →' : 'View more →'}
                </Button>
              </Box>
              {articles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {lang === 'vi' ? 'Chưa có bài trong mục này.' : 'No articles in this section yet.'}
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {articles.map((a) => (
                    <Grid item xs={12} sm={6} md={4} key={a._id}>
                      <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', bgcolor: 'white' }}>
                        <CardActionArea component={Link} to={`/news/article/${a.slug}`} sx={{ height: '100%', alignItems: 'stretch', display: 'flex', flexDirection: 'column' }}>
                          {a.thumbnail?.url && (
                            <CardMedia component="img" height="160" image={a.thumbnail.url} alt="" sx={{ objectFit: 'cover' }} />
                          )}
                          <CardContent sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1b3a2d', mb: 1, lineHeight: 1.35 }}>
                              {a.title?.[lang]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {a.excerpt?.[lang] || ''}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ))
        )}
      </Container>
    </Box>
  );
}
