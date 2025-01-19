import { Box, Typography, styled } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";
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
                  <MovieCardSkeleton />
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
