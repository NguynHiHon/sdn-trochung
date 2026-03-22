import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Paper, Tabs, Tab,
  CircularProgress, IconButton, Switch, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { createTour, getTourById, updateTour } from '../../services/tourApi';
import { getAllCaves } from '../../services/caveApi';
import MediaPicker from '../../components/common/MediaPicker';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function TourForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [langTab, setLangTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [caves, setCaves] = useState([]);
  
  // Media Picker Logic
  const [pickerConfig, setPickerConfig] = useState({ open: false, type: '', multiple: false });

  const [form, setForm] = useState({
    name: { vi: '', en: '' },
    code: '',
    slug: '',
    description: { vi: '', en: '' },
    priceVND: '',
    priceUSD: '',
    durationDays: '',
    adventureLevel: 1,
    tourType: 'multiday',
    categoryId: '',
    caveId: '',
    thumbnail: '',
    banner: '',
    gallery: [],
    groupSize: '',
    ageMin: '',
    ageMax: '',
    itinerary: [],
    highlights: { vi: '', en: '' },
    weatherAndClimate: { vi: '', en: '' },
    adventureLevelDescription: { vi: '', en: '' },
    safetyOnTour: { vi: '', en: '' },
    communicationOnTour: { vi: '', en: '' },
    whatToBring: { vi: '', en: '' },
    swimmingAtCampsites: { vi: '', en: '' },
    toiletAtCampsites: { vi: '', en: '' },
    directionsToPhongNha: { vi: '', en: '' },
    tourBookingProcess: { vi: '', en: '' },
    priceIncludes: { vi: '', en: '' },
    bookingConditions: { vi: '', en: '' },
    healthRequirements: { vi: '', en: '' },
    cancellationPolicy: { vi: '', en: '' },
    faqs: [],
    status: 'draft',
    isFeatured: false,
    seo: {
      metaTitle: { vi: '', en: '' },
      metaDescription: { vi: '', en: '' },
    }
  });

  useEffect(() => {
    getAllCaves({ limit: 100 }).then(res => { if (res.success) setCaves(res.data); });

    if (isEdit) {
      getTourById(id).then(res => {
        if (res.success) {
          const t = res.data;
          setForm(prev => ({
            ...prev,
            ...t,
            name: t.name || { vi: '', en: '' },
            description: t.description || { vi: '', en: '' },
            tourType: t.tourType || 'multiday',
            categoryId: t.categoryId?._id || t.categoryId || '',
            caveId: t.caveId?._id || t.caveId || '',
            thumbnail: t.thumbnail?._id || t.thumbnail || '',
            banner: t.banner?._id || t.banner || '',
            gallery: (t.gallery || []).map(g => g._id || g),
            itinerary: t.itinerary || [],
            highlights: t.highlights || { vi: '', en: '' },
            weatherAndClimate: t.weatherAndClimate || { vi: '', en: '' },
            adventureLevelDescription: t.adventureLevelDescription || { vi: '', en: '' },
            safetyOnTour: t.safetyOnTour || { vi: '', en: '' },
            communicationOnTour: t.communicationOnTour || { vi: '', en: '' },
            whatToBring: t.whatToBring || { vi: '', en: '' },
            swimmingAtCampsites: t.swimmingAtCampsites || { vi: '', en: '' },
            toiletAtCampsites: t.toiletAtCampsites || { vi: '', en: '' },
            directionsToPhongNha: t.directionsToPhongNha || { vi: '', en: '' },
            tourBookingProcess: t.tourBookingProcess || { vi: '', en: '' },
            priceIncludes: t.priceIncludes || { vi: '', en: '' },
            bookingConditions: t.bookingConditions || { vi: '', en: '' },
            healthRequirements: t.healthRequirements || { vi: '', en: '' },
            cancellationPolicy: t.cancellationPolicy || { vi: '', en: '' },
            faqs: t.faqs || [],
            seo: t.seo || { metaTitle: { vi: '', en: '' }, metaDescription: { vi: '', en: '' } },
          }));
        }
      }).catch(err => toast.error('Lỗi tải dữ liệu: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const setBilingual = (field, lang, value) => {
    setForm(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  const setSeoField = (field, lang, value) => {
    setForm(prev => ({
      ...prev, seo: { ...prev.seo, [field]: { ...prev.seo[field], [lang]: value } }
    }));
  };

  // Itinerary
  const addItineraryDay = () => setForm(prev => ({
    ...prev, itinerary: [...prev.itinerary, { dayNumber: prev.itinerary.length + 1, title: { vi: '', en: '' }, content: { vi: '', en: '' } }]
  }));
  const updateItinerary = (index, field, lang, value) => setForm(prev => {
    const copy = [...prev.itinerary];
    copy[index] = { ...copy[index], [field]: { ...copy[index][field], [lang]: value } };
    return { ...prev, itinerary: copy };
  });
  const removeItineraryDay = (index) => setForm(prev => ({
    ...prev, itinerary: prev.itinerary.filter((_, i) => i !== index).map((item, i) => ({ ...item, dayNumber: i + 1 }))
  }));

  // FAQs
  const addFaq = () => setForm(prev => ({
    ...prev, faqs: [...prev.faqs, { question: { vi: '', en: '' }, answer: { vi: '', en: '' } }]
  }));
  const updateFaq = (index, field, lang, value) => setForm(prev => {
    const copy = [...prev.faqs];
    copy[index] = { ...copy[index], [field]: { ...copy[index][field], [lang]: value } };
    return { ...prev, faqs: copy };
  });
  const removeFaq = (index) => setForm(prev => ({
    ...prev, faqs: prev.faqs.filter((_, i) => i !== index)
  }));

  // Media Picker Handler
  const handleMediaSelect = (selectedIdOrArr, selectedItems) => {
    if (pickerConfig.type === 'thumbnail') {
      setForm(prev => ({ ...prev, thumbnail: selectedIdOrArr }));
    } else if (pickerConfig.type === 'banner') {
      setForm(prev => ({ ...prev, banner: selectedIdOrArr }));
    } else if (pickerConfig.type === 'gallery') {
      setForm(prev => ({ ...prev, gallery: selectedIdOrArr }));
    }
  };

  const handleSubmit = async () => {
    if (!form.name.vi || !form.name.en || !form.code || !form.slug || !form.priceVND) {
      toast.warning('Vui lòng điền đủ các trường bắt buộc (Tên, Mã, Slug, Giá)');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      
      payload.priceVND = Number(payload.priceVND);
      if (payload.priceUSD) payload.priceUSD = Number(payload.priceUSD);
      payload.durationDays = Number(payload.durationDays);
      payload.adventureLevel = Number(payload.adventureLevel);
      if (payload.groupSize) payload.groupSize = Number(payload.groupSize);
      if (payload.ageMin) payload.ageMin = Number(payload.ageMin);
      if (payload.ageMax) payload.ageMax = Number(payload.ageMax);
      
      if (!payload.categoryId) delete payload.categoryId;
      if (!payload.caveId) delete payload.caveId;
      if (!payload.thumbnail) delete payload.thumbnail;
      if (!payload.banner) delete payload.banner;
      if (!payload.gallery || payload.gallery.length === 0) delete payload.gallery;

      if (isEdit) {
        await updateTour(id, payload);
        toast.success('Cập nhật tour thành công!');
      } else {
        await createTour(payload);
        toast.success('Thêm tour thành công!');
      }
      navigate('/manager/tours');
    } catch (err) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  const lang = langTab === 0 ? 'vi' : 'en';

  const renderBilingualField = (label, fieldKey, multiline = false, rows = 3) => (
    <TextField
      fullWidth
      label={`${label} (${lang === 'vi' ? 'VI' : 'EN'})`}
      multiline={multiline}
      rows={multiline ? rows : 1}
      value={form[fieldKey][lang] || ''}
      onChange={e => setBilingual(fieldKey, lang, e.target.value)}
      sx={{ mb: 2 }}
    />
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{isEdit ? 'Chỉnh sửa Tour' : 'Thêm Tour Mới'}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/manager/tours')}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Lưu Lại'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ position: 'sticky', top: 60, bgcolor: '#f8fafc', zIndex: 10, pb: 2, borderBottom: '1px solid #e2e8f0', mb: 3 }}>
        <Tabs value={langTab} onChange={(e, v) => setLangTab(v)} textColor="primary" indicatorColor="primary">
          <Tab label="🇻🇳 Tiết Việt" sx={{ fontWeight: 'bold' }} />
          <Tab label="🇬🇧 English" sx={{ fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      {/* Accordion 1: Thông tin cơ bản */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">1. Thông số Cơ Bản</Typography></AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>{renderBilingualField('Tên Tour', 'name')}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Mô tả ngắn', 'description')}</Grid>
            
            <Grid item xs={3}><TextField fullWidth size="small" label="Mã tour" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField fullWidth size="small" label="Slug (URL)" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField fullWidth size="small" label="Giá (VNĐ)" type="number" required value={form.priceVND} onChange={e => setForm({ ...form, priceVND: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField fullWidth size="small" label="Giá (USD)" type="number" value={form.priceUSD} onChange={e => setForm({ ...form, priceUSD: e.target.value })} /></Grid>
            
            <Grid item xs={2}><TextField fullWidth size="small" label="Số ngày" type="number" required value={form.durationDays} onChange={e => setForm({ ...form, durationDays: e.target.value })} /></Grid>
            <Grid item xs={2}>
              <TextField fullWidth size="small" select label="Độ khó (1-6)" value={form.adventureLevel} onChange={e => setForm({ ...form, adventureLevel: e.target.value })}>
                {[1, 2, 3, 4, 5, 6].map(n => <MenuItem key={n} value={n}>Level {n}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={2}><TextField fullWidth size="small" label="Người/Tour" type="number" value={form.groupSize} onChange={e => setForm({ ...form, groupSize: e.target.value })} /></Grid>
            <Grid item xs={2}><TextField fullWidth size="small" label="Tuổi Min" type="number" value={form.ageMin} onChange={e => setForm({ ...form, ageMin: e.target.value })} /></Grid>
            <Grid item xs={2}><TextField fullWidth size="small" label="Tuổi Max" type="number" value={form.ageMax} onChange={e => setForm({ ...form, ageMax: e.target.value })} /></Grid>
            
            <Grid item xs={2}>
              <TextField fullWidth size="small" select label="Loại Tour" value={form.tourType} onChange={e => setForm({ ...form, tourType: e.target.value })}>
                <MenuItem value="multiday">Tour dài ngày</MenuItem>
                <MenuItem value="overnight">Tour qua đêm</MenuItem>
                <MenuItem value="daytour">Tour trong ngày</MenuItem>
                <MenuItem value="family">Tour gia đình</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth size="small" select label="Hang động Trọng tâm" value={form.caveId} onChange={e => setForm({ ...form, caveId: e.target.value })}>
                <MenuItem value="">-- Không chọn --</MenuItem>
                {caves.map(c => <MenuItem key={c._id} value={c._id}>{c.name?.vi || c.code}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth size="small" select label="Trạng thái" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="draft">Nháp</MenuItem>
                <MenuItem value="published">Xuất bản</MenuItem>
                <MenuItem value="archived">Lưu trữ</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel control={<Switch checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />} label="Đánh dấu Nổi Bật" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 2: Thư viện Ảnh */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">2. Hình Ảnh, Banner & Gallery</Typography></AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <Typography variant="body2" mb={1} fontWeight="bold">Thumbnail (Ảnh vuông/Vuông đại diện)</Typography>
              <Button variant="outlined" startIcon={<PhotoLibraryIcon/>} fullWidth onClick={() => setPickerConfig({ open: true, type: 'thumbnail', multiple: false })}>
                {form.thumbnail ? 'Đổi Thumbnail' : 'Chọn Thumbnail'}
              </Button>
              {form.thumbnail && <Typography variant="caption" color="success.main" display="block" mt={1}>Đã chọn 1 ảnh</Typography>}
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" mb={1} fontWeight="bold">Banner Cover (Dành cho Tour Detail)</Typography>
              <Button variant="outlined" color="secondary" startIcon={<PhotoLibraryIcon/>} fullWidth onClick={() => setPickerConfig({ open: true, type: 'banner', multiple: false })}>
                {form.banner ? 'Đổi Banner' : 'Chọn Banner'}
              </Button>
              {form.banner && <Typography variant="caption" color="success.main" display="block" mt={1}>Đã chọn 1 ảnh</Typography>}
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" mb={1} fontWeight="bold">Gallery Album ({form.gallery.length} ảnh)</Typography>
              <Button variant="contained" color="info" startIcon={<PhotoLibraryIcon/>} fullWidth onClick={() => setPickerConfig({ open: true, type: 'gallery', multiple: true })}>
                Chỉnh sửa Album Ảnh
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 3: Nội dung chi tiết chuẩn Oxalis */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">3. Nội dung Chi tiết Tour (Chuẩn Oxalis)</Typography></AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>{renderBilingualField('Điểm nổi bật (Highlights)', 'highlights', true, 4)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Độ khó / Thể lực (Adventure Level / Fitness)', 'adventureLevelDescription', true, 4)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Thời tiết & Khí hậu', 'weatherAndClimate', true, 4)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('An toàn trên Tour', 'safetyOnTour', true, 3)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Liên lạc (Sóng / Wifi)', 'communicationOnTour', true, 3)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Khách cần mang theo (What to bring)', 'whatToBring', true, 4)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Bơi lội tại bãi trại', 'swimmingAtCampsites', true, 4)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Vệ sinh tại bãi trại', 'toiletAtCampsites', true, 3)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Giá bao gồm (Price Includes)', 'priceIncludes', true, 3)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Quy trình đặt vé (Booking Process)', 'tourBookingProcess', true, 3)}</Grid>
            <Grid item xs={12} md={6}>{renderBilingualField('Hướng dẫn đến Phong Nha', 'directionsToPhongNha', true, 3)}</Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 4: Lịch trình (Itinerary) */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">4. Lịch trình theo ngày (Itinerary)</Typography></AccordionSummary>
        <AccordionDetails>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={addItineraryDay} sx={{ mb: 2 }}>Thêm Ngày Mới</Button>
          {form.itinerary.map((day, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Ngày {day.dayNumber}</Typography>
                <IconButton size="small" onClick={() => removeItineraryDay(idx)}><DeleteIcon fontSize="small" color="error" /></IconButton>
              </Box>
              <TextField fullWidth size="small" label={`Tiêu đề (${lang === 'vi' ? 'VI' : 'EN'})`} value={day.title[lang] || ''} onChange={e => updateItinerary(idx, 'title', lang, e.target.value)} sx={{ mb: 1 }} />
              <TextField fullWidth size="small" multiline rows={3} label={`Nội dung (${lang === 'vi' ? 'VI' : 'EN'})`} value={day.content[lang] || ''} onChange={e => updateItinerary(idx, 'content', lang, e.target.value)} />
            </Paper>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Accordion 5: Chính sách Hủy & Sức khỏe */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">5. Điều khoản và Chính sách</Typography></AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>{renderBilingualField('Điều kiện đặt tour', 'bookingConditions', true, 2)}</Grid>
            <Grid item xs={12}>{renderBilingualField('Yêu cầu thể lực (tóm tắt)', 'healthRequirements', true, 2)}</Grid>
            <Grid item xs={12}>{renderBilingualField('Chính sách hủy tour', 'cancellationPolicy', true, 2)}</Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 6: FAQs */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">6. Hỏi đáp (FAQs)</Typography></AccordionSummary>
        <AccordionDetails>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={addFaq} sx={{ mb: 2 }}>Thêm Câu hỏi</Button>
          {form.faqs.map((faq, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f1f5f9' }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Q&A #{idx + 1}</Typography>
                <IconButton size="small" onClick={() => removeFaq(idx)}><DeleteIcon fontSize="small" color="error" /></IconButton>
              </Box>
              <TextField fullWidth size="small" label={`Câu hỏi (${lang === 'vi' ? 'VI' : 'EN'})`} value={faq.question[lang] || ''} onChange={e => updateFaq(idx, 'question', lang, e.target.value)} sx={{ mb: 1 }} />
              <TextField fullWidth size="small" multiline rows={2} label={`Câu trả lời (${lang === 'vi' ? 'VI' : 'EN'})`} value={faq.answer[lang] || ''} onChange={e => updateFaq(idx, 'answer', lang, e.target.value)} />
            </Paper>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Accordion 7: Cấu hình SEO */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">7. SEO Metadata</Typography></AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label={`Meta Title (${lang === 'vi' ? 'VI' : 'EN'})`} value={form.seo.metaTitle[lang] || ''} onChange={e => setSeoField('metaTitle', lang, e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label={`Meta Description (${lang === 'vi' ? 'VI' : 'EN'})`} value={form.seo.metaDescription[lang] || ''} onChange={e => setSeoField('metaDescription', lang, e.target.value)} /></Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {pickerConfig.open && (
        <MediaPicker
          open={pickerConfig.open}
          multiple={pickerConfig.multiple}
          defaultSelected={pickerConfig.type === 'thumbnail' ? form.thumbnail : pickerConfig.type === 'banner' ? form.banner : form.gallery}
          onSelection={(ids, items) => { /* Will not be called natively by onClose without handleMediaSelect prop bug */ }}
          onSelect={handleMediaSelect}
          onClose={() => setPickerConfig({ ...pickerConfig, open: false })}
        />
      )}
    </Box>
  );
}
