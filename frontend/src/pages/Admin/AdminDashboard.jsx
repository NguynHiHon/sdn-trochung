import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import CollectionsIcon from '@mui/icons-material/Collections';
import ExploreIcon from '@mui/icons-material/Explore';
import LandscapeIcon from '@mui/icons-material/Landscape';
import { getAllMedia } from '../../services/mediaApi';
import { getAllCaves } from '../../services/caveApi';
import { getAllTours } from '../../services/tourApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ tours: 0, caves: 0, medias: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mediaRes, caveRes, tourRes] = await Promise.all([
          getAllMedia({ limit: 1 }),
          getAllCaves({ limit: 1 }),
          getAllTours({ limit: 1 })
        ]);
        setStats({
          medias: mediaRes.total || 0,
          caves: caveRes.total || 0,
          tours: tourRes.total || 0
        });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Tours',
      value: stats.tours,
      icon: <ExploreIcon sx={{ fontSize: 48 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Hang Động',
      value: stats.caves,
      icon: <LandscapeIcon sx={{ fontSize: 48 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Thư Viện Ảnh',
      value: stats.medias,
      icon: <CollectionsIcon sx={{ fontSize: 48 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1e293b' }}>
        Tổng Quan Hệ Thống
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <Paper
                sx={{
                  p: 3,
                  background: card.gradient,
                  color: 'white',
                  borderRadius: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {card.title}
                  </Typography>
                </Box>
                <Box sx={{ opacity: 0.6 }}>
                  {card.icon}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Paper sx={{ p: 4, borderRadius: 3, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#334155' }}>
          🏔️ Chào mừng đến với Hệ Thống Quản Trị OXALIS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sử dụng thanh điều hướng bên trái để quản lý Tours, Hang Động, và Thư Viện Ảnh.
          Hệ thống hỗ trợ nhập liệu song ngữ (Tiếng Việt / Tiếng Anh) cho tất cả nội dung hiển thị khách hàng.
        </Typography>
      </Paper>
    </Box>
  );
}
