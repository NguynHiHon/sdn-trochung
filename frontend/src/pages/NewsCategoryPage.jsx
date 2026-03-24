import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNewsArticles, getNewsCategories } from "../services/newsApi";

const PAGE_SIZE = 9;

export default function NewsCategoryPage() {
  const { slug } = useParams();
  const categorySlug = slug || "our-blog";
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "vi";
  const [categoryName, setCategoryName] = useState("");
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [listPage, setListPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    getNewsCategories().then((res) => {
      if (res.success) {
        const c = (res.data || []).find((x) => x.slug === categorySlug);
        if (c) setCategoryName(c.name?.[lang] || c.slug);
      }
    });
  }, [categorySlug, lang]);

  useEffect(() => {
    if (categorySlug !== "our-blog") {
      setFeaturedArticles([]);
      return;
    }
    getNewsArticles({
      categorySlug,
      featured: "true",
      sort: "latest",
      page: 1,
      limit: 5,
    })
      .then((res) => {
        if (res.success) setFeaturedArticles(res.data || []);
      })
      .catch(() => setFeaturedArticles([]));
  }, [categorySlug]);

  useEffect(() => {
    let cancelled = false;
    setLoadingInitial(true);
    setListPage(1);
    setArticles([]);
    setTotalPages(1);
    getNewsArticles({ categorySlug, sort: "latest", page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled || !res.success) return;
        setArticles(res.data || []);
        setTotalPages(res.totalPages || 1);
      })
      .finally(() => {
        if (!cancelled) setLoadingInitial(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loadingInitial || listPage >= totalPages) return;
    setLoadingMore(true);
    const nextPage = listPage + 1;
    try {
      const res = await getNewsArticles({
        categorySlug,
        sort: "latest",
        page: nextPage,
        limit: PAGE_SIZE,
      });
      if (res.success) {
        const chunk = res.data || [];
        setArticles((prev) => {
          const seen = new Set(prev.map((a) => String(a._id)));
          const merged = [...prev];
          for (const a of chunk) {
            const id = String(a._id);
            if (!seen.has(id)) {
              seen.add(id);
              merged.push(a);
            }
          }
          return merged;
        });
        setListPage(nextPage);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [categorySlug, listPage, totalPages, loadingMore, loadingInitial]);

  const pageBg = "#f5f2eb";
  const imageAreaSx = {
    width: "100%",
    aspectRatio: "16 / 9",
    bgcolor: "#e9e6df",
    overflow: "hidden",
    flexShrink: 0,
  };
  const hasArticles = articles.length > 0;
  const primaryFeatured = featuredArticles[0];
  const sideFeatured = featuredArticles.slice(1, 5);
  const hasMore = listPage < totalPages;
  const loadMoreLabel = lang === "vi" ? "Tải thêm" : "Load more";

  return (
    <Box sx={{ bgcolor: pageBg, minHeight: "70vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center" }}>
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
          <Box
            sx={{
              width: 66,
              height: 3,
              bgcolor: "#d8b23e",
              borderRadius: 99,
              mb: 3,
              mx: "auto",
            }}
          />
        </Box>
        {categorySlug === "our-blog" && featuredArticles.length > 0 ? (
          <Box sx={{ mb: { xs: 5, md: 6.5 } }}>
            <Grid container spacing={3}>
              {primaryFeatured ? (
                <Grid item xs={12} md={7}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      bgcolor: "#ffffff",
                      borderRadius: "4px",
                      overflow: "hidden",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      to={`/news/${primaryFeatured.slug}`}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          aspectRatio: { xs: "16 / 10", md: "16 / 9" },
                          bgcolor: "#e9e6df",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {primaryFeatured.thumbnail?.url ? (
                          <Box
                            component="img"
                            src={primaryFeatured.thumbnail.url}
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
                      <CardContent sx={{ pt: 2.2, px: 2.4, pb: 2.4 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "1.4rem", md: "1.95rem" },
                            lineHeight: 1.2,
                            color: "#1b3026",
                            mb: 1.25,
                          }}
                        >
                          {primaryFeatured.title?.[lang]}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            lineHeight: 1.55,
                            color: "rgba(0,0,0,0.7)",
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {primaryFeatured.excerpt?.[lang] || "\u00a0"}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ) : null}
              <Grid item xs={12} md={5}>
                <Box sx={{ display: "grid", gap: 2.15 }}>
                  {sideFeatured.map((a) => (
                    <Card
                      key={a._id}
                      elevation={0}
                      sx={{
                        bgcolor: "#ffffff",
                        borderRadius: "4px",
                        overflow: "hidden",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                      }}
                    >
                      <CardActionArea
                        component={Link}
                        to={`/news/${a.slug}`}
                        sx={{
                          p: 1.2,
                          display: "flex",
                          alignItems: "stretch",
                          gap: 1.1,
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 130, sm: 170, md: 150 },
                            minWidth: { xs: 130, sm: 170, md: 150 },
                            aspectRatio: "16 / 9",
                            bgcolor: "#e9e6df",
                            overflow: "hidden",
                            borderRadius: "4px",
                          }}
                        >
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
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              lineHeight: 1.35,
                              color: "#1b3026",
                              mb: 0.55,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              fontSize: { xs: "1rem", md: "1.05rem" },
                            }}
                          >
                            {a.title?.[lang]}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.96rem",
                              lineHeight: 1.5,
                              color: "rgba(0,0,0,0.62)",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {a.excerpt?.[lang] || "\u00a0"}
                          </Typography>
                        </Box>
                      </CardActionArea>
                    </Card>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : null}
        {loadingInitial ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#2b6f56" }} />
          </Box>
        ) : null}
        {!loadingInitial && !hasArticles ? (
          <Typography sx={{ color: "rgba(0,0,0,0.5)" }}>
            {lang === "vi" ? "Không có bài viết." : "No articles."}
          </Typography>
        ) : null}
        {!loadingInitial && hasArticles ? (
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
                      to={`/news/${a.slug}`}
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
            {hasMore ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  sx={{
                    borderColor: "#2b6f56",
                    color: "#2b6f56",
                    px: 4,
                    py: 1.25,
                    fontWeight: 700,
                    "&:hover": {
                      borderColor: "#1b3026",
                      color: "#1b3026",
                      bgcolor: "rgba(43,111,86,0.06)",
                    },
                  }}
                >
                  {loadingMore ? (
                    <CircularProgress size={22} sx={{ color: "#2b6f56" }} />
                  ) : (
                    loadMoreLabel
                  )}
                </Button>
              </Box>
            ) : null}
          </>
        ) : null}
      </Container>
    </Box>
  );
}
