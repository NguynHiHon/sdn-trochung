import { replaceYoutubeLinksWithEmbeds } from "./youtubeEmbed";

/**
 * Làm sạch HTML câu trả lời FAQ (Quill) — tương tự bài tin, bỏ script/style nguy hiểm cơ bản.
 */
export function sanitizeFaqAnswerHtml(html) {
  if (!html || typeof html !== "string") return "";

  const noScripts = html
    .replaceAll(/<script\b[\s\S]*?<\/script>/gi, "")
    .replaceAll(/<style\b[\s\S]*?<\/style>/gi, "")
    .replaceAll(/\son\w+\s*=\s*(["'])[\s\S]*?\1/gi, "");

  const baseHtml = noScripts
    .replaceAll(/&nbsp;|&#160;/gi, " ")
    .replaceAll(/\u00A0/g, " ")
    .replaceAll(/<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi, (_, tag, attrs = "", inner = "") => {
      const classRegex = /\sclass=(["'])(.*?)\1/i;
      const classMatch = classRegex.exec(String(attrs));
      const safeClassAttr = classMatch ? ` class="${classMatch[2]}"` : "";
      const cleanedInner = String(inner)
        .replaceAll(/<br\s*\/?>/gi, " ")
        .replaceAll(/&nbsp;|&#160;/gi, " ")
        .replaceAll(/[\u200B-\u200D\uFEFF]/g, "")
        .replaceAll(/\u00A0/g, " ")
        .replaceAll(/\s+/g, " ")
        .trim();
      return `<${tag}${safeClassAttr}>${cleanedInner}</${tag}>`;
    })
    .replaceAll(/<span[^>]*>/gi, "")
    .replaceAll(/<\/span>/gi, "")
    .replaceAll(
      /<p[^>]*>\s*(?:Caption|Chú thích)\s*:\s*([\s\S]*?)<\/p>/gi,
      '<p class="img-caption">$1</p>',
    )
    .replaceAll(/>\s+</g, "><")
    .replaceAll(/[\u200B-\u200D\uFEFF]/g, "");

  const withFigureCaptions = baseHtml.replaceAll(
    /(<p[^>]*>\s*<img[^>]*>\s*<\/p>)(<p[^>]*>[\s\S]*?<\/p>)/gi,
    (_m, imageParagraph, captionParagraph) => {
      const rawCaption = captionParagraph
        .replaceAll(/<p[^>]*>/gi, "")
        .replaceAll(/<\/p>/gi, "")
        .trim();
      const captionText = rawCaption
        .replaceAll(/<[^>]*>/g, " ")
        .replaceAll(/\s+/g, " ")
        .trim();
      if (!captionText) return imageParagraph + captionParagraph;
      if (/<\s*(img|iframe|video|figure)\b/i.test(rawCaption)) {
        return imageParagraph + captionParagraph;
      }
      return `<figure class="article-figure">${imageParagraph}<figcaption>${rawCaption}</figcaption></figure>`;
    },
  );

  return replaceYoutubeLinksWithEmbeds(withFigureCaptions);
}

/**
 * Bỏ tiền tố số dạng 1.1. / 1.1.1. (và bullet) khi dán từ trang FAQ khác — tránh trùng với số tự sinh trên site.
 */
export function stripLeadingFaqEnumeration(text) {
  if (!text || typeof text !== "string") return "";
  let t = text
    .replace(/^\s*[\u2022•\-*]\s*/u, "")
    .replace(/^\s*(?:\d+\.){2,}\s*/u, "")
    .trim();
  /* Một cặp mục con dạng 1.1 hoặc 1.1. ở đầu (admin hay gõ trùng với số tự sinh) */
  t = t.replace(/^\s*\d+\.\d+\.?\s+/u, "").trim();
  return t;
}
