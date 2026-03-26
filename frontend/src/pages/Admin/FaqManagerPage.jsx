import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "sonner";
import {
  adminListFaqCategories,
  adminCreateFaqCategory,
  adminUpdateFaqCategory,
  adminDeleteFaqCategory,
  adminListFaqItems,
  adminCreateFaqItem,
  adminUpdateFaqItem,
  adminDeleteFaqItem,
} from "../../services/faqApi";
import RichTextEditor from "../../components/common/RichTextEditor";
import MediaPicker from "../../components/common/MediaPicker";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { isRichTextEmpty } from "../../utils/youtubeEmbed";

const emptyCat = {
  slug: "",
  title: { vi: "", en: "" },
  subtitle: { vi: "", en: "" },
  heroImage: "",
  sortOrder: 0,
  anchorAliasesText: "",
};

function parseFaqAnchorAliasesField(text, primarySlug) {
  const p = String(primarySlug || "")
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, "-");
  const parts = String(text || "")
    .split(/[,;\n]+/)
    .map((s) =>
      s
        .trim()
        .toLowerCase()
        .replaceAll(/\s+/g, "-")
        .replace(/^#/, ""),
    )
    .filter(Boolean);
  return [...new Set(parts)].filter((a) => a !== p);
}
const emptyItem = {
  categoryId: "",
  groupTitle: { vi: "", en: "" },
  question: { vi: "", en: "" },
  answer: { vi: "", en: "" },
  youtubeUrl: "",
  sortOrder: 0,
};

/** Tiêu đề accordion: lấy từ chữ thuần đầu tiên của HTML trả lời (không còn ô câu hỏi riêng). */
function deriveFaqQuestionTitle(html, lang) {
  const raw = String(html || "")
    .replaceAll(/<script\b[\s\S]*?<\/script>/gi, "")
    .replaceAll(/<style\b[\s\S]*?<\/style>/gi, "")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/&nbsp;|&#160;/gi, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  if (raw) return raw.length > 200 ? `${raw.slice(0, 197)}…` : raw;
  return lang === "en" ? "Content" : "Nội dung";
}

export default function FaqManagerPage({ embedded }) {
  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemFilter, setItemFilter] = useState("all");

  const [catDialog, setCatDialog] = useState(false);
  const [catForm, setCatForm] = useState(emptyCat);
  const [catErrors, setCatErrors] = useState({});
  const [catEditId, setCatEditId] = useState(null);
  const [itemDialog, setItemDialog] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [itemErrors, setItemErrors] = useState({});
  const [itemEditId, setItemEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [catMediaPickerOpen, setCatMediaPickerOpen] = useState(false);
  /** URL xem trước ảnh đầu mục sau khi chọn từ MediaPicker (nhóm mới chưa có trong bảng) */
  const [catHeroPreviewUrl, setCatHeroPreviewUrl] = useState("");

  const loadCats = () =>
    adminListFaqCategories()
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch((e) => {
        toast.error(e.response?.data?.message || e.message || "Không tải được nhóm FAQ");
      });
  const loadItems = () => {
    const params = itemFilter === "all" ? {} : { categoryId: itemFilter };
    return adminListFaqItems(params)
      .then((res) => {
        if (res.success) setItems(res.data || []);
      })
      .catch((e) => {
        toast.error(e.response?.data?.message || e.message || "Không tải được câu hỏi FAQ");
      });
  };

  const refresh = async () => {
    setLoading(true);
    try {
      await loadCats();
      await loadItems();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    loadItems();
  }, [itemFilter]);

  const saveCat = async () => {
    const nextErrors = {};
    if (!catForm.slug.trim()) nextErrors.slug = "Slug là bắt buộc";
    if (!catForm.title.vi.trim()) nextErrors["title.vi"] = "Tiêu đề (VI) là bắt buộc";
    if (!catForm.title.en.trim()) nextErrors["title.en"] = "Tiêu đề (EN) là bắt buộc";
    setCatErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning("Vui lòng kiểm tra các trường đang báo đỏ trước khi lưu");
      return;
    }
    setSaving(true);
    try {
      const heroRaw = catForm.heroImage;
      let heroId = null;
      if (heroRaw && heroRaw !== "") {
        heroId = typeof heroRaw === "object" && heroRaw?._id ? heroRaw._id : heroRaw;
      }
      const p = {
        slug: catForm.slug.trim().toLowerCase(),
        title: catForm.title,
        bannerHeadline: { vi: "", en: "" },
        subtitle: catForm.subtitle || { vi: "", en: "" },
        sortOrder: Number(catForm.sortOrder) || 0,
        heroImage: heroId,
        anchorAliases: parseFaqAnchorAliasesField(
          catForm.anchorAliasesText,
          catForm.slug,
        ),
      };
      if (catEditId) await adminUpdateFaqCategory(catEditId, p);
      else await adminCreateFaqCategory(p);
      toast.success("Đã lưu");
      setCatDialog(false);
      loadCats();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveItem = async () => {
    const nextErrors = {};
    if (!itemForm.categoryId) nextErrors.categoryId = "Vui lòng chọn trang FAQ";
    if (isRichTextEmpty(itemForm.answer.vi)) nextErrors["answer.vi"] = "Trả lời (VI) là bắt buộc";
    if (isRichTextEmpty(itemForm.answer.en)) nextErrors["answer.en"] = "Answer (EN) is required";
    setItemErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning("Vui lòng kiểm tra các trường đang báo đỏ trước khi lưu");
      return;
    }
    setSaving(true);
    try {
      const p = {
        ...itemForm,
        question: {
          vi: deriveFaqQuestionTitle(itemForm.answer.vi, "vi"),
          en: deriveFaqQuestionTitle(itemForm.answer.en, "en"),
        },
        groupTitle: {
          vi: (itemForm.groupTitle?.vi || "").trim(),
          en: (itemForm.groupTitle?.en || "").trim(),
        },
        sortOrder: Number(itemForm.sortOrder) || 0,
        youtubeUrl: "",
      };
      if (itemEditId) await adminUpdateFaqItem(itemEditId, p);
      else await adminCreateFaqItem(p);
      toast.success("Đã lưu");
      setItemDialog(false);
      loadItems();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {!embedded && (
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Quản lý FAQs
        </Typography>
      )}
      {embedded && (
        <Typography
          variant="subtitle1"
          fontWeight={600}
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Câu hỏi thường gặp
        </Typography>
      )}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Trang FAQ" />
        <Tab label="Đầu mục & câu hỏi" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mb: 2 }}
            onClick={() => {
              setCatEditId(null);
              setCatForm({ ...emptyCat });
              setCatErrors({});
              setCatHeroPreviewUrl("");
              setCatDialog(true);
            }}
          >
            Thêm trang / mục FAQ
          </Button>
          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                  <TableRow>
                    <TableCell>
                      <strong>Slug</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Ảnh đầu mục</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tiêu đề VI</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tiêu đề EN</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Thứ tự</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Hành động</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell>{c.slug}</TableCell>
                      <TableCell sx={{ width: 88 }}>
                        {c.heroImage?.url ? (
                          <Box
                            component="img"
                            src={c.heroImage.url}
                            alt=""
                            sx={{
                              width: 72,
                              height: 48,
                              objectFit: "cover",
                              borderRadius: 1,
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{c.title?.vi}</TableCell>
                      <TableCell>{c.title?.en}</TableCell>
                      <TableCell>{c.sortOrder}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setCatEditId(c._id);
                            setCatForm({
                              slug: c.slug,
                              title: {
                                vi: c.title?.vi || "",
                                en: c.title?.en || "",
                              },
                              subtitle: {
                                vi: c.subtitle?.vi || "",
                                en: c.subtitle?.en || "",
                              },
                              heroImage: c.heroImage?._id || c.heroImage || "",
                              sortOrder: c.sortOrder ?? 0,
                              anchorAliasesText: (c.anchorAliases || []).join(", "),
                            });
                            setCatErrors({});
                            setCatHeroPreviewUrl("");
                            setCatDialog(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={async () => {
                            if (
                              !globalThis.confirm(
                                "Xóa nhóm và toàn bộ câu hỏi trong nhóm?",
                              )
                            )
                              return;
                            try {
                              await adminDeleteFaqCategory(c._id);
                              toast.success("Đã xóa");
                              refresh();
                            } catch (e) {
                              toast.error(
                                e.response?.data?.message || e.message,
                              );
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <TextField
              size="small"
              select
              label="Lọc nhóm"
              value={itemFilter}
              onChange={(e) => setItemFilter(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.title?.vi || c.slug}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setItemEditId(null);
                setItemForm({
                  ...emptyItem,
                  categoryId:
                    itemFilter !== "all"
                      ? itemFilter
                      : categories[0]?._id || "",
                });
                setItemErrors({});
                setItemDialog(true);
              }}
            >
              Thêm câu hỏi
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell>
                    <strong>Nhóm</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Đầu mục con</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Câu hỏi (VI)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Thứ tự</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Hành động</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Chưa có câu hỏi
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((it) => (
                    <TableRow key={it._id}>
                      <TableCell>{it.categoryId?.title?.vi || "—"}</TableCell>
                      <TableCell>{it.groupTitle?.vi || "—"}</TableCell>
                      <TableCell>{it.question?.vi}</TableCell>
                      <TableCell>{it.sortOrder}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setItemEditId(it._id);
                            setItemForm({
                              categoryId: it.categoryId?._id || it.categoryId,
                              question: {
                                vi: it.question?.vi || "",
                                en: it.question?.en || "",
                              },
                              answer: {
                                vi: it.answer?.vi || "",
                                en: it.answer?.en || "",
                              },
                              groupTitle: {
                                vi: it.groupTitle?.vi || "",
                                en: it.groupTitle?.en || "",
                              },
                              youtubeUrl: "",
                              sortOrder: it.sortOrder ?? 0,
                            });
                            setItemErrors({});
                            setItemDialog(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={async () => {
                            if (!globalThis.confirm("Xóa?")) return;
                            try {
                              await adminDeleteFaqItem(it._id);
                              toast.success("Đã xóa");
                              loadItems();
                            } catch (e) {
                              toast.error(e.message);
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog
        open={catDialog}
        onClose={() => {
          setCatDialog(false);
          setCatHeroPreviewUrl("");
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {catEditId ? "Sửa trang FAQ (cấp 1.)" : "Trang FAQ mới (cấp 1.)"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Slug (URL #...)"
            value={catForm.slug}
            error={!!catErrors.slug}
            onChange={(e) =>
              setCatForm({
                ...catForm,
                slug: e.target.value.toLowerCase().replaceAll(/\s+/g, "-"),
              })
            }
            helperText={catErrors.slug || "Đổi slug sẽ đổi anchor #... trên trang /faqs"}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Hash # bổ sung (alias)"
            value={catForm.anchorAliasesText || ""}
            onChange={(e) =>
              setCatForm({ ...catForm, anchorAliasesText: e.target.value })
            }
            placeholder="thac-mac-sondoong, faq-sondong"
            helperText="Nhiều hash cách nhau bằng dấu phẩy; cùng cuộn tới khối nội dung của slug chính (vd: link cũ Oxalis)"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tiêu đề trang (VI) — hiển thị 1. …"
                value={catForm.title.vi}
                error={!!catErrors["title.vi"]}
                helperText={catErrors["title.vi"] || ""}
                onChange={(e) =>
                  setCatForm({
                    ...catForm,
                    title: { ...catForm.title, vi: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Page title (EN) — shown as 1. …"
                value={catForm.title.en}
                error={!!catErrors["title.en"]}
                helperText={catErrors["title.en"] || ""}
                onChange={(e) =>
                  setCatForm({
                    ...catForm,
                    title: { ...catForm.title, en: e.target.value },
                  })
                }
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Đoạn chữ trên banner (VI)"
                value={catForm.subtitle.vi}
                onChange={(e) =>
                  setCatForm({
                    ...catForm,
                    subtitle: { ...catForm.subtitle, vi: e.target.value },
                  })
                }
                helperText="Đoạn màu trắng trên ảnh banner /faqs (mục thứ tự nhỏ nhất)"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Banner paragraph (EN)"
                value={catForm.subtitle.en}
                onChange={(e) =>
                  setCatForm({
                    ...catForm,
                    subtitle: { ...catForm.subtitle, en: e.target.value },
                  })
                }
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<PhotoLibraryIcon />}
              onClick={() => setCatMediaPickerOpen(true)}
            >
              {catForm.heroImage ? "Đổi ảnh banner" : "Chọn ảnh banner (trang đầu /faqs)"}
            </Button>
            {catForm.heroImage ? (
              <Button
                size="small"
                color="error"
                onClick={() => {
                  setCatForm({ ...catForm, heroImage: "" });
                  setCatHeroPreviewUrl("");
                }}
              >
                Gỡ ảnh
              </Button>
            ) : null}
          </Box>
          {(() => {
            const fromRow =
              catEditId &&
              categories.find((c) => c._id === catEditId)?.heroImage?.url;
            const preview = catHeroPreviewUrl || fromRow || "";
            return preview ? (
              <Box
                component="img"
                src={preview}
                alt=""
                sx={{
                  mt: 1,
                  width: "100%",
                  maxHeight: 200,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: "1px solid #e2e8f0",
                }}
              />
            ) : null;
          })()}
          <TextField
            fullWidth
            margin="normal"
            type="number"
            label="Thứ tự"
            value={catForm.sortOrder}
            onChange={(e) =>
              setCatForm({ ...catForm, sortOrder: e.target.value })
            }
            helperText="Số nhỏ nhất = hiển thị trước; mục đó quyết định ảnh & intro trên banner"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCatDialog(false);
              setCatHeroPreviewUrl("");
            }}
          >
            Hủy
          </Button>
          <Button variant="contained" onClick={saveCat} disabled={saving}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {catMediaPickerOpen ? (
        <MediaPicker
          open={catMediaPickerOpen}
          multiple={false}
          nested
          defaultSelected={catForm.heroImage}
          onSelect={(id, item) => {
            setCatForm((prev) => ({ ...prev, heroImage: id || "" }));
            setCatHeroPreviewUrl(item?.url || "");
          }}
          onClose={() => setCatMediaPickerOpen(false)}
        />
      ) : null}

      <Dialog
        open={itemDialog}
        onClose={() => setItemDialog(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        disableEnforceFocus
        PaperProps={{ sx: { maxHeight: "88vh" } }}
      >
        <DialogTitle>{itemEditId ? "Sửa câu hỏi" : "Thêm câu hỏi"}</DialogTitle>
        <DialogContent dividers sx={{ overflowY: "auto" }}>
          <TextField
            fullWidth
            margin="normal"
            select
            label="Thuộc trang FAQ"
            value={itemForm.categoryId}
            error={!!itemErrors.categoryId}
            helperText={itemErrors.categoryId || ""}
            onChange={(e) =>
              setItemForm({ ...itemForm, categoryId: e.target.value })
            }
          >
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.title?.vi}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Đầu mục con (VI)"
            value={itemForm.groupTitle?.vi || ""}
            onChange={(e) =>
              setItemForm({
                ...itemForm,
                groupTitle: { ...itemForm.groupTitle, vi: e.target.value },
              })
            }
            helperText="Cùng tên để gom nhóm; để trống = mục “Khác”"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Đầu mục con (EN)"
            value={itemForm.groupTitle?.en || ""}
            onChange={(e) =>
              setItemForm({
                ...itemForm,
                groupTitle: { ...itemForm.groupTitle, en: e.target.value },
              })
            }
          />
          <RichTextEditor
            label="Trả lời (VI)"
            value={itemForm.answer.vi}
            onChange={(v) =>
              setItemForm({
                ...itemForm,
                answer: { ...itemForm.answer, vi: v },
              })
            }
            placeholder="Nội dung… (chữ thuần đầu tiên dùng làm dòng tiêu đề trên trang FAQ)"
            minHeight={200}
          />
          {!!itemErrors["answer.vi"] && (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              {itemErrors["answer.vi"]}
            </Typography>
          )}
          <RichTextEditor
            label="Answer (EN)"
            value={itemForm.answer.en}
            onChange={(v) =>
              setItemForm({
                ...itemForm,
                answer: { ...itemForm.answer, en: v },
              })
            }
            placeholder="Content… (first plain text becomes the FAQ row title)"
            minHeight={200}
          />
          {!!itemErrors["answer.en"] && (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              {itemErrors["answer.en"]}
            </Typography>
          )}
          <TextField
            fullWidth
            margin="normal"
            type="number"
            label="Thứ tự"
            value={itemForm.sortOrder}
            onChange={(e) =>
              setItemForm({ ...itemForm, sortOrder: e.target.value })
            }
            helperText="Cùng trang và cùng đầu mục con: số nhỏ hơn hiển thị trước"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={saveItem} disabled={saving}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
