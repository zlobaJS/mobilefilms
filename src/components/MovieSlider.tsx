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
import "swiper/swiper-bundle.css";
import { useMemo, useEffect, useRef } from "react";
import { EffectCoverflow, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

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
  showTitle = true,
  showRemoveButtons = false,
  onRemoveFromFavorites,
  onRemoveFromWatched,
}: MovieSliderProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const swiperRef = useRef<SwiperType>();

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
        slidesPerView: isMobile ? 1.8 : 1.8,
        coverflowEffect: {
          rotate: isMobile ? 45 : 0,
          stretch: isMobile ? 0 : 0,
          depth: isMobile ? 150 : 150,
          modifier: isMobile ? 1.5 : 1.5,
          slideShadows: false,
        },
        modules: [EffectCoverflow],
        spaceBetween: 0,
        initialSlide: 1,
        onSwiper: (swiper: SwiperType) => {
          swiperRef.current = swiper;
        },
      };
    }

    return {
      slidesPerView: getSlidesPerView(),
      spaceBetween: 16,
      freeMode: true,
      modules: [FreeMode],
    };
  };

  useEffect(() => {
    if (title === "Сейчас смотрят" && swiperRef.current) {
      setTimeout(() => {
        swiperRef.current?.update();
      }, 100);
    }
  }, [title]);

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
              transform: "scale(0.75)",
              transformOrigin: "center",
              perspective: "1000px",
              "& > div": {
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.5)",
                  transition: "opacity 0.3s",
                  zIndex: 1,
                  pointerEvents: "none",
                },
              },
            }),
          },
          "& .swiper-slide-active": {
            transform: isMobile ? "scale(0.9)" : "scale(1.05)",
            zIndex: 2,
            rotate: "0deg",
            "& > div::after": {
              opacity: 0,
            },
          },
          "& .swiper-slide-prev, & .swiper-slide-next": {
            transformOrigin: "center",
            "& > div::after": {
              opacity: 1,
            },
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
              }}
            >
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
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
