import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Divider,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNewsArticleBySlug, getNewsArticles } from "../services/newsApi";
import {
  getYoutubeEmbedSrc,
  replaceYoutubeLinksWithEmbeds,
} from "../utils/youtubeEmbed";

export default function NewsArticlePage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "vi";
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    setLoading(true);
    globalThis.scrollTo({ top: 0, behavior: "auto" });
    getNewsArticleBySlug(slug)
      .then((res) => {
        if (res.success) setArticle(res.data);
        else setError("notfound");
      })
      .catch(() => setError("notfound"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    getNewsArticles({ limit: 6 })
      .then((res) => {
        if (!res.success) return;
        setRelatedArticles(res.data || []);
      })
      .catch(() => setRelatedArticles([]));
  }, [slug]);

  const body = article?.content?.[lang] || "";
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);
  const locale = lang === "vi" ? "vi-VN" : "en-US";
  const publishedDate = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(locale)
    : "";
  const related = useMemo(
    () =>
      relatedArticles.filter((item) => item.slug !== article?.slug).slice(0, 3),
    [relatedArticles, article?.slug],
  );
  const blogCategoryPath = "/news";
  const normalizedTitle = (article?.title?.[lang] || "")
    .toLowerCase()
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll(/[^\p{L}\p{N}\s]/gu, "")
    .replaceAll(/\s+/g, " ")
    .trim();
  const normalizedBody = useMemo(() => {
    if (!isHtml) return body;
    if (!normalizedTitle) return body;

    const headingRegex = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi;
    let matchedHeading = "";

    for (const match of body.matchAll(headingRegex)) {
      const headingText = (match[1] || "")
        .replaceAll(/<[^>]+>/g, " ")
        .replaceAll(/[^\p{L}\p{N}\s]/gu, "")
        .replaceAll(/\s+/g, " ")
        .trim()
        .toLowerCase();

      if (!headingText) continue;
      if (
        headingText === normalizedTitle ||
        normalizedTitle.includes(headingText) ||
        headingText.includes(normalizedTitle)
      ) {
        matchedHeading = match[0];
        break;
      }
    }

    if (!matchedHeading) return body;
    return body.replace(matchedHeading, "");
  }, [body, isHtml, normalizedTitle]);
  const sanitizedBody = useMemo(() => {
    if (!isHtml) return normalizedBody;
    const baseHtml = normalizedBody
      .replaceAll(/&nbsp;|&#160;/gi, " ")
      .replaceAll(/\u00A0/g, " ")
      .replaceAll(
        /<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi,
        (_, tag, attrs = "", inner = "") => {
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
        },
      )
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
    const withImageGrid = withFigureCaptions.replaceAll(
      /(?:<p[^>]*>\s*<img[^>]*>\s*<\/p>\s*){2,}/gi,
      (block) => {
        const imageParagraphs = block.match(/<p[^>]*>\s*<img[^>]*>\s*<\/p>/gi) || [];
        if (imageParagraphs.length < 2) return block;
        const cells = imageParagraphs
          .map((paragraph) => `<div class="article-image-cell">${paragraph}</div>`)
          .join("");
        return `<div class="article-image-grid">${cells}</div>`;
      },
    );
    return replaceYoutubeLinksWithEmbeds(withImageGrid);
  }, [isHtml, normalizedBody]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#2b6f56" }} />
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography>
          {lang === "vi" ? "Không tìm thấy bài viết." : "Article not found."}
        </Typography>
        <Typography
          component={Link}
          to={blogCategoryPath}
          sx={{ color: "#2b6f56", mt: 2, display: "inline-block" }}
        >
          ← {lang === "vi" ? "Về trang tin" : "Back to news"}
        </Typography>
      </Container>
    );
  }

  const heroImage = article.coverImage?.url || article.thumbnail?.url || "";

  return (
    <Box sx={{ bgcolor: "#f5f2eb", minHeight: "70vh" }}>
      {heroImage ? (
        <Box
          sx={{
            width: "100%",
            minHeight: { xs: 220, sm: 290, md: 380 },
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 760,
            mx: "auto",
            px: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "center",
              gap: 0.75,
              color: "rgba(0,0,0,0.62)",
              fontWeight: 600,
              alignItems: "center",
              fontSize: "0.9rem",
            }}
          >
            <Typography
              component={Link}
              to={blogCategoryPath}
              sx={{
                color: "#2b6f56",
                textDecoration: "none",
                fontSize: "inherit",
                fontWeight: "inherit",
              }}
            >
              {lang === "vi" ? "Tin tức" : "News"}
            </Typography>
            <Box component="span">→</Box>
            <Typography
              component={Link}
              to={blogCategoryPath}
              sx={{
                color: "#2b6f56",
                textDecoration: "none",
                fontSize: "inherit",
                fontWeight: "inherit",
              }}
            >
              {lang === "vi" ? "Bài viết" : "Our blog"}
            </Typography>
          </Typography>
          {article.publishedAt && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.6, textAlign: "right", pr: { xs: 0.5, sm: 0 } }}
            >
              {publishedDate}
            </Typography>
          )}
          <Typography
            variant="h1"
            sx={{
              mb: 3,
              fontWeight: 800,
              lineHeight: 1.2,
              fontSize: { xs: "1.7rem", md: "2.15rem" },
              color: "#1b3026",
            }}
          >
            {article.title?.[lang]}
          </Typography>
          {getYoutubeEmbedSrc(article.youtubeUrl) && (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                pt: "56.25%",
                mb: 4,
                borderRadius: "4px",
                overflow: "hidden",
                bgcolor: "#000",
              }}
            >
              <Box
                component="iframe"
                src={getYoutubeEmbedSrc(article.youtubeUrl)}
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
          )}
          <Box
            sx={{
              width: "100%",
              maxWidth: 760,
              mx: "auto",
              overflowX: "hidden",
            }}
          >
            {isHtml ? (
              <Box
                className="news-article-body"
                sx={{
                  color: "#2c2c2c",
                  lineHeight: 1.9,
                  fontSize: { xs: "1rem", md: "1.03rem" },
                  fontFamily: '"Times New Roman", Georgia, serif',
                  textAlign: "left",
                  overflowX: "hidden",
                  "&, & *": { boxSizing: "border-box", maxWidth: "100%" },
                  "& > *": {
                    width: "100% !important",
                    maxWidth: "100% !important",
                    marginLeft: "0 !important",
                    marginRight: "0 !important",
                  },
                  "& div, & section, & article": {
                    maxWidth: "100% !important",
                    width: "100% !important",
                    marginLeft: "0 !important",
                    marginRight: "0 !important",
                  },
                  "& p, & li, & div, & span": {
                    whiteSpace: "normal !important",
                    overflowWrap: "break-word",
                    wordBreak: "normal",
                    hyphens: "none",
                  },
                  "& .ql-align-center": { textAlign: "center !important" },
                  "& .ql-align-right": { textAlign: "right !important" },
                  "& .ql-align-justify": { textAlign: "justify !important" },
                  "& .ql-indent-1": { paddingLeft: "3em !important" },
                  "& .ql-indent-2": { paddingLeft: "6em !important" },
                  "& .ql-indent-3": { paddingLeft: "9em !important" },
                  "& .ql-indent-4": { paddingLeft: "12em !important" },
                  "& .ql-indent-5": { paddingLeft: "15em !important" },
                  "& table": {
                    display: "block",
                    width: "100% !important",
                    overflowX: "auto",
                  },
                  "& pre, & code": {
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: "4px",
                    my: 1.5,
                    objectFit: "contain",
                  },
                  "& .article-figure": {
                    margin: "1rem 0 1.25rem",
                    width: "100%",
                  },
                  "& .article-figure > p": { margin: 0 },
                  "& .article-figure img": { margin: 0, display: "block" },
                  "& .article-figure figcaption": {
                    marginTop: "0.35rem",
                    textAlign: "center",
                    fontStyle: "italic",
                    color: "rgba(0,0,0,0.72)",
                    fontSize: "0.96rem",
                    lineHeight: 1.5,
                  },
                  "& .article-image-grid": {
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.25,
                    margin: "0.9rem 0 1.1rem",
                    alignItems: "start",
                  },
                  "& .article-image-cell > p": { margin: 0 },
                  "& .article-image-cell img": {
                    width: "100%",
                    margin: 0,
                    display: "block",
                  },
                  "& .ql-video": {
                    width: "100%",
                    maxWidth: "100%",
                    minHeight: 260,
                    aspectRatio: "16 / 9",
                    border: 0,
                    borderRadius: "4px",
                    display: "block",
                    margin: "16px auto",
                    backgroundColor: "#000",
                  },
                  "& p": { mb: 1.6 },
                  "& h1, & h2, & h3": {
                    mt: 3.2,
                    mb: 1.2,
                    fontWeight: 700,
                    color: "#1b3026",
                    fontFamily: '"Times New Roman", Georgia, serif',
                    lineHeight: 1.28,
                    textAlign: "left",
                    width: "100%",
                    maxWidth: "100%",
                    marginLeft: "0 !important",
                    marginRight: "0 !important",
                    whiteSpace: "normal !important",
                    overflowWrap: "break-word",
                    wordBreak: "normal",
                    hyphens: "none",
                  },
                  "& h1": { fontSize: { xs: "1.75rem", md: "2.05rem" } },
                  "& h2": {
                    fontSize: { xs: "1.55rem", md: "1.85rem" },
                    color: "#2b6f56",
                    textAlign: "center",
                  },
                  "& h3": {
                    fontSize: { xs: "1.35rem", md: "1.55rem" },
                    textAlign: "left",
                    color: "#1f1f1f",
                  },
                  "& ul, & ol": { pl: 2.5, mb: 1.5 },
                  "& a": { color: "#2b6f56" },
                  "& blockquote": {
                    borderLeft: "3px solid #c9c2b4",
                    pl: 2,
                    ml: 0,
                    color: "rgba(0,0,0,0.7)",
                    fontStyle: "italic",
                  },
                }}
                dangerouslySetInnerHTML={{ __html: sanitizedBody }}
              />
            ) : (
              <Typography
                component="div"
                sx={{
                  whiteSpace: "pre-wrap",
                  color: "#2c2c2c",
                  lineHeight: 1.9,
                  fontSize: { xs: "1rem", md: "1.03rem" },
                  fontFamily: '"Times New Roman", Georgia, serif',
                  textAlign: "left",
                  overflowWrap: "break-word",
                  wordBreak: "normal",
                  hyphens: "none",
                }}
              >
                {body}
              </Typography>
            )}
          </Box>
        </Box>

        {related.length > 0 && (
          <Box sx={{ maxWidth: 1060, mx: "auto", mt: { xs: 6, md: 8 } }}>
            <Divider sx={{ mb: 4, borderColor: "rgba(0,0,0,0.12)" }} />
            <Typography
              sx={{
                fontWeight: 800,
                color: "#1b3026",
                mb: 2.5,
                fontSize: { xs: "1.4rem", md: "1.8rem" },
              }}
            >
              {lang === "vi" ? "Khám phá thêm" : "Discover More"}
            </Typography>
            <Grid container spacing={3}>
              {related.map((item) => (
                <Grid item xs={12} md={4} key={item._id}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: "4px",
                      overflow: "hidden",
                      bgcolor: "#fff",
                      height: "100%",
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      to={`/news/${item.slug}`}
                      sx={{ height: "100%" }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          aspectRatio: "16 / 9",
                          bgcolor: "#e8e4dc",
                        }}
                      >
                        {item.thumbnail?.url ? (
                          <Box
                            component="img"
                            src={item.thumbnail.url}
                            alt={item.title?.[lang] || ""}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : null}
                      </Box>
                      <CardContent>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            lineHeight: 1.35,
                            color: "#1d1d1d",
                            mb: 1,
                          }}
                        >
                          {item.title?.[lang]}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(0,0,0,0.6)",
                            fontSize: "0.92rem",
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.excerpt?.[lang] || "\u00a0"}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}
