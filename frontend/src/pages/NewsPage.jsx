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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNewsArticles } from "../services/newsApi";

/** Beige page + white cards, 3-column grid — 6 cards (2 rows), then each “Load more” fetches one more row of 3 */
const PAGE_BG = "#f5f2eb";
const GRID_ROW = 3;
const INITIAL_GRID_PAGES = 2;
const imageAreaSx = {
  width: "100%",
  aspectRatio: "16 / 9",
  bgcolor: "#e9e6df",
  overflow: "hidden",
  flexShrink: 0,
};

export default function NewsPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "vi";
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [listPage, setListPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListPage(1);
    setArticles([]);
    setTotalPages(1);
    Promise.all([
      getNewsArticles({ featured: "true", sort: "latest", page: 1, limit: 5 }),
      getNewsArticles({ featured: "false", sort: "latest", page: 1, limit: GRID_ROW }),
      getNewsArticles({ featured: "false", sort: "latest", page: 2, limit: GRID_ROW }),
    ])
      .then(([featuredRes, normalRes1, normalRes2]) => {
        if (cancelled) return;
        if (featuredRes?.success) setFeaturedArticles(featuredRes.data || []);
        if (normalRes1?.success) {
          const a1 = normalRes1.data || [];
          const a2 = normalRes2?.success ? normalRes2.data || [] : [];
          const seen = new Set();
          const merged = [];
          for (const a of [...a1, ...a2]) {
            const id = String(a._id);
            if (!seen.has(id)) {
              seen.add(id);
              merged.push(a);
            }
          }
          setArticles(merged);
          const pages = normalRes1.totalPages || 1;
          setTotalPages(pages);
          setListPage(Math.min(INITIAL_GRID_PAGES, pages));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || listPage >= totalPages) return;
    setLoadingMore(true);
    const nextPage = listPage + 1;
    try {
      const res = await getNewsArticles({ featured: "false", sort: "latest", page: nextPage, limit: GRID_ROW });
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
  }, [listPage, totalPages, loadingMore, loading]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 10,
          bgcolor: PAGE_BG,
          minHeight: "70vh",
        }}
      >
        <CircularProgress sx={{ color: "#2b6f56" }} />
      </Box>
    );
  }

  const primaryFeatured = featuredArticles[0];
  const sideFeatured = featuredArticles.slice(1, 5);
  const hasMore = listPage < totalPages;
  const loadMoreLabel = lang === "vi" ? "Tải thêm" : "Load more";

  return (
    <Box sx={{ bgcolor: PAGE_BG, minHeight: "70vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: "#1b3026", mb: 1, letterSpacing: "-0.02em" }}>
            {lang === "vi" ? "Tin tức" : "Our blog"}
          </Typography>
          <Box sx={{ width: 70, height: 3, bgcolor: "#d8b23e", borderRadius: 99, mb: 2.5, mx: "auto" }} />
        </Box>
        <Typography
          variant="body1"
          sx={{
            mb: { xs: 4, md: 5 },
            maxWidth: 720,
            mx: "auto",
            textAlign: "center",
            color: "rgba(0,0,0,0.62)",
            lineHeight: 1.6,
          }}
        >
          {lang === "vi"
            ? "Cập nhật cộng đồng, du lịch bền vững, mẹo trekking và điểm đến — nội dung do ban quản trị cập nhật."
            : "Community updates, sustainable travel, trekking tips and destinations — curated by our team."}
        </Typography>

        {featuredArticles.length > 0 ? (
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
                      to={`/news/article/${primaryFeatured.slug}`}
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
                        to={`/news/article/${a.slug}`}
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

        {articles.length === 0 ? (
          <Typography sx={{ color: "rgba(0,0,0,0.5)" }}>
            {lang === "vi" ? "Chưa có tin tức." : "No news yet."}
          </Typography>
        ) : (
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
                      "&:hover": {
                        boxShadow: "0 8px 18px rgba(0,0,0,0.1)",
                      },
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
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
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
                            flex: 1,
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
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  sx={{
                    borderColor: "#2b6f56",
                    color: "#2b6f56",
                    px: 3,
                    py: 0.75,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "4px",
                    "&:hover": { borderColor: "#1b3026", color: "#1b3026", bgcolor: "rgba(43,111,86,0.06)" },
                  }}
                >
                  {loadingMore ? <CircularProgress size={22} sx={{ color: "#2b6f56" }} /> : loadMoreLabel}
                </Button>
              </Box>
            ) : null}
          </>
        )}
      </Container>
    </Box>
  );
}
