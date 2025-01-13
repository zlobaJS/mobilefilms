import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { imageUrl } from "../api/tmdb";

interface Studio {
  name: string;
  logo_path: string | null;
  movieCount: number;
}

interface StudiosSliderProps {
  studios: Studio[];
}

export const StudiosSlider = ({ studios }: StudiosSliderProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleStudioClick = (studioName: string) => {
    const encodedStudioName = encodeURIComponent(studioName);
    navigate(`/studio/${encodedStudioName}`);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          color: "white",
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          mb: 1.5,
          mx: 2,
        }}
      >
        Топ киностудий
      </Typography>
      <Swiper
        modules={[FreeMode]}
        freeMode={true}
        spaceBetween={isMobile ? 0 : 8}
        slidesPerView="auto"
        style={{ padding: "0 16px" }}
      >
        {studios.map((studio) => (
          <SwiperSlide
            key={studio.name}
            style={{
              width: "auto",
              height: "auto",
            }}
          >
            <Box
              onClick={() => handleStudioClick(studio.name)}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                transition: "all 0.2s",
                width: isMobile ? "160px" : "200px",
                mx: isMobile ? "4px" : 0,
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-4px)",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              {studio.logo_path && (
                <Box
                  component="img"
                  src={imageUrl(studio.logo_path, "w92")}
                  alt={studio.name}
                  sx={{
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                    flexShrink: 0,
                  }}
                />
              )}
              <Box
                sx={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                  title={studio.name}
                >
                  {studio.name}
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {studio.movieCount} фильм
                  {studio.movieCount === 1
                    ? ""
                    : studio.movieCount < 5
                    ? "а"
                    : "ов"}
                </Typography>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
