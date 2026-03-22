import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, Chip, TextField, MenuItem, Pagination,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, IconButton, Tooltip, Alert
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'sonner';
import { getAllUsers, createUser, updateUser, toggleActive, resetPassword, deleteUser } from '../../services/userApi';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Nhân viên' },
];

const emptyForm = { username: '', password: '', role: 'staff', fullName: '', email: '', phone: '' };

export default function AccountManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Reset password dialog
  const [resetDialog, setResetDialog] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers({ role: filterRole, page, limit: 15, search });
      if (res.success) {
        setUsers(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch {
      toast.error('Lỗi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, filterRole, search]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: '', // don't show password
      role: user.role,
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        const { password, ...data } = form;
        const res = await updateUser(editingUser._id, data);
        if (res.success) { toast.success(res.message); setOpenDialog(false); fetchUsers(); }
      } else {
        if (!form.username || !form.password) return toast.error('Username và mật khẩu là bắt buộc');
        const res = await createUser(form);
        if (res.success) { toast.success(res.message); setOpenDialog(false); fetchUsers(); }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await toggleActive(user._id);
      if (res.success) { toast.success(res.message); fetchUsers(); }
    } catch {
      toast.error('Lỗi');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 4) return toast.error('Mật khẩu phải ít nhất 4 ký tự');
    try {
      const res = await resetPassword(resetDialog._id, newPassword);
      if (res.success) { toast.success(res.message); setResetDialog(null); setNewPassword(''); }
    } catch {
      toast.error('Lỗi');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteUser(deleteDialog._id);
      if (res.success) { toast.success(res.message); setDeleteDialog(null); fetchUsers(); }
    } catch {
      toast.error('Lỗi xoá tài khoản');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Quản lý Tài khoản</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpenCreate}
          sx={{ bgcolor: '#2b6f56', '&:hover': { bgcolor: '#1a5a3e' } }}>
          Tạo tài khoản
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Tìm kiếm..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: '#999', mr: 1 }} /> }}
          sx={{ minWidth: 250 }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select value={filterRole} label="Role" onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
            <MenuItem value="all">Tất cả</MenuItem>
            {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
          </Select>
        </FormControl>
        <Chip label={`${total} tài khoản`} variant="outlined" />
      </Paper>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Họ tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>SĐT</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u._id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{u.username}</TableCell>
                    <TableCell>{u.fullName || '—'}</TableCell>
                    <TableCell>{u.email || '—'}</TableCell>
                    <TableCell>{u.phone || '—'}</TableCell>
                    <TableCell>
                      <Chip label={u.role === 'admin' ? 'Admin' : 'Nhân viên'} size="small"
                        color={u.role === 'admin' ? 'primary' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Chip label={u.isActive ? 'Hoạt động' : 'Bị khoá'} size="small"
                        color={u.isActive ? 'success' : 'error'} variant="outlined" />
                    </TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Sửa"><IconButton size="small" onClick={() => handleOpenEdit(u)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title={u.isActive ? 'Khoá' : 'Mở khoá'}>
                        <IconButton size="small" onClick={() => handleToggleActive(u)} color={u.isActive ? 'error' : 'success'}>
                          {u.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Đặt lại mật khẩu"><IconButton size="small" onClick={() => setResetDialog(u)}><LockResetIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Xoá"><IconButton size="small" color="error" onClick={() => setDeleteDialog(u)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: '#999' }}>Không có tài khoản nào</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{editingUser ? 'Sửa tài khoản' : 'Tạo tài khoản mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Username" value={form.username} disabled={!!editingUser}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} fullWidth size="small" />
            {!editingUser && (
              <TextField label="Mật khẩu" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} fullWidth size="small" />
            )}
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={form.role} label="Role" onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Họ tên" value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} fullWidth size="small" />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth size="small" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="SĐT" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Huỷ</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#2b6f56', '&:hover': { bgcolor: '#1a5a3e' } }}>
            {saving ? <CircularProgress size={20} /> : (editingUser ? 'Lưu' : 'Tạo')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetDialog} onClose={() => setResetDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Đặt lại mật khẩu</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>Đặt lại mật khẩu cho: <strong>{resetDialog?.username}</strong></Alert>
          <TextField label="Mật khẩu mới" type="password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)} fullWidth size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(null)}>Huỷ</Button>
          <Button variant="contained" color="warning" onClick={handleResetPassword}>Đặt lại</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xoá</DialogTitle>
        <DialogContent>
          <Alert severity="error">Bạn có chắc muốn xoá tài khoản <strong>{deleteDialog?.username}</strong>? Hành động này không thể hoàn tác.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Huỷ</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Xoá</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
