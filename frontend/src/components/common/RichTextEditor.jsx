import React, { useCallback, useMemo, useRef } from "react";
import { Box, Typography } from "@mui/material";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import { uploadFileToCloudinarySigned } from "../../services/cloudinaryApi";

const defaultModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const defaultFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
];

function getQuillInstance(quillRef) {
  const inst = quillRef?.current;
  if (!inst) return null;
  if (typeof inst.getEditor === "function") {
    try {
      return inst.getEditor();
    } catch {
      return null;
    }
  }
  if (inst.editor) return inst.editor;
  return null;
}

async function waitForQuill(quillRef, attempts = 8) {
  for (let i = 0; i < attempts; i += 1) {
    const q = getQuillInstance(quillRef);
    if (q) return q;
    await new Promise((r) => {
      globalThis.requestAnimationFrame(r);
    });
  }
  return getQuillInstance(quillRef);
}

/**
 * Rich text (react-quill-new) — dùng cho nội dung bài viết / FAQ.
 */
export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 280,
  modules,
  formats,
  /** Folder Cloudinary khi bấm nút ảnh trên toolbar */
  uploadFolder = "oxalis_other",
}) {
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const openFilePicker = useCallback(() => {
    const input = fileInputRef.current;
    if (!input) {
      toast.error("Không mở được hộp chọn ảnh.");
      return;
    }
    input.value = "";
    input.click();
  }, []);

  const handleHiddenFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type?.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh hợp lệ.");
        return;
      }

      try {
        toast.info("Đang tải ảnh lên...");
        const uploaded = await uploadFileToCloudinarySigned(file, uploadFolder);
        const imageUrl = uploaded?.secure_url;
        if (!imageUrl) throw new Error("Không lấy được URL ảnh sau khi upload.");

        const editor = await waitForQuill(quillRef);
        if (!editor) {
          throw new Error(
            "Trình soạn thảo chưa sẵn sàng. Thử đóng/mở lại form hoặc bấm vào ô soạn thảo rồi chèn ảnh lại.",
          );
        }

        const range = editor.getSelection(true);
        const index = range ? range.index : Math.max(0, editor.getLength() - 1);
        editor.insertEmbed(index, "image", imageUrl, "user");
        editor.setSelection(index + 1, 0, "user");

        // Dùng innerHTML — getSemanticHTML() của Quill 2 có thể bỏ <img> → mất ảnh trong state / DB
        const syncHtml = editor.root?.innerHTML ?? "";
        onChangeRef.current?.(syncHtml);

        toast.success("Đã chèn ảnh vào nội dung.");
      } catch (error) {
        toast.error(error?.message || "Upload ảnh thất bại.");
      } finally {
        e.target.value = "";
      }
    },
    [uploadFolder],
  );

  const m = useMemo(() => {
    const baseModules = modules ? { ...modules } : { ...defaultModules };
    if (Array.isArray(baseModules.toolbar)) {
      baseModules.toolbar = {
        container: baseModules.toolbar,
        handlers: { image: openFilePicker },
      };
      return baseModules;
    }
    const existingToolbar =
      baseModules.toolbar && typeof baseModules.toolbar === "object"
        ? baseModules.toolbar
        : undefined;
    const existingHandlers =
      existingToolbar?.handlers && typeof existingToolbar.handlers === "object"
        ? existingToolbar.handlers
        : undefined;
    baseModules.toolbar = {
      ...existingToolbar,
      handlers: {
        ...existingHandlers,
        image: openFilePicker,
      },
    };
    return baseModules;
  }, [modules, openFilePicker]);
  const f = useMemo(() => formats || defaultFormats, [formats]);

  return (
    <Box sx={{ mb: 2 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/gif,image/*"
        style={{ display: "none" }}
        aria-hidden
        tabIndex={-1}
        onChange={(ev) => void handleHiddenFileChange(ev)}
      />
      {label ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
          {label}
        </Typography>
      ) : null}
      <Box
        className="rich-text-editor-root"
        sx={{
          "& .ql-toolbar.ql-snow": {
            borderRadius: "8px 8px 0 0",
            borderColor: "rgba(0,0,0,0.12)",
            bgcolor: "#fafafa",
          },
          "& .ql-container.ql-snow": {
            borderRadius: "0 0 8px 8px",
            borderColor: "rgba(0,0,0,0.12)",
            fontSize: "1rem",
            minHeight,
          },
          "& .ql-editor": {
            minHeight,
          },
          "& .ql-editor .ql-video": {
            width: "100%",
            maxWidth: "100%",
            minHeight: 240,
            aspectRatio: "16 / 9",
            border: 0,
            borderRadius: "4px",
            display: "block",
            margin: "12px auto",
          },
          "& .ql-editor.ql-blank::before": {
            fontStyle: "normal",
            color: "rgba(0,0,0,0.4)",
          },
        }}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ""}
          onChange={onChange}
          modules={m}
          formats={f}
          placeholder={placeholder || ""}
          useSemanticHTML={false}
        />
      </Box>
    </Box>
  );
}
