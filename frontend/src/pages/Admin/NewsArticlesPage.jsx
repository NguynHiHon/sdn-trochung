import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, IconButton, Chip, TextField, MenuItem, Pagination, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminListNewsArticles, adminDeleteNewsArticle, adminListNewsCategories } from '../../services/newsApi';

const statusLabel = { draft: 'Nháp', published: 'Xuất bản', archived: 'Lưu trữ' };

export default function NewsArticlesPage({ embedded }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [featured, setFeatured] = useState('all');

  const load = (p = page) => {
    setLoading(true);
    adminListNewsArticles({ page: p, limit: 12, search, status, categoryId, featured })
      .then((res) => {
        if (res.success) {
          setRows(res.data || []);
          setTotalPages(res.totalPages || 1);
          setPage(res.page || 1);
        }
      })
      .catch(() => toast.error('Lỗi tải bài viết'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    adminListNewsCategories().then((res) => { if (res.success) setCategories(res.data || []); });
  }, []);

  useEffect(() => { load(1); setPage(1); }, [status, categoryId, featured]);

  const handleSearch = () => { setPage(1); load(1); };

  const del = async (id) => {
    if (!window.confirm('Xóa bài viết?')) return;
    try {
      await adminDeleteNewsArticle(id);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        {!embedded && <Typography variant="h5" fontWeight="bold">Bài viết tin tức</Typography>}
        {embedded && <Typography variant="subtitle1" fontWeight={600} color="text.secondary">Bài viết tin tức</Typography>}
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/manager/news/articles/create')}>Viết bài mới</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField size="small" label="Tìm slug / tiêu đề" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} sx={{ minWidth: 220 }} />
        <TextField size="small" select label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="draft">Nháp</MenuItem>
          <MenuItem value="published">Xuất bản</MenuItem>
          <MenuItem value="archived">Lưu trữ</MenuItem>
        </TextField>
        <TextField size="small" select label="Danh mục" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          {categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name?.vi || c.slug}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Nổi bật" value={featured} onChange={(e) => setFeatured(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="true">Nổi bật</MenuItem>
          <MenuItem value="false">Thường</MenuItem>
        </TextField>
        <Button variant="outlined" onClick={handleSearch}>Lọc</Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell><strong>Slug</strong></TableCell>
                  <TableCell><strong>Tiêu đề (VI)</strong></TableCell>
                  <TableCell><strong>Danh mục</strong></TableCell>
                  <TableCell><strong>Nổi bật</strong></TableCell>
                  <TableCell><strong>Trạng thái</strong></TableCell>
                  <TableCell align="right"><strong>Hành động</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">Chưa có bài</TableCell></TableRow>
                ) : rows.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell>{r.slug}</TableCell>
                    <TableCell>{r.title?.vi}</TableCell>
                    <TableCell>{r.categoryId?.name?.vi || '—'}</TableCell>
                    <TableCell>{r.isFeatured ? <Chip size="small" color="warning" label="Nổi bật" /> : '—'}</TableCell>
                    <TableCell><Chip size="small" label={statusLabel[r.status] || r.status} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/manager/news/articles/edit/${r._id}`)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => del(r._id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={totalPages} page={page} onChange={(e, v) => { setPage(v); load(v); }} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
