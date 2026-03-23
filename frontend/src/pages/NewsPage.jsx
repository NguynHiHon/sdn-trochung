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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNewsArticles } from "../services/newsApi";

/** Beige page + white cards, 3-column grid — same visual language as reference “our blog” layouts */
const PAGE_BG = "#f5f2eb";
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
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNewsArticles({ page, limit: 9 })
      .then((res) => {
        if (res.success) {
          setArticles(res.data || []);
          setTotalPages(res.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

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

  return (
    <Box sx={{ bgcolor: PAGE_BG, minHeight: "70vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#1b3026", mb: 1, letterSpacing: "-0.02em" }}>
          {lang === "vi" ? "Tin tức" : "Our blog"}
        </Typography>
        <Box sx={{ width: 70, height: 3, bgcolor: "#d8b23e", borderRadius: 99, mb: 2.5 }} />
        <Typography
          variant="body1"
          sx={{
            mb: { xs: 4, md: 5 },
            maxWidth: 720,
            color: "rgba(0,0,0,0.62)",
            lineHeight: 1.6,
          }}
        >
          {lang === "vi"
            ? "Cập nhật cộng đồng, du lịch bền vững, mẹo trekking và điểm đến — nội dung do ban quản trị cập nhật."
            : "Community updates, sustainable travel, trekking tips and destinations — curated by our team."}
        </Typography>

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
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
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
        )}
      </Container>
    </Box>
  );
}
