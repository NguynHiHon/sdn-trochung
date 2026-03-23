/**
 * Chuẩn hoá URL YouTube thành link embed (iframe src).
 * Hỗ trợ watch?v=, youtu.be/, embed/, hoặc chỉ 11 ký tự video id.
 */
export function getYoutubeEmbedSrc(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const urlPattern =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const idPattern = /^([a-zA-Z0-9_-]{11})$/;
  const m = urlPattern.exec(trimmed) || idPattern.exec(trimmed);
  if (!m) return null;
  return `https://www.youtube.com/embed/${m[1]}`;
}

/**
 * Chuyển link YouTube (text/link) trong HTML thành iframe để hiển thị trực tiếp.
 */
export function replaceYoutubeLinksWithEmbeds(html) {
  if (!html || typeof html !== "string") return html || "";

  const iframeFromUrl = (url) => {
    const src = getYoutubeEmbedSrc(url);
    if (!src) return null;
    return `<iframe class="ql-video" src="${src}" title="YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  };

  const anchorPattern =
    /<a\b[^>]*href=(["'])(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^"']+)\1[^>]*>[\s\S]*?<\/a>/gi;
  const paragraphPlainUrlPattern =
    /<p[^>]*>\s*((?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=[^\s<]+|youtube\.com\/embed\/[^\s<]+|youtu\.be\/[^\s<]+))\s*<\/p>/gi;

  return html
    .replaceAll(anchorPattern, (fullMatch, _quote, url) => iframeFromUrl(url) || fullMatch)
    .replaceAll(paragraphPlainUrlPattern, (fullMatch, url) => iframeFromUrl(url) || fullMatch);
}

/** Kiểm tra nội dung HTML từ Quill có thực sự trống không */
export function isRichTextEmpty(html) {
  if (!html || typeof html !== "string") return true;
  const text = html
    .replaceAll(/<[^>]*>/g, " ")
    .replaceAll(/&nbsp;/gi, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  return text.length === 0;
}
