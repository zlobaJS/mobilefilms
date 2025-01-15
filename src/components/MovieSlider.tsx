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
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "swiper/css";
import "swiper/css/navigation";
import { useMemo } from "react";
import { FreeMode } from "swiper/modules";

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
}

export const MovieSlider = ({
  title,
  movies,
  loading = false,
  categoryId,
  onMovieSelect,
  showAllText = "Еще",
  showAllRoute,
  showTitle,
  showRemoveButtons = false,
  onRemoveFromFavorites,
  onRemoveFromWatched,
}: MovieSliderProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
    if (isMobile) return 2.2;
    if (isTablet) return 4.2;
    return 6.2;
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
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
            }}
          >
            {title}
          </Typography>
          <Button
            endIcon={<ArrowForwardIosIcon />}
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
          spaceBetween={isMobile ? 0 : 12}
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
                    width: isMobile ? "95%" : "100%",
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
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          {title}
        </Typography>
        <Button
          endIcon={<ArrowForwardIosIcon />}
          onClick={handleMoreClick}
          sx={{
            color: "grey.400",
            "&:hover": {
              color: "white",
            },
          }}
        >
          {showAllText}
        </Button>
      </Box>
      <Swiper
        modules={[FreeMode]}
        freeMode={true}
        spaceBetween={isMobile ? 0 : 12}
        slidesPerView={getSlidesPerView()}
        style={{ padding: "0 16px" }}
      >
        {validMovies.map((movie) => (
          <SwiperSlide key={movie.id} style={{ height: "auto" }}>
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
                  width: isMobile ? "95%" : "100%",
                  marginBottom: 1,
                }}
              >
                <MovieCard
                  movie={movie}
                  onClick={() => {
                    if (onMovieSelect) {
                      onMovieSelect(movie.id);
                    }
                  }}
                  showTitle={showTitle}
                  showRemoveButtons={showRemoveButtons}
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
                />
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
