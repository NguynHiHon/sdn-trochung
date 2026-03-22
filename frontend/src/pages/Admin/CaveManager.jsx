import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, IconButton, Chip, TextField, MenuItem, Pagination,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'sonner';
import { getAllCaves, deleteCave } from '../../services/caveApi';
import { useNavigate } from 'react-router-dom';

const heritageLabelMap = {
  world: 'Di sản Thế giới',
  national: 'Di sản Quốc gia',
  provincial: 'Di sản Cấp tỉnh',
  none: 'Không có'
};

export default function CaveManager() {
  const [caves, setCaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [heritageFilter, setHeritageFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => { fetchCaves(); }, []);

  const fetchCaves = async (s = search, h = heritageFilter, p = page) => {
    try {
      setLoading(true);
      const res = await getAllCaves({ search: s, heritageLevel: h, page: p, limit: 10 });
      if (res.success) {
        setCaves(res.data);
        setTotalPages(res.totalPages || 1);
        setPage(res.page || 1);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); fetchCaves(search, heritageFilter, 1); };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Xóa hang động này?')) return;
    try {
      await deleteCave(id);
      toast.success('Đã xóa');
      fetchCaves();
    } catch (err) { toast.error('Lỗi: ' + err.message); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Quản Lý Hang Động</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/manager/caves/create')} sx={{ borderRadius: 2 }}>
          Thêm Hang Động
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField size="small" label="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} sx={{ minWidth: 250, bgcolor: 'white' }} />
        <TextField size="small" select label="Cấp di sản" value={heritageFilter} onChange={(e) => setHeritageFilter(e.target.value)} sx={{ minWidth: 180, bgcolor: 'white' }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="world">Di sản Thế giới</MenuItem>
          <MenuItem value="national">Di sản Quốc gia</MenuItem>
          <MenuItem value="provincial">Di sản Cấp tỉnh</MenuItem>
          <MenuItem value="none">Không có</MenuItem>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên (VI)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên (EN)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cấp di sản</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chiều dài</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Độ sâu</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {caves.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">Không có dữ liệu</TableCell></TableRow>
                ) : caves.map((cave) => (
                  <TableRow key={cave._id} hover>
                    <TableCell>{cave.name?.vi || '—'}</TableCell>
                    <TableCell>{cave.name?.en || '—'}</TableCell>
                    <TableCell>
                      <Chip label={heritageLabelMap[cave.heritageLevel] || cave.heritageLevel} size="small"
                        color={cave.heritageLevel === 'world' ? 'error' : cave.heritageLevel === 'national' ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell>{cave.length ? `${cave.length}m` : '—'}</TableCell>
                    <TableCell>{cave.depth ? `${cave.depth}m` : '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/manager/caves/edit/${cave._id}`)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(cave._id)}><DeleteIcon color="error" fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(e, v) => { setPage(v); fetchCaves(search, heritageFilter, v); }} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
