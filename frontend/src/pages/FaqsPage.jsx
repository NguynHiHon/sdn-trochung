import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Link as MuiLink,
  IconButton,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import { useTranslation } from "react-i18next";
import {
  Link as RouterLink,
  useLocation as useRouterLocation,
} from "react-router-dom";
import { toast } from "sonner";
import { getFaqTree } from "../services/faqApi";
import {
  sanitizeFaqAnswerHtml,
  stripLeadingFaqEnumeration,
} from "../utils/faqHtml";
import { getYoutubeEmbedSrc } from "../utils/youtubeEmbed";

const FAQ_SANS =
  '"Montserrat", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const PAGE_BG = "#ffffff";
const SIDEBAR_GREEN = "#1d5c45";
const SIDEBAR_LINE = "#2b6f56";
const ACCENT_GREEN = "#2b6f56";

/** Ảnh hang động (fallback khi chưa cấu hình banner trong admin) */
const DEFAULT_FAQ_HERO =
  "https://images.unsplash.com/photo-1504280393367-64d54a323fcc?auto=format&fit=crop&w=1920&q=80";

function buildGroups(items, lang) {
  return (items || []).reduce((acc, item) => {
    const groupLabel =
      (item.groupTitle?.[lang] || "").trim() ||
      (lang === "vi" ? "Khác" : "Other");
    const existed = acc.find((g) => g.label === groupLabel);
    if (existed) existed.items.push(item);
    else acc.push({ label: groupLabel, items: [item] });
    return acc;
  }, []);
}

function isGenericFaqGroupLabel(label) {
  return label === "Khác" || label === "Other";
}

/** Neo cuộn mục con 1.1 / 1.2 trong cùng trang FAQ (slug = category.slug) */
function faqGroupSectionId(categorySlug, groupIndexZeroBased) {
  return `faq-${categorySlug}-muc-${groupIndexZeroBased}`;
}

function flattenGroupItems(groups) {
  const rows = [];
  for (const group of groups) {
    const { label, items } = group;
    const isGeneric = isGenericFaqGroupLabel(label);
    (items || []).forEach((item, i) => {
      rows.push({
        item,
        groupLabel: label,
        /** Câu đầu của nhóm có đầu mục con → tiêu đề accordion = 1.1 + tên nhóm */
        useGroupTitleAsSummary: !isGeneric && i === 0,
      });
    });
  }
  return rows;
}

function FaqAnchorCopy({ fragmentId, lang }) {
  const location = useRouterLocation();
  const label =
    lang === "vi"
      ? "Sao chép liên kết tới đoạn này"
      : "Copy link to this section";
  const copy = async () => {
    const base = `${globalThis.location.origin}${location.pathname}${location.search}`;
    const url = `${base}#${fragmentId}`;
    try {
      await globalThis.navigator?.clipboard?.writeText(url);
      toast.success(lang === "vi" ? "Đã sao chép liên kết" : "Link copied");
    } catch {
      toast.error(lang === "vi" ? "Không sao chép được" : "Copy failed");
    }
  };
  return (
    <Tooltip title={label}>
      <IconButton
        size="small"
        onClick={() => void copy()}
        aria-label={label}
        sx={{ color: ACCENT_GREEN, flexShrink: 0 }}
      >
        <LinkIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Tooltip>
  );
}

export default function FaqsPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "vi";
  const location = useRouterLocation();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaqTree()
      .then((res) => {
        if (res.success) setSections(res.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const firstCat = sections[0]?.category;
  const heroOverlayTitle = lang === "vi" ? "Câu hỏi thường gặp" : "FAQs";
  const defaultHeroIntro =
    lang === "vi"
      ? "Chúng tôi đã tập hợp những câu hỏi thường gặp từ phía khách hàng theo từng chủ đề. Trong trường hợp câu hỏi của bạn chưa được hỏi, hãy liên hệ trực tiếp với chúng tôi."
      : "We have gathered frequently asked questions from our customers by topic. If your question is not listed here, please contact us directly.";
  const pageIntro =
    (firstCat?.subtitle?.[lang] || "").trim() || defaultHeroIntro;
  const heroImage = (firstCat?.heroImage?.url || "").trim() || DEFAULT_FAQ_HERO;

  const normalizedSections = useMemo(
    () =>
      sections.map(({ category, items }) => ({
        category,
        groups: buildGroups(items, lang),
      })),
    [sections, lang],
  );

  const scrollToFaqFragment = useCallback(() => {
    const raw = String(globalThis.location.hash || "").replace(/^#/, "");
    if (!raw) return;
    const fragment = decodeURIComponent(raw);
    const run = () => {
      const el = document.getElementById(fragment);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      let targetId = fragment;
      for (const { category } of sections) {
        if (!category) continue;
        if (category.slug === fragment) {
          targetId = category.slug;
          break;
        }
        const aliases = category.anchorAliases || [];
        if (aliases.includes(fragment)) {
          targetId = category.slug;
          break;
        }
      }
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [sections]);

  /* pathname + hash: cùng /faqs rồi chỉ đổi #... thì React Router không luôn bắn hashchange — phải phụ thuộc location.hash */
  useEffect(() => {
    if (loading || sections.length === 0) return;
    scrollToFaqFragment();
  }, [
    loading,
    sections,
    scrollToFaqFragment,
    location.pathname,
    location.hash,
  ]);

  const richBodySx = useMemo(
    () => ({
      color: "#2d2d2d",
      lineHeight: 1.85,
      fontSize: { xs: "0.98rem", md: "1.02rem" },
      fontFamily: FAQ_SANS,
      overflowWrap: "break-word",
      wordBreak: "normal",
      "& img": {
        maxWidth: "100%",
        height: "auto",
        borderRadius: "4px",
        my: 1.5,
      },
      "& .article-figure": { margin: "1rem 0 1.25rem", width: "100%" },
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
      "& p": { mb: 1.5 },
      "& h1, & h2, & h3": {
        mt: 2.5,
        mb: 1,
        fontWeight: 700,
        color: "#1b3026",
        fontFamily: FAQ_SANS,
      },
      "& h2": {
        fontSize: { xs: "1.25rem", md: "1.45rem" },
        color: ACCENT_GREEN,
      },
      "& h3": { fontSize: { xs: "1.1rem", md: "1.25rem" } },
      "& ul, & ol": { pl: 2.5, mb: 1.5 },
      "& a": { color: ACCENT_GREEN, fontWeight: 600 },
      "& blockquote": {
        borderLeft: "3px solid #c9c2b4",
        pl: 2,
        ml: 0,
        color: "rgba(0,0,0,0.7)",
        fontStyle: "italic",
      },
    }),
    [],
  );

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
        <CircularProgress sx={{ color: ACCENT_GREEN }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: PAGE_BG, minHeight: "70vh", fontFamily: FAQ_SANS }}>
      {/* Banner full width — cùng minHeight với trang chi tiết tin (NewsArticlePage) */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: { xs: 220, sm: 290, md: 380 },
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: 220, sm: 290, md: 380 },
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.2) 100%)",
            display: "flex",
            alignItems: "center",
            py: { xs: 4, md: 5 },
          }}
        >
          <Container maxWidth="lg" sx={{ width: "100%" }}>
            <Box
              sx={{ maxWidth: { xs: "100%", md: 720 }, px: { xs: 0, sm: 0 } }}
            >
              <Typography
                component="h1"
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.75rem" },
                  lineHeight: 1.15,
                  mb: { xs: 1.5, md: 2 },
                  fontFamily: FAQ_SANS,
                  letterSpacing: "-0.02em",
                }}
              >
                {heroOverlayTitle}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.95)",
                  lineHeight: 1.75,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  fontFamily: FAQ_SANS,
                  fontWeight: 400,
                }}
              >
                {pageIntro}
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}
      >
        {normalizedSections.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontFamily: FAQ_SANS }}>
            {lang === "vi" ? "Chưa có nội dung FAQ." : "No FAQs yet."}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: { xs: 3, md: 5 },
              alignItems: "flex-start",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Cột trái ~70% — nội dung */}
            <Box
              component="main"
              sx={{
                flex: { md: "1 1 0" },
                minWidth: 0,
                width: { xs: "100%", md: "auto" },
                maxWidth: { md: "calc(70% - 16px)" },
              }}
            >
              {normalizedSections.map(({ category, groups }, sectionIdx) => {
                const secNum = sectionIdx + 1;
                const catTitle = category.title?.[lang] || category.slug;
                const flatRows = flattenGroupItems(groups);

                return (
                  <Box
                    key={category._id}
                    id={category.slug}
                    sx={{ mb: { xs: 4, md: 5 }, scrollMarginTop: 100 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexWrap: "wrap",
                        pb: 1.25,
                        mb: 2,
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography
                        component="h2"
                        sx={{
                          flex: 1,
                          minWidth: 200,
                          fontWeight: 800,
                          color: "#1a1a1a",
                          fontSize: { xs: "1.35rem", md: "1.6rem" },
                          lineHeight: 1.35,
                          fontFamily: FAQ_SANS,
                        }}
                      >
                        {secNum}. {catTitle}
                      </Typography>
                      <FaqAnchorCopy fragmentId={category.slug} lang={lang} />
                    </Box>

                    <Box
                      sx={{
                        bgcolor: "#fff",
                        borderTop: "1px solid #e5e5e5",
                        borderBottom: "1px solid #e5e5e5",
                      }}
                    >
                      {flatRows.map(
                        (
                          { item, groupLabel, useGroupTitleAsSummary },
                          flatIdx,
                          arr,
                        ) => {
                          const qText = stripLeadingFaqEnumeration(
                            item.question?.[lang] || "",
                          );
                          const answerHtml = sanitizeFaqAnswerHtml(
                            item.answer?.[lang] || "",
                          );
                          const yt = getYoutubeEmbedSrc(item.youtubeUrl);
                          const groupOrdinal =
                            groups.findIndex((g) => g.label === groupLabel) + 1;
                          const groupTitlePlain =
                            stripLeadingFaqEnumeration(groupLabel) ||
                            groupLabel.trim();
                          const showGroupSummary =
                            useGroupTitleAsSummary && groupOrdinal > 0;

                          const groupSectionId =
                            showGroupSummary && groupOrdinal > 0
                              ? faqGroupSectionId(
                                  category.slug,
                                  groupOrdinal - 1,
                                )
                              : undefined;

                          return (
                            <Box
                              key={item._id}
                              id={groupSectionId}
                              sx={
                                groupSectionId
                                  ? { scrollMarginTop: "96px" }
                                  : undefined
                              }
                            >
                              <Accordion
                                disableGutters
                                elevation={0}
                                defaultExpanded={
                                  sectionIdx === 0 && flatIdx === 0
                                }
                                sx={{
                                  borderRadius: "0 !important",
                                  border: "none",
                                  borderBottom:
                                    flatIdx < arr.length - 1
                                      ? "1px solid #e5e5e5"
                                      : "none",
                                  bgcolor: "#fff",
                                  "&:before": { display: "none" },
                                }}
                              >
                                <AccordionSummary
                                  expandIcon={
                                    <ExpandMoreIcon sx={{ color: "#555" }} />
                                  }
                                  aria-controls={`faq-panel-${item._id}`}
                                  id={`faq-header-${item._id}`}
                                  sx={{
                                    px: 0,
                                    py: 0.5,
                                    minHeight: 56,
                                    "&.Mui-expanded": { minHeight: 56 },
                                    "& .MuiAccordionSummary-content": {
                                      my: 1.25,
                                      alignItems: "center",
                                    },
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: showGroupSummary ? 700 : 600,
                                      color: showGroupSummary
                                        ? "#1a1a1a"
                                        : "#2a2a2a",
                                      pr: 1,
                                      fontSize: { xs: "0.95rem", md: "1rem" },
                                      fontFamily: FAQ_SANS,
                                      ...(showGroupSummary
                                        ? {
                                            "& .faq-sum-num": {
                                              color: ACCENT_GREEN,
                                              fontWeight: 800,
                                              mr: 0.5,
                                            },
                                          }
                                        : {}),
                                    }}
                                    component="div"
                                  >
                                    {showGroupSummary ? (
                                      <>
                                        <Box
                                          component="span"
                                          className="faq-sum-num"
                                        >
                                          {secNum}.{groupOrdinal}
                                        </Box>
                                        {groupTitlePlain}
                                      </>
                                    ) : (
                                      qText
                                    )}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails
                                  id={`faq-panel-${item._id}`}
                                  sx={{
                                    pt: 0,
                                    px: 0,
                                    pb: 2.5,
                                    bgcolor: "#fff",
                                  }}
                                >
                                  {useGroupTitleAsSummary && qText ? (
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color: "#333",
                                        fontSize: {
                                          xs: "0.92rem",
                                          md: "0.98rem",
                                        },
                                        fontFamily: FAQ_SANS,
                                        lineHeight: 1.5,
                                        mb: answerHtml || yt ? 1.25 : 0,
                                      }}
                                    >
                                      {qText}
                                    </Typography>
                                  ) : null}
                                  {answerHtml ? (
                                    <Box
                                      className="faq-answer-body"
                                      sx={richBodySx}
                                      dangerouslySetInnerHTML={{
                                        __html: answerHtml,
                                      }}
                                    />
                                  ) : null}
                                  {yt ? (
                                    <Box
                                      component="iframe"
                                      src={yt}
                                      title="YouTube"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      sx={{
                                        width: "100%",
                                        maxWidth: "100%",
                                        minHeight: 220,
                                        aspectRatio: "16 / 9",
                                        border: 0,
                                        borderRadius: "4px",
                                        display: "block",
                                        mt: answerHtml ? 2 : 0,
                                        bgcolor: "#000",
                                      }}
                                    />
                                  ) : null}
                                </AccordionDetails>
                              </Accordion>
                            </Box>
                          );
                        },
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Cột phải ~30% — mục lục dọc */}
            <Box
              component="aside"
              sx={{
                flex: { md: "0 0 auto" },
                width: { xs: "100%", md: "min(30%, 300px)" },
                minWidth: { md: 240 },
                maxWidth: { md: 300 },
                position: { md: "sticky" },
                top: { md: 96 },
                alignSelf: "flex-start",
              }}
            >
              <Box
                component="nav"
                aria-label={
                  lang === "vi" ? "Mục lục FAQ" : "FAQ table of contents"
                }
                sx={{
                  borderLeft: `4px solid ${SIDEBAR_LINE}`,
                  pl: 2.25,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.1,
                }}
              >
                {normalizedSections.map(({ category, groups }, idx) => {
                  const secNum = idx + 1;
                  const label = category.title?.[lang] || category.slug;
                  return (
                    <React.Fragment key={category._id}>
                      <MuiLink
                        component={RouterLink}
                        to={`/faqs#${category.slug}`}
                        underline="none"
                        sx={{
                          color: SIDEBAR_GREEN,
                          fontWeight: 600,
                          fontSize: "0.92rem",
                          lineHeight: 1.5,
                          fontFamily: FAQ_SANS,
                          "&:hover": {
                            color: "#164a38",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {secNum}. {label}
                      </MuiLink>
                      {groups.map((g, gIdx) => {
                        if (isGenericFaqGroupLabel(g.label)) return null;
                        const subId = faqGroupSectionId(category.slug, gIdx);
                        const subLabel =
                          stripLeadingFaqEnumeration(g.label) || g.label.trim();
                        return (
                          <MuiLink
                            key={`${category._id}-muc-${gIdx}`}
                            component={RouterLink}
                            to={`/faqs#${subId}`}
                            underline="none"
                            sx={{
                              color: SIDEBAR_GREEN,
                              fontSize: "0.88rem",
                              lineHeight: 1.5,
                              pl: 1.5,
                              fontWeight: 500,
                              fontFamily: FAQ_SANS,
                              "&:hover": {
                                color: "#164a38",
                                textDecoration: "underline",
                              },
                            }}
                          >
                            {secNum}.{gIdx + 1} {subLabel}
                          </MuiLink>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
