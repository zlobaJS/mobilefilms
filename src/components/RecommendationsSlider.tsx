import { Box, Typography, styled, Skeleton } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import { MovieCard } from "./MovieCard";
import { Movie } from "../types/movie";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// Import Swiper styles
import "swiper/css";

const StyledSwiper = styled(Swiper)({
  ".swiper-slide": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "18px",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#fff",
  },
  ".swiper-slide:not(.swiper-slide-active)": {
    filter: "brightness(0.7)",
    transform: "scale(0.9)",
  },
});

const LoadingCard = () => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      position: "relative",
      borderRadius: "18px",
      overflow: "hidden",
      bgcolor: "rgba(255,255,255,0.05)",
    }}
  >
    <Skeleton
      variant="rectangular"
      width="100%"
      height="100%"
      animation="wave"
      sx={{
        bgcolor: "rgba(255,255,255,0.1)",
        transform: "none",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
      }}
    >
      <Skeleton
        variant="text"
        width="70%"
        height={24}
        sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
      />
      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
        />
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
        />
      </Box>
    </Box>
  </Box>
);

interface RecommendationsSliderProps {
  movies: Movie[];
  loading: boolean;
  onMovieSelect: (movie: Movie) => void;
}

export const RecommendationsSlider = ({
  movies,
  loading,
  onMovieSelect,
}: RecommendationsSliderProps) => {
  if (movies.length === 0 && !loading) {
    return null;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <AutoAwesomeIcon sx={{ color: "#FFD700" }} />
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          Рекомендации для вас
        </Typography>
        {loading && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              ml: "auto",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.875rem",
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#FFD700",
                animation: "pulse 1.5s infinite",
                "@keyframes pulse": {
                  "0%": {
                    transform: "scale(0.8)",
                    opacity: 0.5,
                  },
                  "50%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                  "100%": {
                    transform: "scale(0.8)",
                    opacity: 0.5,
                  },
                },
              }}
            />
            Подбираем фильмы...
          </Box>
        )}
      </Box>

      <Box
        sx={{
          maxWidth: "240px",
          margin: "0 auto",
          padding: "20px 0",
        }}
      >
        <StyledSwiper
          effect="cards"
          grabCursor={true}
          modules={[EffectCards]}
          className="mySwiper"
        >
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <SwiperSlide key={`skeleton-${index}`}>
                  <LoadingCard />
                </SwiperSlide>
              ))
            : Array.from(new Set(movies.map((m) => m.id))).map((movieId) => {
                const movie = movies.find((m) => m.id === movieId)!;
                return (
                  <SwiperSlide key={`recommendation-${movieId}`}>
                    <MovieCard
                      movie={movie}
                      onClick={() => onMovieSelect(movie)}
                      showTitle
                    />
                  </SwiperSlide>
                );
              })}
        </StyledSwiper>
      </Box>
    </Box>
  );
};
