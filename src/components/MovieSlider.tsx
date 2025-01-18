import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/swiper-bundle.css";
import { useMemo, useState } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  release_quality?: string;
}

interface MovieSliderProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
  categoryId: string;
  onMovieSelect?: (movie: Movie | number) => void;
  showAllText?: string;
  showAllRoute?: string;
  showTitle?: boolean;
  showRemoveButtons?: boolean;
  onRemoveFromFavorites?: (movieId: number) => void;
  onRemoveFromWatched?: (movieId: number) => void;
  useBackdrop?: boolean;
}

export const MovieSlider = ({
  title,
  movies,
  loading = false,
  categoryId,
  onMovieSelect,
  showAllText = "ЕЩЕ",
  showAllRoute,
  showTitle = true,
  showRemoveButtons = false,
  onRemoveFromFavorites,
  onRemoveFromWatched,
  useBackdrop = false,
}: MovieSliderProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [isEnd, setIsEnd] = useState(false);

  const handleMoreClick = () => {
    navigate(showAllRoute || `/category/${categoryId}`);
  };

  const validMovies = useMemo(
    () =>
      movies?.filter(
        (movie) =>
          movie &&
          typeof movie.id === "number" &&
          movie.title &&
          (movie.vote_average === undefined ||
            (typeof movie.vote_average === "number" &&
              !isNaN(movie.vote_average)))
      ) || [],
    [movies]
  );

  const getSlidesPerView = () => {
    if (useBackdrop) {
      if (isMobile) return 1.2;
      if (isTablet) return 2.2;
      return 3.2;
    }
    if (isMobile) return 2.8;
    if (isTablet) return 4.2;
    return 6.2;
  };

  const getSliderConfig = () => {
    return {
      slidesPerView: getSlidesPerView(),
      spaceBetween: 8,
      freeMode: true,
      modules: [FreeMode],
      onReachEnd: () => setIsEnd(true),
      onFromEdge: () => setIsEnd(false),
      onSlideChange: (swiper: SwiperType) => {
        setIsEnd(swiper.isEnd);
      },
    };
  };

  if (loading) {
    return (
      <Box
        sx={{
          mb: 4,
          position: "relative",
          zIndex: 5,
          ...(title === "Сейчас смотрят" && {
            mt: {
              xs: "-116px",
              sm: 0,
            },
          }),
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            mx: 2,
            position: "relative",
            zIndex: 5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "white",
              fontSize: "1rem",
            }}
          >
            {title}
          </Typography>
          <Button
            disabled
            sx={{
              color: "rgba(255,255,255,0.3)",
            }}
          >
            {showAllText}
          </Button>
        </Box>
        <Swiper
          modules={[FreeMode]}
          freeMode={true}
          spaceBetween={isMobile ? 0 : 8}
          slidesPerView={getSlidesPerView()}
          style={{ padding: "0 16px" }}
        >
          {[...Array(6)].map((_, index) => (
            <SwiperSlide key={index} style={{ height: "auto" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    aspectRatio: isMobile ? "2/3" : "1/1.5",
                    width: isMobile ? "85%" : "100%",
                    marginBottom: 1,
                  }}
                >
                  <MovieCardSkeleton />
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mb: 4,
        position: "relative",
        zIndex: 5,
        ...(title === "Сейчас смотрят" && {
          mt: {
            xs: "-116px",
            sm: 0,
          },
        }),
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          mx: 2,
          position: "relative",
          zIndex: 5,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "white",
            fontSize: "1rem",
          }}
        >
          {title}
        </Typography>
        <Button
          onClick={handleMoreClick}
          sx={{
            color: "grey.400",
            position: "relative",
            padding: "0",
            minWidth: "auto",
            textTransform: "none",
            fontSize: "0.85rem",
            letterSpacing: "0.2px",
            fontWeight: 400,
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -1,
              left: 0,
              width: "100%",
              height: "1px",
              borderBottom: "1px solid rgba(255,255,255,0.3)",
              transition: "all 0.2s ease",
            },
            "&:hover": {
              color: "white",
              background: "transparent",
              "&::after": {
                borderColor: "rgba(255,255,255,0.8)",
              },
            },
          }}
        >
          {showAllText}
        </Button>
      </Box>
      <Box sx={{ position: "relative" }}>
        <Swiper {...getSliderConfig()}>
          {validMovies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <Box sx={{ px: 1 }}>
                <MovieCard
                  movie={movie}
                  onClick={() => onMovieSelect?.(movie)}
                  showRemoveButtons={showRemoveButtons}
                  showTitle={title === "Сейчас смотрят" ? false : showTitle}
                  onRemoveFromFavorites={
                    onRemoveFromFavorites
                      ? () => onRemoveFromFavorites(movie.id)
                      : undefined
                  }
                  onRemoveFromWatched={
                    onRemoveFromWatched
                      ? () => onRemoveFromWatched(movie.id)
                      : undefined
                  }
                  useBackdrop={useBackdrop}
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>

        {!isEnd && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "120px",
              height: "100%",
              background: `linear-gradient(
                90deg, 
                rgba(20,20,20,0) 0%,
                rgba(20,20,22,0.4) 35%,
                rgba(21,21,24,0.7) 55%,
                rgba(22,22,26,0.9) 75%,
                rgba(23,23,28,1) 100%
              )`,
              pointerEvents: "none",
              zIndex: 2,
              transition: "opacity 0.3s ease-in-out",
              opacity: 0.95,
            }}
          />
        )}
      </Box>
    </Box>
  );
};
