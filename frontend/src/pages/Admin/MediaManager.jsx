import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardMedia, CardContent,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Pagination
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
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
  const [formData, setFormData] = useState({ name: '', title: '', type: 'tour' });
  const [uploadErrors, setUploadErrors] = useState({});
  const [editDialog, setEditDialog] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', title: '' });
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
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
    setFormData({ name: '', title: '', type: 'tour' });
    setUploadErrors({});
  };

  const handleCloseModal = () => {
    if (uploading) return;
    setOpenModal(false);
    if (preview) URL.revokeObjectURL(preview); // Clean up memory
  };

  const handleUploadSubmit = async () => {
    const nextErrors = {};
    if (!file) nextErrors.file = 'Vui lòng chọn ảnh';
    if (!formData.name?.trim()) nextErrors.name = 'Tên ảnh là bắt buộc';
    if (!formData.type) nextErrors.type = 'Loại ảnh là bắt buộc';
    setUploadErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning('Vui lòng kiểm tra các trường đang báo đỏ trước khi tải ảnh');
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
        name: formData.name,
        title: formData.title,
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

  const handleOpenEdit = (media) => {
    setEditDialog(media);
    setEditForm({
      name: media.name || '',
      title: media.title || '',
    });
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editDialog) return;
    const nextErrors = {};
    if (!editForm.name.trim()) nextErrors.name = 'Tên ảnh không được để trống';
    setEditErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning('Vui lòng kiểm tra các trường đang báo đỏ trước khi lưu');
      return;
    }

    try {
      setSavingEdit(true);
      const res = await updateMedia(editDialog._id, {
        name: editForm.name.trim(),
        title: editForm.title.trim(),
      });

      if (res.success) {
        setMedias((prev) => prev.map((m) => (m._id === editDialog._id ? res.data : m)));
        setEditDialog(null);
        toast.success('Đã cập nhật tên/tiêu đề ảnh');
      }
    } catch (error) {
      toast.error('Cập nhật thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setSavingEdit(false);
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
                      sx={{ position: 'absolute', top: 8, right: 44, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'white' } }}
                      onClick={() => handleOpenEdit(media)}
                    >
                      <EditIcon color="primary" fontSize="small" />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }} noWrap title={media.name}>
                      {media.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }} noWrap title={media.title || 'Chưa có tiêu đề'}>
                      {media.title || 'Chưa có tiêu đề'}
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
            {!!uploadErrors.file && (
              <Typography variant="body2" color="error">{uploadErrors.file}</Typography>
            )}

            <TextField
              label="Tên ảnh"
              fullWidth
              required
              value={formData.name}
              error={!!uploadErrors.name}
              helperText={uploadErrors.name || ''}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setUploadErrors((prev) => {
                  if (!prev.name) return prev;
                  const next = { ...prev };
                  delete next.name;
                  return next;
                });
              }}
              placeholder="VD: Phong Nha Cave 1"
            />

            <TextField
              label="Tiêu đề ảnh (tuỳ chọn)"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Cửa hang nhìn từ trên cao"
            />

            <TextField
              label="Loại ảnh"
              select
              fullWidth
              value={formData.type}
              error={!!uploadErrors.type}
              helperText={uploadErrors.type || ''}
              onChange={(e) => {
                setFormData({ ...formData, type: e.target.value });
                setUploadErrors((prev) => {
                  if (!prev.type) return prev;
                  const next = { ...prev };
                  delete next.type;
                  return next;
                });
              }}
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

      <Dialog open={Boolean(editDialog)} onClose={() => !savingEdit && setEditDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Sửa thông tin ảnh</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Tên ảnh"
              fullWidth
              required
              value={editForm.name}
              error={!!editErrors.name}
              helperText={editErrors.name || ''}
              onChange={(e) => {
                setEditForm((prev) => ({ ...prev, name: e.target.value }));
                setEditErrors((prev) => {
                  if (!prev.name) return prev;
                  const next = { ...prev };
                  delete next.name;
                  return next;
                });
              }}
            />
            <TextField
              label="Tiêu đề ảnh"
              fullWidth
              value={editForm.title}
              onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialog(null)} disabled={savingEdit}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={savingEdit || !editForm.name.trim()}>
            {savingEdit ? <CircularProgress size={20} color="inherit" /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
