import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Paper, Tabs, Tab, CircularProgress,
  Card, CardMedia, CardContent, Chip
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { createCave, getCaveById, updateCave } from '../../services/caveApi';
import { getAllMedia } from '../../services/mediaApi';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function CaveForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Nếu có id thì là chế độ sửa
  const isEdit = !!id;

  const [langTab, setLangTab] = useState(0); // 0=VI, 1=EN
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [medias, setMedias] = useState([]);
  const [mediaSearch, setMediaSearch] = useState('');

  const [form, setForm] = useState({
    name: { vi: '', en: '' },
    description: { vi: '', en: '' },
    address: { vi: '', en: '' },
    system: { vi: '', en: '' },
    location: { lat: '', lng: '' },
    length: '',
    depth: '',
    heritageLevel: 'none',
    thumbnail: '',
    gallery: [],
  });

  useEffect(() => {
    // Load danh sách ảnh cho dropdown chọn thumbnail
    getAllMedia({ limit: 200 }).then(res => {
      if (res.success) setMedias(res.data);
    }).catch(() => { });

    if (isEdit) {
      getCaveById(id).then(res => {
        if (res.success) {
          const c = res.data;
          setForm({
            name: c.name || { vi: '', en: '' },
            description: c.description || { vi: '', en: '' },
            address: c.address || { vi: '', en: '' },
            system: c.system || { vi: '', en: '' },
            location: { lat: c.location?.lat || '', lng: c.location?.lng || '' },
            length: c.length || '',
            depth: c.depth || '',
            heritageLevel: c.heritageLevel || 'none',
            thumbnail: c.thumbnail?._id || c.thumbnail || '',
            gallery: (c.gallery || []).map(g => g._id || g),
          });
        }
      }).catch(err => toast.error('Lỗi tải dữ liệu: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const setBilingual = (field, lang, value) => {
    setForm(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  const filteredMedias = medias.filter((m) => {
    const keyword = mediaSearch.trim().toLowerCase();
    if (!keyword) return true;
    return `${m.name || ''} ${m.type || ''}`.toLowerCase().includes(keyword);
  });

  const toggleGalleryMedia = (mediaId) => {
    setForm((prev) => {
      const exists = prev.gallery.includes(mediaId);
      return {
        ...prev,
        gallery: exists ? prev.gallery.filter((id) => id !== mediaId) : [...prev.gallery, mediaId],
      };
    });
  };

  const parseOptionalNumber = (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  };

  const handleSubmit = async () => {
    if (!form.name.vi?.trim() || !form.name.en?.trim()) {
      toast.warning('Vui lòng nhập tên hang động cả Tiếng Việt và Tiếng Anh');
      return;
    }

    const latRaw = form.location?.lat;
    const lngRaw = form.location?.lng;
    const hasLat = latRaw !== '' && latRaw !== null && latRaw !== undefined;
    const hasLng = lngRaw !== '' && lngRaw !== null && lngRaw !== undefined;

    if (hasLat !== hasLng) {
      toast.warning('Vui lòng nhập đồng thời cả vĩ độ và kinh độ');
      return;
    }

    const lat = parseOptionalNumber(latRaw);
    const lng = parseOptionalNumber(lngRaw);
    const length = parseOptionalNumber(form.length);
    const depth = parseOptionalNumber(form.depth);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.warning('Kinh độ/vĩ độ phải là số hợp lệ');
      return;
    }
    if (lat !== undefined && (lat < -90 || lat > 90)) {
      toast.warning('Vĩ độ (Lat) phải trong khoảng -90 đến 90');
      return;
    }
    if (lng !== undefined && (lng < -180 || lng > 180)) {
      toast.warning('Kinh độ (Lng) phải trong khoảng -180 đến 180');
      return;
    }

    if (Number.isNaN(length) || (length !== undefined && length < 0)) {
      toast.warning('Chiều dài phải là số không âm');
      return;
    }
    if (Number.isNaN(depth) || (depth !== undefined && depth < 0)) {
      toast.warning('Độ sâu phải là số không âm');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        name: {
          vi: form.name.vi.trim(),
          en: form.name.en.trim(),
        },
        length,
        depth,
        location: hasLat && hasLng ? { lat, lng } : undefined,
        thumbnail: form.thumbnail || undefined,
        gallery: form.gallery.length > 0 ? form.gallery : undefined,
      };

      if (isEdit) {
        await updateCave(id, payload);
        toast.success('Cập nhật hang động thành công!');
      } else {
        await createCave(payload);
        toast.success('Thêm hang động thành công!');
      }
      navigate('/manager/caves');
    } catch (err) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        {isEdit ? 'Chỉnh sửa Hang Động' : 'Thêm Hang Động Mới'}
      </Typography>

      {/* Tab chuyển ngôn ngữ */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Thông tin cơ bản (Song ngữ)</Typography>
        <Tabs value={langTab} onChange={(e, v) => setLangTab(v)} sx={{ mb: 2 }}>
          <Tab label="🇻🇳 Tiếng Việt" />
          <Tab label="🇬🇧 English" />
        </Tabs>

        <TabPanel value={langTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Tên hang động (VI)" required value={form.name.vi} onChange={e => setBilingual('name', 'vi', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Mô tả (VI)" multiline rows={3} value={form.description.vi} onChange={e => setBilingual('description', 'vi', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Địa chỉ (VI)" value={form.address.vi} onChange={e => setBilingual('address', 'vi', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Hệ thống hang (VI)" value={form.system.vi} onChange={e => setBilingual('system', 'vi', e.target.value)} /></Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={langTab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Cave Name (EN)" required value={form.name.en} onChange={e => setBilingual('name', 'en', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description (EN)" multiline rows={3} value={form.description.en} onChange={e => setBilingual('description', 'en', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Address (EN)" value={form.address.en} onChange={e => setBilingual('address', 'en', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Cave System (EN)" value={form.system.en} onChange={e => setBilingual('system', 'en', e.target.value)} /></Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Thông số kỹ thuật */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Thông số kỹ thuật</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="Chiều dài (m)" type="number" value={form.length} onChange={e => setForm({ ...form, length: e.target.value })} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="Độ sâu (m)" type="number" value={form.depth} onChange={e => setForm({ ...form, depth: e.target.value })} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="Vĩ độ (Lat)" type="number" inputProps={{ step: 'any', min: -90, max: 90 }} value={form.location.lat} onChange={e => setForm({ ...form, location: { ...form.location, lat: e.target.value } })} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="Kinh độ (Lng)" type="number" inputProps={{ step: 'any', min: -180, max: 180 }} value={form.location.lng} onChange={e => setForm({ ...form, location: { ...form.location, lng: e.target.value } })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth select label="Cấp độ di sản" value={form.heritageLevel} onChange={e => setForm({ ...form, heritageLevel: e.target.value })}>
              <MenuItem value="world">Di sản Thế giới</MenuItem>
              <MenuItem value="national">Di sản Quốc gia</MenuItem>
              <MenuItem value="provincial">Di sản Cấp tỉnh</MenuItem>
              <MenuItem value="none">Không có</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Ảnh đại diện */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Chọn ảnh cho hang động</Typography>
        <TextField
          fullWidth
          size="small"
          label="Tìm ảnh theo tên hoặc loại"
          value={mediaSearch}
          onChange={(e) => setMediaSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        {form.thumbnail && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Thumbnail hiện tại</Typography>
            <Card sx={{ maxWidth: 340 }}>
              <CardMedia
                component="img"
                height="180"
                image={medias.find((m) => m._id === form.thumbnail)?.url || ''}
                alt="Thumbnail"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>{medias.find((m) => m._id === form.thumbnail)?.name || 'Ảnh đã chọn'}</Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        <Grid container spacing={2}>
          {filteredMedias.map((m) => {
            const isThumbnail = form.thumbnail === m._id;
            const inGallery = form.gallery.includes(m._id);
            return (
              <Grid item xs={12} sm={6} md={4} key={m._id}>
                <Card sx={{ border: isThumbnail ? '2px solid #1976d2' : '1px solid #e2e8f0' }}>
                  <CardMedia component="img" height="160" image={m.url} alt={m.name} sx={{ objectFit: 'cover' }} />
                  <CardContent>
                    <Typography variant="subtitle2" noWrap title={m.name}>{m.name}</Typography>
                    <Chip size="small" label={m.type} sx={{ mt: 0.5, mb: 1 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant={isThumbnail ? 'contained' : 'outlined'}
                        onClick={() => setForm((prev) => ({ ...prev, thumbnail: isThumbnail ? '' : m._id }))}
                      >
                        {isThumbnail ? 'Đang là thumbnail' : 'Đặt thumbnail'}
                      </Button>
                      <Button
                        size="small"
                        variant={inGallery ? 'contained' : 'outlined'}
                        color="secondary"
                        onClick={() => toggleGalleryMedia(m._id)}
                      >
                        {inGallery ? 'Bỏ gallery' : 'Thêm gallery'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/manager/caves')}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? <CircularProgress size={20} color="inherit" /> : (isEdit ? 'Cập nhật' : 'Lưu lại')}
        </Button>
      </Box>
    </Box>
  );
}
