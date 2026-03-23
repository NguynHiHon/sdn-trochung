import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { getFaqTree } from "../services/faqApi";
import {
  getYoutubeEmbedSrc,
  replaceYoutubeLinksWithEmbeds,
} from "../utils/youtubeEmbed";

function sanitizeRichHtml(rawHtml = "") {
  const baseHtml = String(rawHtml)
    .replaceAll(/&nbsp;|&#160;/gi, " ")
    .replaceAll(/\u00A0/g, " ")
    .replaceAll(/<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi, (_, tag, attrs = "", inner = "") => {
      const classRegex = /\sclass=(["'])(.*?)\1/i;
      const classMatch = classRegex.exec(String(attrs));
      const safeClassAttr = classMatch ? ` class="${classMatch[2]}"` : "";
      const cleanedInner = String(inner)
        .replaceAll(/<br\s*\/?>/gi, " ")
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

export default function FaqsPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "vi";
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaqTree()
      .then((res) => {
        if (res.success) setSections(res.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || sections.length === 0) return;
    const hash = globalThis.location.hash?.replace(/^#/, "");
    if (!hash) return;
    requestAnimationFrame(() => {
      document
        .getElementById(hash)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [loading, sections]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#2b6f56" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f2eb", minHeight: "70vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 860, mx: "auto" }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#1b3026", mb: 1, letterSpacing: "-0.02em" }}>
          {lang === "vi" ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}
        </Typography>
        <Box sx={{ width: 72, height: 3, bgcolor: "#d8b23e", borderRadius: 99, mb: 2.5 }} />
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {lang === "vi"
            ? "Thông tin về độ khó tour, thời tiết, chuẩn bị, an toàn và quy trình đặt chỗ."
            : "Tour difficulty, weather, preparation, safety and booking — common questions answered."}
        </Typography>

        {sections.length === 0 ? (
          <Typography color="text.secondary">
            {lang === "vi" ? "Chưa có nội dung FAQ." : "No FAQs yet."}
          </Typography>
        ) : (
          sections.map(({ category, items }) => (
            <Box
              key={category._id}
              id={category.slug}
              sx={{ mb: 4, scrollMarginTop: 96 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1b3026",
                  mb: 1.25,
                  pb: 0.65,
                  borderBottom: "1px solid rgba(27,48,38,0.18)",
                }}
              >
                {category.title?.[lang] || category.slug}
              </Typography>
              {items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {lang === "vi" ? "Đang cập nhật." : "Coming soon."}
                </Typography>
              ) : (
                items.map((item) => {
                  const ans = item.answer?.[lang] || "";
                  const html = /<\/?[a-z][\s\S]*>/i.test(ans);
                  const sanitizedAns = html ? sanitizeRichHtml(ans) : ans;
                  return (
                    <Accordion
                      key={item._id}
                      disableGutters
                      elevation={0}
                      sx={{
                        mb: 1.25,
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "4px !important",
                        "&:before": { display: "none" },
                        bgcolor: "white",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMoreIcon sx={{ color: "#2b6f56" }} />
                        }
                      >
                        <Typography sx={{ fontWeight: 700, color: "#1b3026" }}>
                          {item.question?.[lang]}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {html ? (
                          <Box
                            sx={{
                              color: "#2d2d2d",
                              lineHeight: 1.85,
                              fontSize: "1rem",
                              overflowX: "hidden",
                              "&, & *": { boxSizing: "border-box", maxWidth: "100%" },
                              "& p": { mb: 1.2 },
                              "& p, & li, & div, & span": {
                                whiteSpace: "normal !important",
                                overflowWrap: "break-word",
                                wordBreak: "normal",
                                hyphens: "none",
                              },
                              "& img": { maxWidth: "100%", height: "auto", borderRadius: "4px" },
                              "& .article-figure": {
                                margin: "0.9rem 0 1.05rem",
                                width: "100%",
                              },
                              "& .article-figure > p": { margin: 0 },
                              "& .article-figure img": { margin: 0, display: "block" },
                              "& .article-figure figcaption": {
                                marginTop: "0.35rem",
                                textAlign: "center",
                                fontStyle: "italic",
                                color: "rgba(0,0,0,0.72)",
                                fontSize: "0.93rem",
                                lineHeight: 1.45,
                              },
                              "& .ql-video": {
                                width: "100%",
                                maxWidth: "100%",
                                minHeight: 220,
                                aspectRatio: "16 / 9",
                                border: 0,
                                borderRadius: "4px",
                                display: "block",
                                margin: "12px auto",
                                backgroundColor: "#000",
                              },
                              "& h1, & h2, & h3": {
                                mt: 2.5,
                                mb: 1,
                                color: "#1b3026",
                                lineHeight: 1.3,
                                width: "100%",
                                maxWidth: "100%",
                                whiteSpace: "normal !important",
                                overflowWrap: "break-word",
                                wordBreak: "normal",
                                hyphens: "none",
                              },
                              "& h2": { color: "#2b6f56", textAlign: "center" },
                              "& h3": { textAlign: "left" },
                              "& .ql-align-center": { textAlign: "center !important" },
                              "& .ql-align-right": { textAlign: "right !important" },
                              "& .ql-align-justify": { textAlign: "justify !important" },
                              "& .ql-indent-1": { paddingLeft: "3em !important" },
                              "& .ql-indent-2": { paddingLeft: "6em !important" },
                              "& .ql-indent-3": { paddingLeft: "9em !important" },
                              "& .ql-indent-4": { paddingLeft: "12em !important" },
                              "& .ql-indent-5": { paddingLeft: "15em !important" },
                              "& a": { color: "#2b6f56" },
                            }}
                            dangerouslySetInnerHTML={{ __html: sanitizedAns }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              whiteSpace: "pre-wrap",
                              color: "#2d2d2d",
                              lineHeight: 1.85,
                            }}
                          >
                            {ans}
                          </Typography>
                        )}
                        {getYoutubeEmbedSrc(item.youtubeUrl) ? (
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              maxWidth: 640,
                              pt: "56.25%",
                              mt: 2,
                              borderRadius: "4px",
                              overflow: "hidden",
                              bgcolor: "#000",
                            }}
                          >
                            <Box
                              component="iframe"
                              src={getYoutubeEmbedSrc(item.youtubeUrl)}
                              title="YouTube"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                border: 0,
                              }}
                            />
                          </Box>
                        ) : null}
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              )}
            </Box>
          ))
        )}
        </Box>
      </Container>
    </Box>
  );
}
