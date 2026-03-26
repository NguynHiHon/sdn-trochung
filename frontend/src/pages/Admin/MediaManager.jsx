import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardMedia, CardContent,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Pagination
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'sonner';
import { getAllMedia, createMedia, deleteMedia, updateMedia } from '../../services/mediaApi';
import { uploadFileToCloudinarySigned } from '../../services/cloudinaryApi';

export default function MediaManager() {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'tour' });
  const [editMedia, setEditMedia] = useState(null);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedias();
  }, []);

  const fetchMedias = async (search = searchQuery, type = filterType, currentPage = page) => {
    try {
      setLoading(true);
      const res = await getAllMedia({ search, type, page: currentPage, limit: 12 });
      if (res.success) {
        setMedias(res.data);
        setTotalPages(res.totalPages || 1);
        setPage(res.page || 1);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách ảnh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchMedias(searchQuery, filterType, 1);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type?.startsWith('image/')) {
        toast.warning('Chỉ chấp nhận file ảnh');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.warning('Kích thước ảnh tối đa 10MB');
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      if (!formData.name) {
        // Tự động lấy tên file (bỏ đuôi mở rộng) làm tên ảnh tạm
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, name: nameWithoutExt }));
      }
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setFile(null);
    setPreview(null);
    setFormData({ name: '', type: 'tour' });
  };

  const handleCloseModal = () => {
    if (uploading) return;
    setOpenModal(false);
    if (preview) URL.revokeObjectURL(preview); // Clean up memory
  };

  const handleUploadSubmit = async () => {
    const normalizedName = formData.name?.trim();

    if (!file || !normalizedName) {
      toast.warning('Vui lòng chọn ảnh và nhập tên ảnh!');
      return;
    }
    if (normalizedName.length < 2 || normalizedName.length > 120) {
      toast.warning('Tên ảnh phải từ 2 đến 120 ký tự');
      return;
    }
    if (!['tour', 'banner', 'gallery', 'other'].includes(formData.type)) {
      toast.warning('Loại ảnh không hợp lệ');
      return;
    }

    try {
      setUploading(true);
      toast.info('Đang tải ảnh lên Cloudinary...');

      // 1. Tải lên Cloudinary bằng chữ ký bảo mật
      const cloudinaryResponse = await uploadFileToCloudinarySigned(file, `oxalis_${formData.type}`);
      const uploadedUrl = cloudinaryResponse.secure_url;
      const public_id = cloudinaryResponse.public_id;

      toast.info('Đang lưu thông tin vào CSDL hệ thống...');
      // 2. Lưu vào CSDL backend
      const newMediaRes = await createMedia({
        name: normalizedName,
        type: formData.type,
        url: uploadedUrl,
        public_id: public_id
      });

      if (newMediaRes.success) {
        toast.success('Thêm ảnh thành công!');
        fetchMedias(); // Refresh danh sách
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra: ' + (error.message || 'Xin thử lại'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi danh sách?')) {
      try {
        const res = await deleteMedia(id);
        if (res.success) {
          toast.success('Xóa ảnh thành công');
          setMedias(medias.filter(m => m._id !== id));
        }
      } catch (error) {
        toast.error('Xóa thất bại: ' + error.message);
      }
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép URL ảnh!');
  };

  const openEditModal = (media) => {
    setEditMedia({
      _id: media._id,
      name: media.name || '',
      type: media.type || 'other',
      url: media.url || '',
    });
  };

  const submitEditMedia = async () => {
    if (!editMedia) return;
    const normalizedName = editMedia.name?.trim();
    if (!normalizedName || normalizedName.length < 2 || normalizedName.length > 120) {
      toast.warning('Tên ảnh phải từ 2 đến 120 ký tự');
      return;
    }
    if (!['tour', 'banner', 'gallery', 'other'].includes(editMedia.type)) {
      toast.warning('Loại ảnh không hợp lệ');
      return;
    }

    setEditing(true);
    try {
      const res = await updateMedia(editMedia._id, { name: normalizedName, type: editMedia.type });
      if (res.success) {
        toast.success('Cập nhật ảnh thành công');
        setEditMedia(null);
        fetchMedias(searchQuery, filterType, page);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật ảnh');
    } finally {
      setEditing(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Thư Viện Ảnh (Media Library)</Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={handleOpenModal}
          sx={{ borderRadius: '8px', px: 3, py: 1 }}
        >
          Tải ảnh lên
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
        <TextField
          size="small"
          label="Tìm kiếm tên ảnh..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ minWidth: 250, backgroundColor: 'white', borderRadius: 1 }}
        />
        <TextField
          size="small"
          select
          label="Lọc theo loại"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ minWidth: 150, backgroundColor: 'white', borderRadius: 1 }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="tour">Tour</MenuItem>
          <MenuItem value="banner">Banner</MenuItem>
          <MenuItem value="gallery">Gallery</MenuItem>
          <MenuItem value="other">Khác</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          onClick={handleSearch}
          sx={{ height: 40 }}
        >
          Tìm kiếm
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : medias.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 5, backgroundColor: 'white', borderRadius: 2 }}>
          <Typography color="text.secondary">Không tìm thấy ảnh nào phù hợp.</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {medias.map((media) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={media._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                  <Box sx={{ position: 'relative', paddingTop: '60%' }}>
                    <CardMedia
                      component="img"
                      image={media.url}
                      alt={media.name}
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Chip
                      label={media.type}
                      size="small"
                      color={media.type === 'tour' ? 'primary' : media.type === 'banner' ? 'secondary' : 'default'}
                      sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'white' } }}
                      onClick={() => handleDelete(media._id)}
                    >
                      <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 40, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'white' } }}
                      onClick={() => openEditModal(media)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }} noWrap title={media.name}>
                      {media.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                        {media.url}
                      </Typography>
                      <IconButton size="small" onClick={() => handleCopyUrl(media.url)} title="Khóa sao chép">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {!loading && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => {
                  setPage(value);
                  fetchMedias(searchQuery, filterType, value);
                }}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Upload Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Tải Ảnh Mới Lên Thư Viện</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>

            {/* Image Preview / Picker */}
            <Box
              sx={{
                width: '100%', height: 200, border: '2px dashed #ccc', borderRadius: 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', position: 'relative', backgroundColor: '#f9fafb'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileSelect}
              />
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <>
                  <AddPhotoAlternateIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 1 }} />
                  <Typography color="text.secondary">Nhấn để chọn ảnh</Typography>
                </>
              )}
            </Box>

            <TextField
              label="Tên ảnh"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Phong Nha Cave 1"
            />

            <TextField
              label="Loại ảnh"
              select
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="tour">Tour</MenuItem>
              <MenuItem value="banner">Banner</MenuItem>
              <MenuItem value="gallery">Gallery</MenuItem>
              <MenuItem value="other">Khác</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} disabled={uploading}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleUploadSubmit}
            disabled={uploading || !file || !formData.name}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {uploading ? 'Đang xử lý...' : 'Lưu lại'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={Boolean(editMedia)} onClose={() => setEditMedia(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Chỉnh sửa thông tin ảnh</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Tên ảnh"
              fullWidth
              value={editMedia?.name || ''}
              onChange={(e) => setEditMedia((prev) => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Loại ảnh"
              select
              fullWidth
              value={editMedia?.type || 'other'}
              onChange={(e) => setEditMedia((prev) => ({ ...prev, type: e.target.value }))}
            >
              <MenuItem value="tour">Tour</MenuItem>
              <MenuItem value="banner">Banner</MenuItem>
              <MenuItem value="gallery">Gallery</MenuItem>
              <MenuItem value="other">Khác</MenuItem>
            </TextField>
            <TextField
              label="URL"
              fullWidth
              size="small"
              value={editMedia?.url || ''}
              InputProps={{ readOnly: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditMedia(null)} disabled={editing}>Hủy</Button>
          <Button variant="contained" onClick={submitEditMedia} disabled={editing}>
            {editing ? <CircularProgress size={20} color="inherit" /> : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
