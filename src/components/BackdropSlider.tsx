import { Box, Button, Typography, Skeleton } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { imageUrl } from "../api/tmdb";
import { getMovieImages, getMovieDetails } from "../api/tmdb";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import "swiper/css";
import "swiper/css/navigation";
import { useState, useEffect } from "react";
import { useScrollBrightness } from "../hooks/useScrollBrightness";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  release_quality?: string;
  logo_path?: string;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  runtime?: number;
}

interface BackdropSliderProps {
  movies: Movie[];
  onMovieSelect?: (movie: any) => void;
}

export const BackdropSlider = ({ movies }: BackdropSliderProps) => {
  const [randomMovies, setRandomMovies] = useState<Movie[]>([]);
  const [movieLogos, setMovieLogos] = useState<{
    [key: number]: string | null;
  }>({});
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>(
    {}
  );
  const brightness = useScrollBrightness();
  console.log("Current brightness:", brightness);

  const preloadImage = (src: string, movieId: number) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoadedImages((prev) => ({
        ...prev,
        [movieId]: true,
      }));
    };
  };

  const fetchMovieLogos = async (movie: Movie) => {
    try {
      const [images, details] = await Promise.all([
        getMovieImages(movie.id),
        getMovieDetails(movie.id),
      ]);

      if (images.logos && images.logos.length > 0) {
        const russianLogo = images.logos.find(
          (logo: any) => logo.iso_639_1 === "ru"
        );
        setMovieLogos((prev) => ({
          ...prev,
          [movie.id]: russianLogo
            ? russianLogo.file_path
            : images.logos[0].file_path,
        }));
      }

      if (details) {
        movie.production_countries = details.production_countries;
        movie.runtime = details.runtime;
      }
    } catch (error) {
      console.error("Error loading movie data:", error);
    }
  };

  useEffect(() => {
    const getRandomMovies = (sourceMovies: Movie[], count: number) => {
      const shuffled = [...sourceMovies].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    if (movies.length > 0) {
      const selected = getRandomMovies(movies, 5);
      setRandomMovies(selected);
    }
  }, [movies]);

  useEffect(() => {
    const loadMovieAssets = async () => {
      setLoading(true);
      try {
        await Promise.all(
          randomMovies.map((movie) => {
            preloadImage(imageUrl(movie.backdrop_path, "original"), movie.id);
            return fetchMovieLogos(movie);
          })
        );
      } catch (error) {
        console.error("Error loading movie assets:", error);
      } finally {
        setLoading(false);
      }
    };

    if (randomMovies.length > 0) {
      loadMovieAssets();
    }
  }, [randomMovies]);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  const countryTranslations: { [key: string]: string } = {
    "United States of America": "США",
    "United Kingdom": "Великобритания",
    Russia: "Россия",
    France: "Франция",
    Germany: "Германия",
    Italy: "Италия",
    Spain: "Испания",
    China: "Китай",
    Japan: "Япония",
    "South Korea": "Южная Корея",
  };

  const getCountryName = (englishName: string) => {
    return countryTranslations[englishName] || englishName;
  };

  const MovieInfo = ({
    movie,
    isMobile = false,
    sx = {},
  }: {
    movie: Movie;
    isMobile?: boolean;
    sx?: any;
  }) => {
    const content = (
      <>
        {movieLogos[movie.id] ? (
          <Box
            component="img"
            src={imageUrl(movieLogos[movie.id]!, "w500")}
            alt={movie.title}
            sx={{
              width: "300px",
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(2px 14px 6px black)",
              animation: "fadeInLeft 0.8s ease-out",
              "@keyframes fadeInLeft": {
                from: {
                  opacity: 0,
                  transform: "translateX(-20px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateX(0)",
                },
              },
            }}
          />
        ) : (
          <Typography
            variant={isMobile ? "h4" : "h2"}
            sx={{
              color: "white",
              fontWeight: "bold",
              textShadow: "0 4px 12px rgba(0,0,0,0.5)",
              animation: "fadeInLeft 0.8s ease-out",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            {movie.title}
          </Typography>
        )}

        {!isMobile && (
          <Typography
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1rem",
              lineHeight: 1.5,
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {movie.overview}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 2,
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              background: `linear-gradient(90deg, 
                rgba(229,9,20,1) 0%, 
                rgba(244,67,54,1) 100%
              )`,
              color: "white",
              fontSize: isMobile ? "1rem" : "1.2rem",
              px: isMobile ? 4 : 6,
              py: isMobile ? 1 : 1.5,
              borderRadius: 28,
              "&:hover": {
                background: `linear-gradient(90deg, 
                  rgba(244,67,54,1) 0%, 
                  rgba(229,9,20,1) 100%
                )`,
              },
              textTransform: "none",
              boxShadow: "0 8px 32px rgba(229,9,20,0.3)",
            }}
          >
            Смотреть
          </Button>
        </Box>
      </>
    );

    return (
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          position: "absolute",
          left: "5%",
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "40%",
          zIndex: 2,
          gap: 2,
          ...sx,
        }}
      >
        {content}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: { xs: 0, sm: "72px" },
          right: 0,
          height: {
            xs: "calc(100vw * 1.2 + env(safe-area-inset-top))",
            sm: "60vh",
          },
          zIndex: 0,
          backgroundColor: "#141414",
        }}
      >
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.1)",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            zIndex: 1,
          }}
        >
          <Skeleton
            variant="rectangular"
            width={250}
            height={80}
            animation="wave"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
          />
          <Skeleton
            variant="rectangular"
            width={180}
            height={48}
            animation="wave"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: { xs: 0, sm: "72px" },
        right: 0,
        height: {
          xs: "calc(100vw * 1.2)",
          sm: "60vh",
        },
        zIndex: 0,
        backgroundColor: "#141414",
        touchAction: "pan-y",
        pointerEvents: "none",
        mt: "-env(safe-area-inset-top)",
      }}
    >
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        allowTouchMove={true}
        touchEventsTarget="wrapper"
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
        }}
      >
        {randomMovies.map((movie) => (
          <SwiperSlide key={movie.id}>
            {loadedImages[movie.id] && (
              <Box
                component="img"
                src={imageUrl(movie.backdrop_path, "original")}
                alt={movie.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            )}

            {/* Градиент снизу */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "100%",
                height: "70%",
                background: `linear-gradient(
                  0deg,
                  rgba(14,18,28,1) 0%,
                  rgba(14,18,28,0.92) 30%,
                  rgba(16,20,32,0.85) 50%,
                  rgba(20,20,20,0) 100%
                )`,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />

            {/* Градиент слева */}
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                left: 0,
                top: 0,
                width: "70%",
                height: "100%",
                background: `linear-gradient(
                  90deg,
                  rgba(10,15,25,1) 0%,
                  rgba(10,15,25,0.98) 20%,
                  rgba(12,18,28,0.95) 40%,
                  rgba(14,20,32,0.8) 60%,
                  rgba(20,20,20,0) 100%
                )`,
                zIndex: 1,
              }}
            />

            {/* Градиент справа */}
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                right: 0,
                top: 0,
                width: "40%",
                height: "100%",
                background: `linear-gradient(
                  270deg,
                  rgba(10,15,25,1) 0%,
                  rgba(10,15,25,0.98) 20%,
                  rgba(12,18,28,0.95) 40%,
                  rgba(14,20,32,0.8) 60%,
                  rgba(20,20,20,0) 100%
                )`,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />

            {/* Мобильные градиенты по бокам */}
            <Box
              sx={{
                display: { xs: "block", md: "none" },
                position: "absolute",
                left: 0,
                top: 0,
                width: "25%",
                height: "100%",
                background: `linear-gradient(
                  90deg,
                  rgba(10,15,25,0.98) 0%,
                  rgba(12,18,28,0.9) 40%,
                  rgba(14,20,32,0.7) 70%,
                  rgba(20,20,20,0) 100%
                )`,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                display: { xs: "block", md: "none" },
                position: "absolute",
                right: 0,
                top: 0,
                width: "25%",
                height: "100%",
                background: `linear-gradient(
                  270deg,
                  rgba(10,15,25,0.98) 0%,
                  rgba(12,18,28,0.9) 40%,
                  rgba(14,20,32,0.7) 70%,
                  rgba(20,20,20,0) 100%
                )`,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />

            {/* Затемнение при скролле */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: `rgba(18, 18, 18, ${brightness})`,
                transition: "background-color 0.6s ease-out",
                zIndex: 3,
                pointerEvents: "none",
              }}
            />

            <MovieInfo
              movie={movie}
              sx={{
                pointerEvents: "auto",
              }}
            />

            {/* Мобильная версия */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                display: { xs: "flex", md: "none" },
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: { xs: "90%", sm: "80%" },
                gap: 3,
                pointerEvents: "auto",
              }}
            >
              {movieLogos[movie.id] ? (
                <Box
                  component="img"
                  src={imageUrl(movieLogos[movie.id]!, "w500")}
                  alt={movie.title}
                  sx={{
                    width: "250px",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "center",
                    filter: "drop-shadow(2px 14px 6px black)",
                  }}
                />
              ) : (
                <Typography
                  variant="h4"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    textAlign: "center",
                  }}
                >
                  {movie.title}
                </Typography>
              )}
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
