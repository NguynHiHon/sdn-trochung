import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Pagination } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getNewsArticles, getNewsCategories } from '../services/newsApi';

export default function NewsCategoryPage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'vi';
  const [categoryName, setCategoryName] = useState('');
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewsCategories().then((res) => {
      if (res.success) {
        const c = (res.data || []).find((x) => x.slug === slug);
        if (c) setCategoryName(c.name?.[lang] || c.slug);
      }
    });
  }, [slug, lang]);

  useEffect(() => {
    setLoading(true);
    getNewsArticles({ categorySlug: slug, page, limit: 9 })
      .then((res) => {
        if (res.success) {
          setArticles(res.data || []);
          setTotalPages(res.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, page]);

  return (
    <Box sx={{ bgcolor: '#fcfaf6', minHeight: '70vh', py: 5 }}>
      <Container maxWidth="lg">
        <Typography component={Link} to="/news" variant="body2" sx={{ color: '#2b6f56', textDecoration: 'none', fontWeight: 600, display: 'inline-block', mb: 2 }}>
          ← {lang === 'vi' ? 'Tất cả tin' : 'All news'}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1b3a2d', mb: 3 }}>
          {categoryName || slug}
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#2b6f56' }} />
          </Box>
        ) : articles.length === 0 ? (
          <Typography color="text.secondary">{lang === 'vi' ? 'Không có bài viết.' : 'No articles.'}</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {articles.map((a) => (
                <Grid item xs={12} sm={6} md={4} key={a._id}>
                  <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', bgcolor: 'white' }}>
                    <CardActionArea component={Link} to={`/news/article/${a.slug}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                      {a.thumbnail?.url && (
                        <CardMedia component="img" height="160" image={a.thumbnail.url} alt="" sx={{ objectFit: 'cover' }} />
                      )}
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1b3a2d', mb: 1 }}>
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
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" sx={{ '& .Mui-selected': { bgcolor: '#2b6f56 !important' } }} />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
