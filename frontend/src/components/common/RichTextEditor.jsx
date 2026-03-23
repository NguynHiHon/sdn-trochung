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
}) {
  const quillRef = useRef(null);

  const handleImageSelectAndUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute(
      "accept",
      "image/png,image/jpeg,image/jpg,image/webp,image/avif,image/gif,image/*",
    );
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type?.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh hợp lệ.");
        return;
      }

      try {
        toast.info("Đang tải ảnh lên...");
        const uploaded = await uploadFileToCloudinarySigned(file, "oxalis_other");
        const imageUrl = uploaded?.secure_url;
        if (!imageUrl) throw new Error("Không lấy được URL ảnh sau khi upload.");

        const editor = quillRef.current?.getEditor();
        if (!editor) return;
        const range = editor.getSelection(true);
        const index = range ? range.index : editor.getLength();
        editor.insertEmbed(index, "image", imageUrl, "user");
        editor.setSelection(index + 1, 0, "user");
        toast.success("Đã chèn ảnh vào nội dung.");
      } catch (error) {
        toast.error(error?.message || "Upload ảnh thất bại.");
      }
    };
  }, []);

  const m = useMemo(() => {
    const baseModules = modules ? { ...modules } : { ...defaultModules };
    if (Array.isArray(baseModules.toolbar)) {
      baseModules.toolbar = {
        container: baseModules.toolbar,
        handlers: { image: handleImageSelectAndUpload },
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
        image: handleImageSelectAndUpload,
      },
    };
    return baseModules;
  }, [modules, handleImageSelectAndUpload]);
  const f = useMemo(() => formats || defaultFormats, [formats]);

  return (
    <Box sx={{ mb: 2 }}>
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
        />
      </Box>
    </Box>
  );
}
