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
import { Navigation } from "swiper/modules";
import { useMemo } from "react";

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
  onMovieSelect?: (movie: any) => void;
}

export const MovieSlider = ({
  title,
  movies,
  loading = false,
  categoryId,
  onMovieSelect,
}: MovieSliderProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const handleMoreClick = () => {
    navigate(`/category/${categoryId}`);
  };

  const memoizedMovies = useMemo(() => movies, [movies]);

  const getSlidesPerView = () => {
    if (isMobile) return 2.2;
    if (isTablet) return 4.2;
    return 6.2;
  };

  const validMovies = memoizedMovies.filter(
    (movie) =>
      movie &&
      typeof movie.id === "number" &&
      movie.title &&
      (movie.vote_average === undefined ||
        (typeof movie.vote_average === "number" && !isNaN(movie.vote_average)))
  );

  if (loading) {
    return (
      <Box
        sx={{
          mb: 4,
          position: "relative",
          zIndex: 5,
          ...(title === "Сейчас смотрят" && {
            mt: {
              xs: 0,
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
            disabled
            sx={{
              color: "grey.400",
            }}
          >
            Еще
          </Button>
        </Box>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={12}
          slidesPerView={getSlidesPerView()}
          style={{ padding: "0 16px" }}
        >
          {[...Array(6)].map((_, index) => (
            <SwiperSlide key={index} style={{ height: "auto" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box sx={{ aspectRatio: "2/3", marginBottom: 1 }}>
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
            xs: "-41px",
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
          Еще
        </Button>
      </Box>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={12}
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
                  aspectRatio: "2/3",
                  width: "100%",
                  marginBottom: 1,
                }}
              >
                <MovieCard
                  movie={movie}
                  onMovieSelect={(selectedMovie) => {
                    if (onMovieSelect) {
                      setTimeout(() => {
                        onMovieSelect(selectedMovie);
                      }, 0);
                    }
                  }}
                  showTitle={false}
                />
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
