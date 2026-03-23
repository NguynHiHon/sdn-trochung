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
    const hash = window.location.hash?.replace(/^#/, "");
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
    <Box sx={{ bgcolor: "#fcfaf6", minHeight: "70vh", py: 5 }}>
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{ fontWeight: 800, color: "#1b3a2d", mb: 1 }}
        >
          {lang === "vi" ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}
        </Typography>
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
                  color: "#2b6f56",
                  mb: 1.5,
                  borderBottom: "2px solid rgba(43,111,86,0.25)",
                  pb: 0.5,
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
                  return (
                    <Accordion
                      key={item._id}
                      disableGutters
                      elevation={0}
                      sx={{
                        mb: 1,
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: "8px !important",
                        "&:before": { display: "none" },
                        bgcolor: "white",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMoreIcon sx={{ color: "#2b6f56" }} />
                        }
                      >
                        <Typography sx={{ fontWeight: 600, color: "#1b3a2d" }}>
                          {item.question?.[lang]}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {html ? (
                          <Box
                            sx={{
                              color: "#444",
                              lineHeight: 1.8,
                              "& p": { mb: 1 },
                            }}
                            dangerouslySetInnerHTML={{ __html: ans }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              whiteSpace: "pre-wrap",
                              color: "#444",
                              lineHeight: 1.8,
                            }}
                          >
                            {ans}
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              )}
            </Box>
          ))
        )}
      </Container>
    </Box>
  );
}
