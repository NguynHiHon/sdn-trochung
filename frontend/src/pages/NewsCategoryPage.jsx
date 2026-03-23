import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Pagination,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNewsArticles, getNewsCategories } from "../services/newsApi";

export default function NewsCategoryPage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "vi";
  const [categoryName, setCategoryName] = useState("");
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewsCategories().then((res) => {
      if (res.success) {
        const c = (res.data || []).find((x) => x.slug === slug);
        if (c) setCategoryName(c.name?.[lang] || c.slug);
      }
    });
  }, [slug, lang]);

  useEffect(() => {
    setLoading(true);
    getNewsArticles({ categorySlug: slug, page, limit: 9 })
      .then((res) => {
        if (res.success) {
          setArticles(res.data || []);
          setTotalPages(res.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, page]);

  const pageBg = "#f5f2eb";
  const imageAreaSx = {
    width: "100%",
    aspectRatio: "16 / 9",
    bgcolor: "#e9e6df",
    overflow: "hidden",
    flexShrink: 0,
  };
  const hasArticles = articles.length > 0;

  return (
    <Box sx={{ bgcolor: pageBg, minHeight: "70vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#1b3026",
            mb: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {categoryName || slug}
        </Typography>
        <Box sx={{ width: 66, height: 3, bgcolor: "#d8b23e", borderRadius: 99, mb: 3 }} />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#2b6f56" }} />
          </Box>
        ) : null}
        {!loading && !hasArticles ? (
          <Typography sx={{ color: "rgba(0,0,0,0.5)" }}>
            {lang === "vi" ? "Không có bài viết." : "No articles."}
          </Typography>
        ) : null}
        {!loading && hasArticles ? (
          <>
            <Grid container spacing={3}>
              {articles.map((a) => (
                <Grid item xs={12} sm={6} md={4} key={a._id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      bgcolor: "#ffffff",
                      borderRadius: "4px",
                      overflow: "hidden",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                      transition: "box-shadow 0.2s ease, transform 0.2s ease",
                      "&:hover": { boxShadow: "0 8px 18px rgba(0,0,0,0.1)" },
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      to={`/news/article/${a.slug}`}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                      }}
                    >
                      <Box sx={imageAreaSx}>
                        {a.thumbnail?.url ? (
                          <Box
                            component="img"
                            src={a.thumbnail.url}
                            alt=""
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : null}
                      </Box>
                      <CardContent
                        sx={{
                          flex: 1,
                          textAlign: "left",
                          pt: 2.5,
                          px: 2.5,
                          pb: 2.5,
                          "&:last-child": { pb: 2.5 },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.0625rem",
                            lineHeight: 1.35,
                            color: "#1b3026",
                            mb: 1.25,
                          }}
                        >
                          {a.title?.[lang]}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            lineHeight: 1.55,
                            color: "rgba(0,0,0,0.62)",
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {a.excerpt?.[lang] || "\u00a0"}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, v) => setPage(v)}
                  color="primary"
                  sx={{ "& .Mui-selected": { bgcolor: "#2b6f56 !important" } }}
                />
              </Box>
            )}
          </>
        ) : null}
      </Container>
    </Box>
  );
}
