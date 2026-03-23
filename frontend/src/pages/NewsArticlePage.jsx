import React, { useEffect, useState } from "react";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNewsArticleBySlug } from "../services/newsApi";

export default function NewsArticlePage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "vi";
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getNewsArticleBySlug(slug)
      .then((res) => {
        if (res.success) setArticle(res.data);
        else setError("notfound");
      })
      .catch(() => setError("notfound"))
      .finally(() => setLoading(false));
  }, [slug]);

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
          to="/news"
          sx={{ color: "#2b6f56", mt: 2, display: "inline-block" }}
        >
          ← {lang === "vi" ? "Về trang tin" : "Back to news"}
        </Typography>
      </Container>
    );
  }

  const body = article.content?.[lang] || "";
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);

  return (
    <Box sx={{ bgcolor: "#fcfaf6", minHeight: "70vh", py: 5 }}>
      <Container maxWidth="md">
        <Typography
          component={Link}
          to="/news"
          variant="body2"
          sx={{
            color: "#2b6f56",
            textDecoration: "none",
            fontWeight: 600,
            display: "inline-block",
            mb: 2,
          }}
        >
          ← {lang === "vi" ? "Tin tức" : "News"}
        </Typography>
        {article.categoryId?.slug && (
          <Typography
            component={Link}
            to={`/news/category/${article.categoryId.slug}`}
            variant="caption"
            sx={{
              display: "block",
              color: "#666",
              mb: 1,
              textDecoration: "none",
            }}
          >
            {article.categoryId.name?.[lang] || article.categoryId.slug}
          </Typography>
        )}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "#1b3a2d",
            mb: 2,
            fontSize: { xs: "1.75rem", md: "2.25rem" },
          }}
        >
          {article.title?.[lang]}
        </Typography>
        {article.publishedAt && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {new Date(article.publishedAt).toLocaleDateString(
              lang === "vi" ? "vi-VN" : "en-US",
            )}
          </Typography>
        )}
        {article.thumbnail?.url && (
          <Box
            component="img"
            src={article.thumbnail.url}
            alt=""
            sx={{
              width: "100%",
              borderRadius: 2,
              mb: 3,
              maxHeight: 420,
              objectFit: "cover",
            }}
          />
        )}
        {isHtml ? (
          <Box
            className="news-article-body"
            sx={{
              color: "#333",
              lineHeight: 1.8,
              "& img": { maxWidth: "100%" },
            }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <Typography
            component="div"
            sx={{ whiteSpace: "pre-wrap", color: "#333", lineHeight: 1.9 }}
          >
            {body}
          </Typography>
        )}
      </Container>
    </Box>
  );
}
