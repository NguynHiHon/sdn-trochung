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
  const [form, setForm] = useState({
    categoryId: "",
    slug: "",
    title: { vi: "", en: "" },
    excerpt: { vi: "", en: "" },
    content: { vi: "", en: "" },
    thumbnail: "",
    coverImage: "",
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
  const setBi = (field, v) =>
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: v } }));

  const submit = async () => {
    if (
      !form.categoryId ||
      !form.slug.trim() ||
      !form.title.vi.trim() ||
      !form.title.en.trim()
    ) {
      toast.warning("Danh mục, slug và tiêu đề (VI/EN) là bắt buộc");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
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
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name?.vi || c.slug}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Slug (URL)"
              required
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-"),
                })
              }
              helperText="Duy nhất, ví dụ: bua-toi-nha-dan-tan-hoa"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Trạng thái"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
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
              onChange={(e) =>
                setForm({ ...form, publishedAt: e.target.value })
              }
              helperText="Tuỳ chọn — để trống khi lưu nháp"
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
          placeholder="Soạn thảo nội dung bài viết... (có thể chèn ảnh bằng nút image hoặc video YouTube bằng nút video)"
        />
      </LangPanel>
      <LangPanel value={langTab} index={1}>
        <TextField
          fullWidth
          label="Title"
          value={form.title.en}
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
          placeholder="Article body... (you can insert images or embed a YouTube video via the video tool)"
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
