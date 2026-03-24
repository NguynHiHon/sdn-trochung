import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, IconButton, InputAdornment,
  CircularProgress, Card, CardMedia, CardContent, Checkbox
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAllMedia } from '../../services/mediaApi';

/**
 * MediaPicker component
 * @param {boolean} open Dialog open state
 * @param {function} onClose Function to close dialog
 * @param {function} onSelect Confirm selection callback: receives (selectedIds, selectedItems)
 * @param {boolean} multiple Array selection for multiple images (gallery)
 * @param {array} defaultSelected Array of selected IDs
 * @param {boolean} nested Mở trong Dialog khác — tránh kẹt focus / không bấm được (FAQ, form lồng)
 */
function normalizeSelectedIds(defaultSelected) {
  if (defaultSelected == null || defaultSelected === "") return [];
  if (Array.isArray(defaultSelected)) {
    return defaultSelected.map((x) => String(x)).filter(Boolean);
  }
  return [String(defaultSelected)];
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  defaultSelected = [],
  nested = false,
}) {
  const [mediaList, setMediaList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchWord, setSearchWord] = useState('');

  // Track selected IDs
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (open) {
      fetchMedia();
      setSelectedIds(normalizeSelectedIds(defaultSelected));
    }
  }, [open, defaultSelected]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await getAllMedia();
      if (res && res.success) {
        setMediaList(res.data);
        setFilteredList(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch media', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchWord(val);
    const lower = val.toLowerCase();
    setFilteredList(mediaList.filter(m => m.name.toLowerCase().includes(lower) || (m.public_id && m.public_id.toLowerCase().includes(lower))));
  };

  const toggleSelect = (img) => {
    const idStr = String(img._id);
    if (multiple) {
      if (selectedIds.includes(idStr)) {
        setSelectedIds((prev) => prev.filter((id) => id !== idStr));
      } else {
        setSelectedIds((prev) => [...prev, idStr]);
      }
    } else {
      setSelectedIds([idStr]);
    }
  };

  const handleConfirm = () => {
    const selectedItems = mediaList.filter((m) => selectedIds.includes(String(m._id)));
    if (multiple) {
      onSelect(selectedIds, selectedItems);
    } else {
      const sid = selectedIds[0] || null;
      onSelect(sid, selectedItems[0] || null);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEnforceFocus={nested}
      disableAutoFocus={nested}
      sx={nested ? { zIndex: 2000 } : undefined}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">Chọn Hình Ảnh {multiple ? '(Nhiều ảnh)' : ''}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm hình ảnh theo tên..."
          value={searchWord}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />
      </Box>

      <DialogContent dividers sx={{ minHeight: 400, bgcolor: '#f1f5f9' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            {filteredList.map((img) => {
              const isSelected = selectedIds.includes(String(img._id));
              return (
                <Grid item xs={6} sm={4} md={3} key={img._id}>
                  <Card
                    elevation={isSelected ? 6 : 1}
                    sx={{
                      position: 'relative',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #2b6f56' : '1px solid transparent',
                      transition: '0.2s',
                    }}
                    onClick={() => toggleSelect(img)}
                  >
                    <CardMedia
                      component="img"
                      height="120"
                      image={img.url}
                      alt={img.filename}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="caption" noWrap display="block" color="text.secondary" title={img.name}>
                        {img.name}
                      </Typography>
                    </CardContent>

                    {isSelected && (
                      <Box sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'white', borderRadius: '50%', display: 'flex' }}>
                        <CheckCircleIcon color="primary" />
                      </Box>
                    )}
                  </Card>
                </Grid>
              );
            })}

            {filteredList.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150, width: '100%' }}>
                <Typography color="text.secondary">Không tìm thấy ảnh.</Typography>
              </Box>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          Đã chọn: <strong>{selectedIds.length}</strong> ảnh
        </Typography>
        <Button onClick={onClose} color="inherit">Hủy</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">Xác nhận</Button>
      </DialogActions>
    </Dialog>
  );
}
