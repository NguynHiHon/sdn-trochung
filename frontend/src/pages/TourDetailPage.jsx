import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { getTourById } from "../services/tourApi";
import { toast } from "sonner";
import AvailabilityCalendar from "../components/common/AvailabilityCalendar";

export default function TourDetailPage() {
  const { i18n } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("");

  const lang = i18n.language === "en" ? "en" : "vi";

  useEffect(() => {
    getTourById(code)
      .then((res) => {
        if (res.success) setTour(res.data);
      })
      .catch(() => toast.error("Không tải được thông tin tour"))
      .finally(() => setLoading(false));
  }, [code]);

  const txt = (field) => {
    if (!tour || !tour[field]) return null;
    const v = tour[field][lang] || tour[field].vi || tour[field].en;
    return v && v.trim() ? v : null;
  };

  const allSections = [
    {
      id: "highlights",
      vi: "Điểm nổi bật",
      en: "Highlights",
      check: () => !!txt("highlights"),
    },
    {
      id: "itinerary",
      vi: "Lịch trình",
      en: "Itinerary",
      check: () => tour?.itinerary?.length > 0,
    },
    {
      id: "photos",
      vi: "Hình ảnh",
      en: "Photos",
      check: () => tour?.gallery?.length > 0,
    },
    {
      id: "weather",
      vi: "Thời tiết & Khí hậu",
      en: "Weather & Climate",
      check: () => !!txt("weatherAndClimate"),
    },
    {
      id: "adventure-level",
      vi: "Cấp độ phiêu lưu",
      en: "Adventure Level",
      check: () => !!txt("adventureLevelDescription"),
    },
    {
      id: "fitness",
      vi: "Yêu cầu thể lực",
      en: "Fitness",
      check: () => !!txt("healthRequirements"),
    },
    {
      id: "safety",
      vi: "An toàn",
      en: "Safety",
      check: () => !!txt("safetyOnTour"),
    },
    {
      id: "communication",
      vi: "Liên lạc",
      en: "Communication",
      check: () => !!txt("communicationOnTour"),
    },
    {
      id: "what-to-bring",
      vi: "Cần mang gì",
      en: "What to Bring",
      check: () => !!txt("whatToBring"),
    },
    {
      id: "swimming",
      vi: "Bơi lội",
      en: "Swimming",
      check: () => !!txt("swimmingAtCampsites"),
    },
    {
      id: "toilet",
      vi: "Vệ sinh",
      en: "Toilet",
      check: () => !!txt("toiletAtCampsites"),
    },
    {
      id: "directions",
      vi: "Đường đến Phong Nha",
      en: "Directions",
      check: () => !!txt("directionsToPhongNha"),
    },
    {
      id: "booking-process",
      vi: "Quy trình đặt tour",
      en: "Booking Process",
      check: () => !!txt("tourBookingProcess"),
    },
    {
      id: "availability",
      vi: "Lịch còn trống",
      en: "Availability",
      check: () => true,
    },
    { id: "price", vi: "Giá tour", en: "Tour Price", check: () => true },
    {
      id: "cancellation",
      vi: "Chính sách hủy",
      en: "Cancellation",
      check: () => !!txt("cancellationPolicy"),
    },
    {
      id: "price-includes",
      vi: "Giá bao gồm",
      en: "Price Includes",
      check: () => !!txt("priceIncludes"),
    },
    {
      id: "booking-conditions",
      vi: "Điều kiện đặt",
      en: "Conditions",
      check: () => !!txt("bookingConditions"),
    },
    {
      id: "faqs",
      vi: "Câu hỏi",
      en: "FAQs",
      check: () => tour?.faqs?.length > 0,
    },
  ];

  const sections = tour ? allSections.filter((s) => s.check()) : [];

  useEffect(() => {
    if (!sections.length) return;
    if (!activeSection) setActiveSection(sections[0]?.id || "");
    const onScroll = () => {
      let cur = "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 180) cur = s.id;
      }
      if (cur) setActiveSection(cur);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections, activeSection]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 120,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  // ── Loading & Error ──
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#2b6f56" }} size={48} />
      </Box>
    );
  if (!tour)
    return (
      <Container sx={{ py: 15, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700}>
          Tour Not Found
        </Typography>
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          onClick={() => navigate("/")}
        >
          ← Home
        </Button>
      </Container>
    );

  const bannerUrl = tour.banner?.url || tour.thumbnail?.url;
  const levelLabels = [
    "",
    "Easy",
    "Moderate",
    "Challenging",
    "Strenuous",
    "Extreme",
    "Expert",
  ];

  const sidebarStats = [
    {
      emoji: "📅",
      label: lang === "vi" ? "Thời lượng" : "Duration",
      value: `${tour.durationDays} ${lang === "vi" ? "ngày" : "days"}`,
    },
    {
      emoji: "⚡",
      label: lang === "vi" ? "Cấp độ" : "Level",
      value: `${tour.adventureLevel}/6 — ${levelLabels[tour.adventureLevel] || ""}`,
    },
    tour.groupSize
      ? {
          emoji: "👥",
          label: lang === "vi" ? "Nhóm tối đa" : "Max group",
          value: `${tour.groupSize} ${lang === "vi" ? "khách" : "pax"}`,
        }
      : null,
    tour.ageMin
      ? {
          emoji: "🎂",
          label: lang === "vi" ? "Tuổi tối thiểu" : "Min age",
          value: `${tour.ageMin}+`,
        }
      : null,
    tour.ageMax
      ? {
          emoji: "🧓",
          label: lang === "vi" ? "Tuổi tối đa" : "Max age",
          value: `${tour.ageMax}`,
        }
      : null,
  ].filter(Boolean);

  // ── Render helpers ──
  const SectionTitle = ({ children }) => (
    <Typography
      variant="h5"
      sx={{
        fontWeight: 800,
        mb: 3,
        color: "#1b3a2d",
        fontSize: { xs: "1.35rem", md: "1.6rem" },
        position: "relative",
        pl: 2.5,
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 2,
          bottom: 2,
          width: 5,
          borderRadius: 3,
          bgcolor: "#2b6f56",
        },
      }}
    >
      {children}
    </Typography>
  );

  const ContentText = ({ text }) => (
    <Typography
      sx={{
        color: "#3d3d3d",
        lineHeight: 2.1,
        fontSize: "1.02rem",
        whiteSpace: "pre-line",
        letterSpacing: "0.01em",
      }}
    >
      {text}
    </Typography>
  );

  const SectionBlock = ({ id, title, children }) => (
    <Box id={id} sx={{ mb: 8, scrollMarginTop: "110px" }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </Box>
  );

  const textSections = [
    {
      id: "weather",
      field: "weatherAndClimate",
      vi: "Thời Tiết & Khí Hậu",
      en: "Weather and Climate",
    },
    {
      id: "adventure-level",
      field: "adventureLevelDescription",
      vi: "Cấp Độ Phiêu Lưu",
      en: "Adventure Level",
    },
    {
      id: "fitness",
      field: "healthRequirements",
      vi: "Yêu Cầu Thể Lực",
      en: "Fitness Requirements",
    },
    {
      id: "safety",
      field: "safetyOnTour",
      vi: "An Toàn Trong Tour",
      en: "Safety on Tour",
    },
    {
      id: "communication",
      field: "communicationOnTour",
      vi: "Liên Lạc Trong Tour",
      en: "Communication",
    },
    {
      id: "what-to-bring",
      field: "whatToBring",
      vi: "Cần Mang Theo",
      en: "What to Bring",
    },
    {
      id: "swimming",
      field: "swimmingAtCampsites",
      vi: "Bơi Lội Tại Khu Cắm Trại",
      en: "Swimming at Campsites",
    },
    {
      id: "toilet",
      field: "toiletAtCampsites",
      vi: "Nhà Vệ Sinh",
      en: "Toilet at Campsites",
    },
    {
      id: "directions",
      field: "directionsToPhongNha",
      vi: "Hướng Dẫn Đến Phong Nha",
      en: "Directions to Phong Nha",
    },
    {
      id: "booking-process",
      field: "tourBookingProcess",
      vi: "Quy Trình Đặt Tour",
      en: "Booking Process",
    },
    {
      id: "cancellation",
      field: "cancellationPolicy",
      vi: "Chính Sách Hủy Tour",
      en: "Cancellation Policy",
    },
    {
      id: "price-includes",
      field: "priceIncludes",
      vi: "Giá Bao Gồm",
      en: "Price Includes",
    },
    {
      id: "booking-conditions",
      field: "bookingConditions",
      vi: "Điều Kiện Đặt Tour",
      en: "Booking Conditions",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#faf8f4" }}>
      {/* ════════════ BANNER ════════════ */}
      <Box sx={{ position: "relative", width: "100%", bgcolor: "#111" }}>
        {bannerUrl ? (
          <Box
            component="img"
            src={bannerUrl}
            alt={tour.name[lang]}
            sx={{
              display: "block",
              width: "100%",
              height: "auto",
              maxHeight: 560,
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <Box
            sx={{
              height: { xs: 220, md: 340 },
              background:
                "linear-gradient(135deg, #0d3d2a 0%, #2b6f56 40%, #3a9a75 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h2"
              color="white"
              fontWeight={900}
              textAlign="center"
              px={4}
              sx={{ fontSize: { xs: "2rem", md: "3.5rem" } }}
            >
              {tour.name[lang]}
            </Typography>
          </Box>
        )}
        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.72), transparent)",
            pointerEvents: "none",
          }}
        />
        {/* Tour info on banner */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: { xs: 3, md: 5 },
          }}
        >
          <Container maxWidth="lg">
            <Typography
              sx={{
                color: "white",
                fontWeight: 900,
                mb: 1.5,
                fontSize: { xs: "1.6rem", sm: "2.2rem", md: "2.8rem" },
                textShadow: "0 2px 16px rgba(0,0,0,0.5)",
                lineHeight: 1.2,
              }}
            >
              {tour.name[lang]}
            </Typography>
            {tour.description?.[lang] && (
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: { xs: "0.9rem", md: "1.05rem" },
                  maxWidth: 650,
                  lineHeight: 1.7,
                  mb: 2,
                }}
              >
                {tour.description[lang].substring(0, 200)}
                {tour.description[lang].length > 200 ? "..." : ""}
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Chip
                icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                label={`${tour.durationDays} ${lang === "vi" ? "ngày" : "days"}`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontWeight: 600,
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              {tour.groupSize && (
                <Chip
                  icon={<GroupIcon sx={{ fontSize: 16 }} />}
                  label={`${tour.groupSize} ${lang === "vi" ? "khách" : "pax"}`}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontWeight: 600,
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              )}
              <Chip
                icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                label={`Level ${tour.adventureLevel}`}
                sx={{
                  bgcolor: "#f55d14",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                }}
              />
            </Box>
          </Container>
        </Box>
      </Box>

      {/* ════════════ STICKY HORIZONTAL NAV ════════════ */}
      {sections.length > 0 && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            bgcolor: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #e8e3da",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                overflowX: "auto",
                gap: 0,
                py: 0,
                "&::-webkit-scrollbar": { height: 0 },
              }}
            >
              {sections.map((sec) => (
                <Button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  disableRipple
                  sx={{
                    py: 1.8,
                    px: 2.2,
                    minWidth: "max-content",
                    fontSize: "0.82rem",
                    fontWeight: activeSection === sec.id ? 700 : 500,
                    borderRadius: 0,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    color: activeSection === sec.id ? "#2b6f56" : "#888",
                    borderBottom:
                      activeSection === sec.id
                        ? "3px solid #2b6f56"
                        : "3px solid transparent",
                    "&:hover": { bgcolor: "transparent", color: "#2b6f56" },
                  }}
                >
                  {sec[lang]}
                </Button>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* ════════════ MAIN BODY ════════════ */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Grid container spacing={{ xs: 3, md: 6 }}>
          {/* ──── LEFT: Content ──── */}
          <Grid item xs={12} md={8}>
            {/* Description block */}
            {tour.description?.[lang] && (
              <Box sx={{ mb: 8 }}>
                <Typography
                  sx={{ color: "#444", lineHeight: 2.1, fontSize: "1.08rem" }}
                >
                  {tour.description[lang]}
                </Typography>
              </Box>
            )}

            {/* Highlights */}
            {txt("highlights") && (
              <SectionBlock
                id="highlights"
                title={lang === "vi" ? "Điểm Nổi Bật" : "Highlights"}
              >
                <Box sx={{ bgcolor: "#eef6f1", borderRadius: 3, p: 3 }}>
                  <ContentText text={txt("highlights")} />
                </Box>
              </SectionBlock>
            )}

            {/* Itinerary */}
            {tour.itinerary?.length > 0 && (
              <SectionBlock
                id="itinerary"
                title={lang === "vi" ? "Lịch Trình" : "Itinerary"}
              >
                {tour.itinerary.map((day, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      position: "relative",
                      pl: 5,
                      pb: 4,
                      mb: 0,
                      borderLeft:
                        idx < tour.itinerary.length - 1
                          ? "2px solid #c8ddd1"
                          : "2px solid transparent",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: -7.5,
                        top: 4,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        bgcolor: "#2b6f56",
                        border: "3px solid #d6ece0",
                      },
                    }}
                  >
                    <Typography
                      fontWeight={800}
                      color="#2b6f56"
                      fontSize="1.05rem"
                      mb={0.5}
                    >
                      {lang === "vi" ? "Ngày" : "Day"} {day.dayNumber}
                      {day.title?.[lang] ? ` — ${day.title[lang]}` : ""}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#555",
                        lineHeight: 2,
                        whiteSpace: "pre-line",
                        fontSize: "0.97rem",
                      }}
                    >
                      {day.content?.[lang] || ""}
                    </Typography>
                  </Box>
                ))}
              </SectionBlock>
            )}

            {/* Gallery */}
            {tour.gallery?.length > 0 && (
              <SectionBlock
                id="photos"
                title={lang === "vi" ? "Hình Ảnh" : "Photos"}
              >
                <Grid container spacing={1.5}>
                  {tour.gallery.map((img, idx) => (
                    <Grid item xs={6} sm={4} md={idx === 0 ? 8 : 4} key={idx}>
                      <Box
                        component="img"
                        src={img.url}
                        alt={`photo-${idx}`}
                        sx={{
                          width: "100%",
                          height: idx === 0 ? 320 : 200,
                          objectFit: "cover",
                          borderRadius: 2,
                          transition: "transform .35s, box-shadow .35s",
                          cursor: "pointer",
                          "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </SectionBlock>
            )}

            {/* Dynamic text sections */}
            {textSections.map(({ id, field, vi, en }) => {
              const content = txt(field);
              if (!content) return null;
              return (
                <SectionBlock key={id} id={id} title={lang === "vi" ? vi : en}>
                  <ContentText text={content} />
                </SectionBlock>
              );
            })}

            {/* Availability Calendar */}
            <SectionBlock
              id="availability"
              title={
                lang === "vi"
                  ? "Lịch Khởi Hành Còn Trống"
                  : "Available Departures"
              }
            >
              <Typography variant="body2" color="#666" mb={3} lineHeight={1.8}>
                {lang === "vi"
                  ? "Lịch bên dưới hiển thị các ngày khởi hành còn chỗ. Các ô màu xanh là ngày còn trống — bấm vào để đặt ngay."
                  : "The calendar below shows departure dates with available slots. Green cells indicate availability — click to book."}
              </Typography>
              <AvailabilityCalendar
                tourId={tour._id}
                lang={lang}
                onSelectDate={(info) => navigate(`/tour/${tour.code}/book`)}
              />
            </SectionBlock>

            {/* Price */}
            <SectionBlock
              id="price"
              title={lang === "vi" ? "Giá Tour" : "Tour Price"}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #f0faf5 0%, #e8f5ee 100%)",
                  border: "1px solid #c8ddd1",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 2,
                    mb: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="#2b6f56">
                    {tour.priceVND?.toLocaleString("vi-VN")}₫
                  </Typography>
                  {tour.priceUSD && (
                    <Typography variant="h6" color="#777" fontWeight={500}>
                      / ${tour.priceUSD} USD
                    </Typography>
                  )}
                  <Typography variant="body2" color="#888">
                    {lang === "vi" ? "/ người" : "/ person"}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="#666"
                  mb={3}
                  lineHeight={1.8}
                >
                  {lang === "vi"
                    ? "Số lượng chỗ trên mỗi chuyến bị giới hạn nghiêm ngặt nhằm đảm bảo chất lượng dịch vụ và bảo tồn di sản thiên nhiên."
                    : "Places per departure are strictly limited to ensure quality and heritage conservation."}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(`/tour/${tour.code}/book`)}
                  sx={{
                    bgcolor: "#f55d14",
                    px: 6,
                    py: 1.6,
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    borderRadius: 2,
                    boxShadow: "0 4px 16px rgba(245,93,20,0.35)",
                    "&:hover": {
                      bgcolor: "#d94e0c",
                      boxShadow: "0 6px 20px rgba(245,93,20,0.45)",
                    },
                  }}
                >
                  {lang === "vi" ? "🎒 ĐẶT TOUR NGAY" : "🎒 BOOK NOW"}
                </Button>
              </Paper>
            </SectionBlock>

            {/* FAQs */}
            {tour.faqs?.length > 0 && (
              <SectionBlock id="faqs" title="FAQs">
                {tour.faqs.map((faq, idx) => (
                  <Accordion
                    key={idx}
                    defaultExpanded={idx === 0}
                    elevation={0}
                    sx={{
                      mb: 1.5,
                      borderRadius: "12px !important",
                      overflow: "hidden",
                      border: "1px solid #e2ddd3",
                      "&::before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#2b6f56" }} />}
                      sx={{ bgcolor: "#fbf9f6" }}
                    >
                      <Typography
                        fontWeight={700}
                        color="#1b3a2d"
                        fontSize="0.98rem"
                      >
                        {faq.question?.[lang]}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: "#fff", pt: 1 }}>
                      <Typography
                        color="#555"
                        sx={{ lineHeight: 2, whiteSpace: "pre-line" }}
                      >
                        {faq.answer?.[lang]}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </SectionBlock>
            )}
          </Grid>

          {/* ──── RIGHT: Sticky Sidebar ──── */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                position: "sticky",
                top: 75,
                maxHeight: "calc(100vh - 90px)",
                overflowY: "auto",
                pb: 2,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#c8ddd1",
                  borderRadius: 2,
                },
              }}
            >
              {/* Pricing Card */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  mb: 3,
                  border: "1px solid #d6e8de",
                  boxShadow: "0 4px 20px rgba(43,111,86,0.08)",
                }}
              >
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #1a5a3e 0%, #2b6f56 100%)",
                    p: 3.5,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    color="rgba(255,255,255,0.7)"
                    fontSize="0.8rem"
                    fontWeight={600}
                    letterSpacing={1.5}
                    textTransform="uppercase"
                    mb={0.5}
                  >
                    {lang === "vi" ? "Giá từ" : "From"}
                  </Typography>
                  <Typography
                    variant="h4"
                    color="white"
                    fontWeight={900}
                    letterSpacing="-0.5px"
                  >
                    {tour.priceVND?.toLocaleString("vi-VN")}₫
                  </Typography>
                  {tour.priceUSD && (
                    <Typography
                      color="rgba(255,255,255,0.65)"
                      fontSize="0.85rem"
                      mt={0.3}
                    >
                      ${tour.priceUSD} USD
                    </Typography>
                  )}
                </Box>
                <Box sx={{ p: 3 }}>
                  {sidebarStats.map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.3,
                        borderBottom:
                          i < sidebarStats.length - 1
                            ? "1px solid #f0ebe3"
                            : "none",
                      }}
                    >
                      <Typography variant="body2" color="#888">
                        {item.emoji} {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="#1b3a2d"
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => navigate(`/tour/${tour.code}/book`)}
                    sx={{
                      mt: 3,
                      bgcolor: "#f55d14",
                      py: 1.8,
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      borderRadius: 2,
                      letterSpacing: "0.04em",
                      boxShadow: "0 4px 16px rgba(245,93,20,0.30)",
                      "&:hover": {
                        bgcolor: "#d94e0c",
                        boxShadow: "0 6px 20px rgba(245,93,20,0.45)",
                      },
                    }}
                  >
                    {lang === "vi" ? "ĐẶT NGAY" : "BOOK NOW"}
                  </Button>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.8,
                      mt: 2,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 15, color: "#2b6f56" }} />
                    <Typography variant="caption" color="#999">
                      {lang === "vi"
                        ? "Xác nhận trong 24 giờ"
                        : "Confirmation within 24h"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Quick Navigate */}
              {sections.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid #e2ddd3",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ bgcolor: "#1b3a2d", px: 3, py: 2 }}>
                    <Typography
                      fontWeight={700}
                      color="white"
                      fontSize="0.85rem"
                      letterSpacing={0.5}
                    >
                      {lang === "vi" ? "📑 Nội dung trang" : "📑 On this page"}
                    </Typography>
                  </Box>
                  <List
                    disablePadding
                    sx={{
                      maxHeight: 380,
                      overflowY: "auto",
                      "&::-webkit-scrollbar": { width: 3 },
                      "&::-webkit-scrollbar-thumb": {
                        bgcolor: "#ddd",
                        borderRadius: 2,
                      },
                    }}
                  >
                    {sections.map((sec, i) => (
                      <React.Fragment key={sec.id}>
                        <ListItem
                          component="div"
                          onClick={() => scrollTo(sec.id)}
                          sx={{
                            cursor: "pointer",
                            borderLeft:
                              activeSection === sec.id
                                ? "4px solid #2b6f56"
                                : "4px solid transparent",
                            bgcolor:
                              activeSection === sec.id
                                ? "#eef6f1"
                                : "transparent",
                            transition: "all .2s",
                            "&:hover": {
                              bgcolor: "#f5f5f0",
                              borderLeftColor: "#2b6f5640",
                            },
                            py: 1.2,
                            px: 2.5,
                          }}
                        >
                          <ListItemText
                            primary={sec[lang]}
                            primaryTypographyProps={{
                              fontSize: "0.85rem",
                              fontWeight: activeSection === sec.id ? 700 : 500,
                              color:
                                activeSection === sec.id ? "#2b6f56" : "#666",
                            }}
                          />
                        </ListItem>
                        {i < sections.length - 1 && (
                          <Divider sx={{ opacity: 0.5 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
