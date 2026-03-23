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
import { isRichTextEmpty } from "../../utils/youtubeEmbed";

const emptyCat = { slug: "", title: { vi: "", en: "" }, sortOrder: 0 };
const emptyItem = {
  categoryId: "",
  question: { vi: "", en: "" },
  answer: { vi: "", en: "" },
  sortOrder: 0,
};

export default function FaqManagerPage({ embedded }) {
  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemFilter, setItemFilter] = useState("all");

  const [catDialog, setCatDialog] = useState(false);
  const [catForm, setCatForm] = useState(emptyCat);
  const [catEditId, setCatEditId] = useState(null);
  const [itemDialog, setItemDialog] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [itemEditId, setItemEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCats = () =>
    adminListFaqCategories().then((res) => {
      if (res.success) setCategories(res.data || []);
    });
  const loadItems = () => {
    const params = itemFilter === "all" ? {} : { categoryId: itemFilter };
    return adminListFaqItems(params).then((res) => {
      if (res.success) setItems(res.data || []);
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
    if (
      !catForm.slug.trim() ||
      !catForm.title.vi.trim() ||
      !catForm.title.en.trim()
    ) {
      toast.warning("Slug và tiêu đề (VI/EN) bắt buộc");
      return;
    }
    setSaving(true);
    try {
      const p = { ...catForm, sortOrder: Number(catForm.sortOrder) || 0 };
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
    if (
      !itemForm.categoryId ||
      !itemForm.question.vi.trim() ||
      !itemForm.question.en.trim() ||
      isRichTextEmpty(itemForm.answer.vi) ||
      isRichTextEmpty(itemForm.answer.en)
    ) {
      toast.warning("Điền đủ nhóm và Q&A (VI/EN)");
      return;
    }
    setSaving(true);
    try {
      const p = {
        ...itemForm,
        sortOrder: Number(itemForm.sortOrder) || 0,
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
        <Tab label="Nhóm câu hỏi" />
        <Tab label="Câu hỏi & trả lời" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mb: 2 }}
            onClick={() => {
              setCatEditId(null);
              setCatForm(emptyCat);
              setCatDialog(true);
            }}
          >
            Thêm nhóm
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
                              sortOrder: c.sortOrder ?? 0,
                            });
                            setCatDialog(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={async () => {
                            if (
                              !window.confirm(
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
                    <TableCell colSpan={4} align="center">
                      Chưa có câu hỏi
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((it) => (
                    <TableRow key={it._id}>
                      <TableCell>{it.categoryId?.title?.vi || "—"}</TableCell>
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
                              sortOrder: it.sortOrder ?? 0,
                            });
                            setItemDialog(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={async () => {
                            if (!window.confirm("Xóa?")) return;
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
        onClose={() => setCatDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{catEditId ? "Sửa nhóm FAQ" : "Nhóm mới"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Slug"
            value={catForm.slug}
            onChange={(e) =>
              setCatForm({
                ...catForm,
                slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })
            }
            disabled={!!catEditId}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tiêu đề VI"
                value={catForm.title.vi}
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
                label="Title EN"
                value={catForm.title.en}
                onChange={(e) =>
                  setCatForm({
                    ...catForm,
                    title: { ...catForm.title, en: e.target.value },
                  })
                }
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            margin="normal"
            type="number"
            label="Thứ tự"
            value={catForm.sortOrder}
            onChange={(e) =>
              setCatForm({ ...catForm, sortOrder: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={saveCat} disabled={saving}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={itemDialog}
        onClose={() => setItemDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { overflow: "visible" } }}
      >
        <DialogTitle>{itemEditId ? "Sửa câu hỏi" : "Câu hỏi mới"}</DialogTitle>
        <DialogContent sx={{ overflow: "visible" }}>
          <TextField
            fullWidth
            margin="normal"
            select
            label="Nhóm"
            value={itemForm.categoryId}
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
            label="Câu hỏi (VI)"
            value={itemForm.question.vi}
            onChange={(e) =>
              setItemForm({
                ...itemForm,
                question: { ...itemForm.question, vi: e.target.value },
              })
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Question (EN)"
            value={itemForm.question.en}
            onChange={(e) =>
              setItemForm({
                ...itemForm,
                question: { ...itemForm.question, en: e.target.value },
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
            placeholder="Nội dung trả lời... (có thể chèn ảnh/video YouTube bằng toolbar)"
            minHeight={200}
          />
          <RichTextEditor
            label="Answer (EN)"
            value={itemForm.answer.en}
            onChange={(v) =>
              setItemForm({
                ...itemForm,
                answer: { ...itemForm.answer, en: v },
              })
            }
            placeholder="Answer... (image/YouTube video embed is supported)"
            minHeight={200}
          />
          <TextField
            fullWidth
            margin="normal"
            type="number"
            label="Thứ tự"
            value={itemForm.sortOrder}
            onChange={(e) =>
              setItemForm({ ...itemForm, sortOrder: e.target.value })
            }
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
