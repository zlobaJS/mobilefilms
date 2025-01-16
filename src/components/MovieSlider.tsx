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
import "swiper/css/effect-coverflow";
import { useMemo } from "react";
import { FreeMode, EffectCoverflow } from "swiper/modules";

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

  const getSliderConfig = () => {
    if (title === "Сейчас смотрят") {
      return {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: isMobile ? 2.2 : 1.8,
        coverflowEffect: {
          rotate: isMobile ? 35 : 0,
          stretch: isMobile ? 0 : 0,
          depth: isMobile ? 100 : 150,
          modifier: isMobile ? 1 : 1.5,
          slideShadows: false,
        },
        modules: [EffectCoverflow],
        spaceBetween: isMobile ? -30 : 0,
      };
    }

    return {
      slidesPerView: getSlidesPerView(),
      spaceBetween: 16,
      freeMode: true,
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
          "& .swiper-slide": {
            transition: "transform 0.3s",
            ...(isMobile && {
              opacity: 0.5,
              transform: "scale(0.75)",
              transformOrigin: "center",
              perspective: "1000px",
            }),
          },
          "& .swiper-slide-active": {
            transform: isMobile ? "scale(0.9)" : "scale(1.05)",
            zIndex: 2,
            opacity: 1,
            rotate: "0deg",
          },
          "& .swiper-slide-prev": {
            transformOrigin: "right center",
          },
          "& .swiper-slide-next": {
            transformOrigin: "left center",
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
      <Swiper {...getSliderConfig()}>
        {validMovies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <Box
              sx={{
                px: 1,
                ...(title === "Сейчас смотрят" && {
                  transform: "scale(0.9)",
                  transition: "transform 0.3s",
                }),
              }}
            >
              <MovieCard
                movie={movie}
                onSelect={onMovieSelect}
                showRemoveButton={showRemoveButtons}
                onRemoveFromFavorites={onRemoveFromFavorites}
                onRemoveFromWatched={onRemoveFromWatched}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
