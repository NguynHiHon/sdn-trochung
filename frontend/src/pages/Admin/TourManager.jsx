import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, IconButton, Chip, TextField, MenuItem, Pagination,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'sonner';
import { getAllTours, deleteTour } from '../../services/tourApi';
import { getAllCaves } from '../../services/caveApi';
import { useNavigate } from 'react-router-dom';

const statusMap = { draft: 'Nháp', published: 'Đã xuất bản', archived: 'Lưu trữ' };
const statusColor = { draft: 'default', published: 'success', archived: 'warning' };

export default function TourManager() {
  const [tours, setTours] = useState([]);
  const [caves, setCaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [caveFilter, setCaveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTours();
    getAllCaves({ limit: 100 }).then(res => { if (res.success) setCaves(res.data); }).catch(() => {});
  }, []);

  const fetchTours = async (s = search, st = statusFilter, cv = caveFilter, p = page) => {
    try {
      setLoading(true);
      const res = await getAllTours({ search: s, status: st, caveId: cv, page: p, limit: 10 });
      if (res.success) {
        setTours(res.data);
        setTotalPages(res.totalPages || 1);
        setPage(res.page || 1);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); fetchTours(search, statusFilter, caveFilter, 1); };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tour này?')) return;
    try {
      await deleteTour(id);
      toast.success('Đã xóa tour');
      fetchTours();
    } catch (err) { toast.error('Lỗi: ' + err.message); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Quản Lý Tour</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/manager/tours/create')} sx={{ borderRadius: 2 }}>
          Thêm Tour
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField size="small" label="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} sx={{ minWidth: 220, bgcolor: 'white' }} />
        <TextField size="small" select label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="draft">Nháp</MenuItem>
          <MenuItem value="published">Đã xuất bản</MenuItem>
          <MenuItem value="archived">Lưu trữ</MenuItem>
        </TextField>
        <TextField size="small" select label="Hang động" value={caveFilter} onChange={(e) => setCaveFilter(e.target.value)} sx={{ minWidth: 200, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả</MenuItem>
          {caves.map(c => <MenuItem key={c._id} value={c._id}>{c.name?.vi || c.name?.en}</MenuItem>)}
        </TextField>
        <Button variant="outlined" onClick={handleSearch} startIcon={<SearchIcon />}>Tìm</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mã</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên (VI)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên (EN)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Giá VNĐ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số ngày</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Hang động</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tours.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center">Không có dữ liệu</TableCell></TableRow>
                ) : tours.map((tour) => (
                  <TableRow key={tour._id} hover>
                    <TableCell>{tour.code}</TableCell>
                    <TableCell>{tour.name?.vi || '—'}</TableCell>
                    <TableCell>{tour.name?.en || '—'}</TableCell>
                    <TableCell>{tour.priceVND?.toLocaleString('vi-VN')}₫</TableCell>
                    <TableCell>{tour.durationDays}</TableCell>
                    <TableCell>{tour.caveId?.name?.vi || '—'}</TableCell>
                    <TableCell>
                      <Chip label={statusMap[tour.status]} size="small" color={statusColor[tour.status]} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/manager/tours/edit/${tour._id}`)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(tour._id)}><DeleteIcon color="error" fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(e, v) => { setPage(v); fetchTours(search, statusFilter, caveFilter, v); }} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
