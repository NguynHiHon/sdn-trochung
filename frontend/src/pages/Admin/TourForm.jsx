import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Paper, Tabs, Tab,
  CircularProgress, IconButton,
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
import TourBasicInfoSection from './TourBasicInfoSection';

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
  const [errors, setErrors] = useState({});

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

  const setBilingual = useCallback((field, lang, value) => {
    setForm(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    setErrors((prev) => {
      const key = `${field}.${lang}`;
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const setBasicField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

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
    const nextErrors = {};

    if (!form.name.vi?.trim()) nextErrors['name.vi'] = 'Tên tour (VI) là bắt buộc';
    if (!form.name.en?.trim()) nextErrors['name.en'] = 'Tên tour (EN) là bắt buộc';
    if (!form.description.vi?.trim()) nextErrors['description.vi'] = 'Mô tả ngắn (VI) là bắt buộc';
    if (!form.description.en?.trim()) nextErrors['description.en'] = 'Mô tả ngắn (EN) là bắt buộc';
    if (!form.code?.trim()) nextErrors.code = 'Mã tour là bắt buộc';
    if (!form.slug?.trim()) nextErrors.slug = 'Slug là bắt buộc';

    const priceVND = Number(form.priceVND);
    if (!Number.isFinite(priceVND) || priceVND <= 0) nextErrors.priceVND = 'Giá (VNĐ) phải lớn hơn 0';

    const durationDays = Number(form.durationDays);
    if (!Number.isFinite(durationDays) || durationDays <= 0) nextErrors.durationDays = 'Số ngày phải lớn hơn 0';

    const adventureLevel = Number(form.adventureLevel);
    if (!Number.isInteger(adventureLevel) || adventureLevel < 1 || adventureLevel > 6) {
      nextErrors.adventureLevel = 'Độ khó phải từ 1 đến 6';
    }

    if (!form.tourType) nextErrors.tourType = 'Loại tour là bắt buộc';
    if (!form.status) nextErrors.status = 'Trạng thái là bắt buộc';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning('Vui lòng kiểm tra các trường bắt buộc trong mục 1 - Thông số Cơ Bản');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form };

      payload.name = {
        vi: payload.name.vi.trim(),
        en: payload.name.en.trim(),
      };
      payload.description = {
        vi: payload.description.vi.trim(),
        en: payload.description.en.trim(),
      };
      payload.code = payload.code.trim();
      payload.slug = payload.slug.trim();

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

  const lang = langTab === 0 ? 'vi' : 'en';

  const basicForm = useMemo(() => ({
    name: form.name,
    description: form.description,
    code: form.code,
    slug: form.slug,
    priceVND: form.priceVND,
    priceUSD: form.priceUSD,
    durationDays: form.durationDays,
    adventureLevel: form.adventureLevel,
    groupSize: form.groupSize,
    ageMin: form.ageMin,
    ageMax: form.ageMax,
    tourType: form.tourType,
    caveId: form.caveId,
    status: form.status,
    isFeatured: form.isFeatured,
  }), [
    form.name,
    form.description,
    form.code,
    form.slug,
    form.priceVND,
    form.priceUSD,
    form.durationDays,
    form.adventureLevel,
    form.groupSize,
    form.ageMin,
    form.ageMax,
    form.tourType,
    form.caveId,
    form.status,
    form.isFeatured,
  ]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  const renderBilingualField = (label, fieldKey, multiline = false, rows = 3) => (
    <TextField
      fullWidth
      label={`${label} (${lang === 'vi' ? 'VI' : 'EN'})`}
      multiline={multiline}
      rows={multiline ? rows : 1}
      value={form[fieldKey][lang] || ''}
      error={!!errors[`${fieldKey}.${lang}`]}
      helperText={errors[`${fieldKey}.${lang}`] || ''}
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
      <Accordion defaultExpanded TransitionProps={{ unmountOnExit: true }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">1. Thông số Cơ Bản</Typography></AccordionSummary>
        <AccordionDetails>
          <TourBasicInfoSection
            lang={lang}
            basicForm={basicForm}
            errors={errors}
            caves={caves}
            onBilingualChange={setBilingual}
            onFieldChange={setBasicField}
            onClearError={clearFieldError}
          />
        </AccordionDetails>
      </Accordion>

      {/* Accordion 2: Thư viện Ảnh */}
      <Accordion defaultExpanded TransitionProps={{ unmountOnExit: true }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">2. Hình Ảnh, Banner & Gallery</Typography></AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <Typography variant="body2" mb={1} fontWeight="bold">Thumbnail (Ảnh vuông/Vuông đại diện)</Typography>
              <Button variant="outlined" startIcon={<PhotoLibraryIcon />} fullWidth onClick={() => setPickerConfig({ open: true, type: 'thumbnail', multiple: false })}>
                {form.thumbnail ? 'Đổi Thumbnail' : 'Chọn Thumbnail'}
              </Button>
              {form.thumbnail && <Typography variant="caption" color="success.main" display="block" mt={1}>Đã chọn 1 ảnh</Typography>}
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" mb={1} fontWeight="bold">Banner Cover (Dành cho Tour Detail)</Typography>
              <Button variant="outlined" color="secondary" startIcon={<PhotoLibraryIcon />} fullWidth onClick={() => setPickerConfig({ open: true, type: 'banner', multiple: false })}>
                {form.banner ? 'Đổi Banner' : 'Chọn Banner'}
              </Button>
              {form.banner && <Typography variant="caption" color="success.main" display="block" mt={1}>Đã chọn 1 ảnh</Typography>}
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" mb={1} fontWeight="bold">Gallery Album ({form.gallery.length} ảnh)</Typography>
              <Button variant="contained" color="info" startIcon={<PhotoLibraryIcon />} fullWidth onClick={() => setPickerConfig({ open: true, type: 'gallery', multiple: true })}>
                Chỉnh sửa Album Ảnh
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 3: Nội dung chi tiết chuẩn Oxalis */}
      <Accordion TransitionProps={{ unmountOnExit: true }}>
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
      <Accordion TransitionProps={{ unmountOnExit: true }}>
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
      <Accordion TransitionProps={{ unmountOnExit: true }}>
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
      <Accordion TransitionProps={{ unmountOnExit: true }}>
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
      <Accordion TransitionProps={{ unmountOnExit: true }}>
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
