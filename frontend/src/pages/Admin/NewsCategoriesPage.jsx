import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';
import { adminListNewsCategories, adminCreateNewsCategory, adminUpdateNewsCategory, adminDeleteNewsCategory } from '../../services/newsApi';

const empty = { slug: '', name: { vi: '', en: '' }, sortOrder: 0 };

export default function NewsCategoriesPage({ embedded }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminListNewsCategories()
      .then((res) => {
        if (res.success) setRows(res.data || []);
      })
      .catch(() => toast.error('Lỗi tải danh mục'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      slug: row.slug,
      name: { vi: row.name?.vi || '', en: row.name?.en || '' },
      sortOrder: row.sortOrder ?? 0,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.slug.trim() || !form.name.vi.trim() || !form.name.en.trim()) {
      toast.warning('Slug và tên (VI/EN) là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      if (editingId) {
        await adminUpdateNewsCategory(editingId, payload);
        toast.success('Đã cập nhật');
      } else {
        await adminCreateNewsCategory(payload);
        toast.success('Đã tạo danh mục');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Xóa danh mục? (Chỉ được khi không còn bài viết)')) return;
    try {
      await adminDeleteNewsCategory(id);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        {!embedded && <Typography variant="h5" fontWeight="bold">Danh mục tin tức</Typography>}
        {embedded && <Typography variant="subtitle1" fontWeight={600} color="text.secondary">Danh mục tin tức</Typography>}
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Thêm danh mục</Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell><strong>Slug</strong></TableCell>
                <TableCell><strong>Tên (VI)</strong></TableCell>
                <TableCell><strong>Tên (EN)</strong></TableCell>
                <TableCell><strong>Thứ tự</strong></TableCell>
                <TableCell align="right"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.slug}</TableCell>
                  <TableCell>{r.name?.vi}</TableCell>
                  <TableCell>{r.name?.en}</TableCell>
                  <TableCell>{r.sortOrder}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => del(r._id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Sửa danh mục' : 'Danh mục mới'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Slug (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} disabled={!!editingId} helperText={editingId ? 'Slug không đổi khi sửa (hoặc xóa và tạo lại)' : 'vd: cong-dong, du-lich-ben-vung'} />
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}><TextField fullWidth label="Tên (VI)" value={form.name.vi} onChange={(e) => setForm({ ...form, name: { ...form.name, vi: e.target.value } })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Tên (EN)" value={form.name.en} onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} /></Grid>
          </Grid>
          <TextField fullWidth margin="normal" type="number" label="Thứ tự hiển thị" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? '...' : 'Lưu'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
