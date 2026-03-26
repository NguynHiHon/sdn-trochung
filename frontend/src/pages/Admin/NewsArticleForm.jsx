import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminListNewsCategories,
  adminGetNewsArticle,
  adminCreateNewsArticle,
  adminUpdateNewsArticle,
} from "../../services/newsApi";
import MediaPicker from "../../components/common/MediaPicker";
import RichTextEditor from "../../components/common/RichTextEditor";

function LangPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function NewsArticleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [langTab, setLangTab] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState("thumbnail");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    categoryId: "",
    slug: "",
    title: { vi: "", en: "" },
    excerpt: { vi: "", en: "" },
    content: { vi: "", en: "" },
    thumbnail: "",
    coverImage: "",
    isFeatured: false,
    status: "draft",
    publishedAt: "",
  });

  useEffect(() => {
    adminListNewsCategories().then((res) => {
      if (res.success) setCategories(res.data || []);
    });
    if (isEdit) {
      adminGetNewsArticle(id)
        .then((res) => {
          if (res.success) {
            const a = res.data;
            setForm({
              categoryId: a.categoryId?._id || a.categoryId || "",
              slug: a.slug || "",
              title: a.title || { vi: "", en: "" },
              excerpt: a.excerpt || { vi: "", en: "" },
              content: a.content || { vi: "", en: "" },
              thumbnail: a.thumbnail?._id || a.thumbnail || "",
              coverImage: a.coverImage?._id || a.coverImage || "",
              isFeatured:
                a.isFeatured === true ||
                a.featured === true ||
                String(a.isFeatured).toLowerCase() === "true" ||
                String(a.featured).toLowerCase() === "true",
              status: a.status || "draft",
              publishedAt: a.publishedAt
                ? new Date(a.publishedAt).toISOString().slice(0, 16)
                : "",
            });
          }
        })
        .catch(() => toast.error("Không tải được bài viết"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const lang = langTab === 0 ? "vi" : "en";
  const setBi = (field, v) => {
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: v } }));
    setErrors((prev) => {
      const key = `${field}.${lang}`;
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.categoryId) nextErrors.categoryId = "Danh mục là bắt buộc";
    if (!form.slug.trim()) nextErrors.slug = "Slug là bắt buộc";
    if (!form.title.vi.trim()) nextErrors["title.vi"] = "Tiêu đề (VI) là bắt buộc";
    if (!form.title.en.trim()) nextErrors["title.en"] = "Tiêu đề (EN) là bắt buộc";
    if (!form.status) nextErrors.status = "Trạng thái là bắt buộc";
    if (form.publishedAt && Number.isNaN(new Date(form.publishedAt).getTime())) {
      nextErrors.publishedAt = "Ngày xuất bản không hợp lệ";
    }
    return nextErrors;
  };

  const submit = async () => {
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning("Vui lòng kiểm tra các trường đang báo đỏ trước khi lưu");
      return;
    }
    setSaving(true);
    try {
      const featuredValue = Boolean(form.isFeatured);
      const payload = {
        ...form,
        isFeatured: featuredValue,
        featured: featuredValue,
      };
      if (!payload.thumbnail) delete payload.thumbnail;
      if (!payload.coverImage) delete payload.coverImage;
      if (!payload.publishedAt) delete payload.publishedAt;
      else payload.publishedAt = new Date(payload.publishedAt);
      if (isEdit) {
        await adminUpdateNewsArticle(id, payload);
        toast.success("Đã cập nhật");
      } else {
        await adminCreateNewsArticle(payload);
        toast.success("Đã tạo bài");
      }
      navigate("/manager/posts", { state: { postsTab: 1 } });
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          {isEdit ? "Sửa bài viết" : "Bài viết mới"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() =>
              navigate("/manager/posts", { state: { postsTab: 1 } })
            }
          >
            Hủy
          </Button>
          <Button variant="contained" onClick={submit} disabled={saving}>
            {saving ? "..." : "Lưu"}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Danh mục"
              required
              value={form.categoryId}
              error={!!errors.categoryId}
              helperText={errors.categoryId || ""}
              onChange={(e) => {
                setForm({ ...form, categoryId: e.target.value });
                setErrors((prev) => {
                  if (!prev.categoryId) return prev;
                  const next = { ...prev };
                  delete next.categoryId;
                  return next;
                });
              }}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name?.vi || c.slug}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              sx={{ mt: 0.5 }}
              control={
                <Switch
                  checked={!!form.isFeatured}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                />
              }
              label="Bài nổi bật"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Slug (URL)"
              required
              value={form.slug}
              error={!!errors.slug}
              onChange={(e) => {
                setForm({
                  ...form,
                  slug: e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-"),
                });
                setErrors((prev) => {
                  if (!prev.slug) return prev;
                  const next = { ...prev };
                  delete next.slug;
                  return next;
                });
              }
              }
              helperText={errors.slug || "Duy nhất, ví dụ: bua-toi-nha-dan-tan-hoa"}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Trạng thái"
              value={form.status}
              error={!!errors.status}
              helperText={errors.status || ""}
              onChange={(e) => {
                setForm({ ...form, status: e.target.value });
                setErrors((prev) => {
                  if (!prev.status) return prev;
                  const next = { ...prev };
                  delete next.status;
                  return next;
                });
              }}
            >
              <MenuItem value="draft">Nháp</MenuItem>
              <MenuItem value="published">Xuất bản</MenuItem>
              <MenuItem value="archived">Lưu trữ</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Ngày xuất bản"
              InputLabelProps={{ shrink: true }}
              value={form.publishedAt}
              error={!!errors.publishedAt}
              onChange={(e) => {
                setForm({ ...form, publishedAt: e.target.value });
                setErrors((prev) => {
                  if (!prev.publishedAt) return prev;
                  const next = { ...prev };
                  delete next.publishedAt;
                  return next;
                });
              }
              }
              helperText={errors.publishedAt || "Tuỳ chọn — để trống khi lưu nháp"}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PhotoLibraryIcon />}
              onClick={() => {
                setPickerTarget("thumbnail");
                setPickerOpen(true);
              }}
            >
              {form.thumbnail ? "Đổi ảnh đại diện" : "Chọn ảnh đại diện"}
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PhotoLibraryIcon />}
              onClick={() => {
                setPickerTarget("coverImage");
                setPickerOpen(true);
              }}
            >
              {form.coverImage ? "Đổi ảnh phông đầu bài" : "Chọn ảnh phông đầu bài"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={langTab} onChange={(e, v) => setLangTab(v)}>
          <Tab label="Tiếng Việt" />
          <Tab label="English" />
        </Tabs>
      </Box>
      <LangPanel value={langTab} index={0}>
        <TextField
          fullWidth
          label="Tiêu đề"
          value={form.title.vi}
          error={!!errors["title.vi"]}
          helperText={errors["title.vi"] || ""}
          onChange={(e) => setBi("title", e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Mô tả ngắn"
          value={form.excerpt.vi}
          onChange={(e) => setBi("excerpt", e.target.value)}
          sx={{ mb: 2 }}
        />
        <RichTextEditor
          label="Nội dung"
          value={form.content.vi}
          onChange={(v) => setBi("content", v)}
          placeholder="Soạn thảo nội dung bài viết... (có thể chèn ảnh bằng nút image hoặc video YouTube bằng nút video; nhiều ảnh liên tiếp sẽ tự hiển thị dạng lưới ở trang xem)"
        />
      </LangPanel>
      <LangPanel value={langTab} index={1}>
        <TextField
          fullWidth
          label="Title"
          value={form.title.en}
          error={!!errors["title.en"]}
          helperText={errors["title.en"] || ""}
          onChange={(e) => setBi("title", e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Excerpt"
          value={form.excerpt.en}
          onChange={(e) => setBi("excerpt", e.target.value)}
          sx={{ mb: 2 }}
        />
        <RichTextEditor
          label="Content"
          value={form.content.en}
          onChange={(v) => setBi("content", v)}
          placeholder="Article body... (you can insert images or embed a YouTube video via the video tool; consecutive images will be shown as a grid on the public page)"
        />
      </LangPanel>

      {pickerOpen && (
        <MediaPicker
          open={pickerOpen}
          multiple={false}
          defaultSelected={form[pickerTarget]}
          onSelect={(selectedId) => {
            setForm((prev) => ({ ...prev, [pickerTarget]: selectedId }));
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </Box>
  );
}
