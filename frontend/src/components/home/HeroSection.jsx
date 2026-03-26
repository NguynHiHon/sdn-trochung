import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useTranslation } from "react-i18next";
import ImageWithFallback from "../common/ImageWithFallback";

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        position: "relative",
        height: "92vh",
        minHeight: "620px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        bgcolor: "#0a2e1f",
      }}
    >
      {/* Background Image */}
      <ImageWithFallback
        src="/images/hero-bg.jpg"
        fallbackSrc="https://images.unsplash.com/photo-1596484552834-6a58f850d0a1?q=80&w=2070&auto=format&fit=crop"
        alt="Son Doong Cave"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
          opacity: 0.75,
        }}
      />

      {/* Gradient Overlays */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)",
          zIndex: 2,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 120,
          background: "linear-gradient(to top, #faf8f4 0%, transparent 100%)",
          zIndex: 3,
        }}
      />

      {/* Content */}
      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 4,
          textAlign: "center",
          color: "white",
        }}
      >
        {/* Badge */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 5,
            px: 2.5,
            py: 0.6,
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#4ade80",
            }}
          />
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {t("home.heroTitle")
              ? t("home.heroTitle").includes("Oxalis")
                ? "World-Class Adventure"
                : "Khám Phá Thế Giới"
              : "Adventure Awaits"}
          </Typography>
        </Box>

        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 900,
            letterSpacing: "-0.02em",
            mb: 2.5,
            fontFamily: '"Inter", sans-serif',
            textShadow: "0 4px 24px rgba(0,0,0,0.4)",
            fontSize: { xs: "2.2rem", sm: "3rem", md: "3.6rem" },
            lineHeight: 1.1,
          }}
        >
          {t("home.heroTitle")}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 5,
            fontWeight: 400,
            lineHeight: 1.6,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            maxWidth: 600,
            mx: "auto",
            color: "rgba(255,255,255,0.88)",
            fontSize: { xs: "0.95rem", md: "1.1rem" },
          }}
        >
          {t("home.heroSubtitle")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            size="large"
            href="#tours"
            sx={{
              bgcolor: "#2b6f56",
              color: "white",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: 6,
              textTransform: "none",
              boxShadow: "0 4px 20px rgba(43,111,86,0.4)",
              "&:hover": {
                bgcolor: "#1a5a3e",
                boxShadow: "0 8px 28px rgba(43,111,86,0.5)",
              },
            }}
          >
            {t("home.findYourTour")}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PlayCircleOutlineIcon />}
            sx={{
              borderColor: "rgba(255,255,255,0.5)",
              color: "white",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: 6,
              textTransform: "none",
              backdropFilter: "blur(4px)",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            {t("home.watchVideo")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
