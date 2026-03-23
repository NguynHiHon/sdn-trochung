import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { useLocation } from 'react-router-dom';
import NewsCategoriesPage from './NewsCategoriesPage';
import NewsArticlesPage from './NewsArticlesPage';
import FaqManagerPage from './FaqManagerPage';

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export default function PostsManagerPage() {
  const location = useLocation();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const t = location.state?.postsTab;
    if (typeof t === 'number' && t >= 0 && t <= 2) {
      setTab(t);
    }
  }, [location.state]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Quản lý bài đăng
      </Typography>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tab label="Danh mục tin" />
        <Tab label="Bài viết" />
        <Tab label="FAQs" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <NewsCategoriesPage embedded />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <NewsArticlesPage embedded />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <FaqManagerPage embedded />
      </TabPanel>
    </Box>
  );
}
