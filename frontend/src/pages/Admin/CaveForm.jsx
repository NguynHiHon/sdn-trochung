import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Paper, Tabs, Tab, CircularProgress, Autocomplete
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
  const [errors, setErrors] = useState({});

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
    setErrors((prev) => {
      const next = { ...prev };
      const key = `${field}.${lang}`;
      if (next[key]) delete next[key];
      return next;
    });
  };

  const setFieldErrorClear = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.vi?.trim()) nextErrors['name.vi'] = 'Tên hang động (VI) là bắt buộc';
    if (!form.name.en?.trim()) nextErrors['name.en'] = 'Tên hang động (EN) là bắt buộc';

    const hasLat = form.location.lat !== '' && form.location.lat !== null && form.location.lat !== undefined;
    const hasLng = form.location.lng !== '' && form.location.lng !== null && form.location.lng !== undefined;
    if (hasLat !== hasLng) {
      nextErrors['location.lat'] = 'Cần nhập đủ cả vĩ độ và kinh độ';
      nextErrors['location.lng'] = 'Cần nhập đủ cả vĩ độ và kinh độ';
    }

    if (hasLat && hasLng) {
      const lat = Number(form.location.lat);
      const lng = Number(form.location.lng);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        nextErrors['location.lat'] = 'Vĩ độ phải nằm trong khoảng -90 đến 90';
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        nextErrors['location.lng'] = 'Kinh độ phải nằm trong khoảng -180 đến 180';
      }
    }

    if (form.length !== '' && (!Number.isFinite(Number(form.length)) || Number(form.length) < 0)) {
      nextErrors.length = 'Chiều dài phải là số >= 0';
    }
    if (form.depth !== '' && (!Number.isFinite(Number(form.depth)) || Number(form.depth) < 0)) {
      nextErrors.depth = 'Độ sâu phải là số >= 0';
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning('Vui lòng kiểm tra các trường đang báo đỏ trước khi lưu');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        length: form.length ? Number(form.length) : undefined,
        depth: form.depth ? Number(form.depth) : undefined,
        location: (form.location.lat && form.location.lng) ? { lat: Number(form.location.lat), lng: Number(form.location.lng) } : undefined,
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
            <Grid item xs={12}><TextField fullWidth label="Tên hang động (VI)" required value={form.name.vi} error={!!errors['name.vi']} helperText={errors['name.vi'] || ''} onChange={e => setBilingual('name', 'vi', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Mô tả (VI)" multiline rows={3} value={form.description.vi} onChange={e => setBilingual('description', 'vi', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Địa chỉ (VI)" value={form.address.vi} onChange={e => setBilingual('address', 'vi', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Hệ thống hang (VI)" value={form.system.vi} onChange={e => setBilingual('system', 'vi', e.target.value)} /></Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={langTab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Cave Name (EN)" required value={form.name.en} error={!!errors['name.en']} helperText={errors['name.en'] || ''} onChange={e => setBilingual('name', 'en', e.target.value)} /></Grid>
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
            <TextField fullWidth label="Chiều dài (m)" type="number" value={form.length} error={!!errors.length} helperText={errors.length || ''} onChange={e => { setForm({ ...form, length: e.target.value }); setFieldErrorClear('length'); }} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="Độ sâu (m)" type="number" value={form.depth} error={!!errors.depth} helperText={errors.depth || ''} onChange={e => { setForm({ ...form, depth: e.target.value }); setFieldErrorClear('depth'); }} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="Vĩ độ (Lat)" type="number" value={form.location.lat} error={!!errors['location.lat']} helperText={errors['location.lat'] || ''} onChange={e => { setForm({ ...form, location: { ...form.location, lat: e.target.value } }); setFieldErrorClear('location.lat'); }} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="Kinh độ (Lng)" type="number" value={form.location.lng} error={!!errors['location.lng']} helperText={errors['location.lng'] || ''} onChange={e => { setForm({ ...form, location: { ...form.location, lng: e.target.value } }); setFieldErrorClear('location.lng'); }} />
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
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Ảnh từ Thư Viện</Typography>
        <Autocomplete
          fullWidth
          options={medias}
          value={medias.find((m) => m._id === form.thumbnail) || null}
          onChange={(_, value) => setForm({ ...form, thumbnail: value?._id || '' })}
          ListboxProps={{ style: { maxHeight: 520 } }}
          getOptionLabel={(option) => {
            const title = option.title ? ` - ${option.title}` : '';
            return `${option.name}${title} (${option.type})`;
          }}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option._id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
              <Box
                component="img"
                src={option.url}
                alt={option.name}
                sx={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 1, border: '1px solid #e2e8f0', flexShrink: 0 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>
                  {option.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {option.title || 'Chưa có tiêu đề'} • {option.type}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Ảnh đại diện (Thumbnail) - tìm kiếm" placeholder="Nhập tên hoặc tiêu đề ảnh..." />
          )}
          noOptionsText="Không tìm thấy ảnh"
        />
        {!!form.thumbnail && (
          <Box sx={{ mt: 2, p: 1.5, border: '1px dashed #cbd5e1', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src={medias.find((m) => m._id === form.thumbnail)?.url}
              alt={medias.find((m) => m._id === form.thumbnail)?.name || 'thumbnail'}
              sx={{ width: 140, height: 96, objectFit: 'cover', borderRadius: 1, border: '1px solid #e2e8f0' }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {medias.find((m) => m._id === form.thumbnail)?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {medias.find((m) => m._id === form.thumbnail)?.title || 'Chưa có tiêu đề'}
              </Typography>
            </Box>
          </Box>
        )}
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
