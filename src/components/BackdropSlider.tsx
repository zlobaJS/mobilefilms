import { Box, Button, Typography, Skeleton } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { imageUrl } from "../api/tmdb";
import { getMovieImages } from "../api/tmdb";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import "swiper/css";
import { useState, useEffect } from "react";

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
}

interface BackdropSliderProps {
  movies: Movie[];
  onMovieSelect?: (movie: any) => void;
}

export const BackdropSlider = ({ movies }: BackdropSliderProps) => {
  const [movieLogos, setMovieLogos] = useState<{
    [key: number]: string | null;
  }>({});
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>(
    {}
  );

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
      const images = await getMovieImages(movie.id);
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
    } catch (error) {
      console.error("Error loading movie logos:", error);
    }
  };

  useEffect(() => {
    const loadMovieAssets = async () => {
      setLoading(true);
      try {
        const firstMovies = movies.slice(0, 3);
        await Promise.all(
          firstMovies.map((movie) => {
            preloadImage(imageUrl(movie.backdrop_path, "original"), movie.id);
            return fetchMovieLogos(movie);
          })
        );

        movies.slice(3, 10).forEach((movie) => {
          preloadImage(imageUrl(movie.backdrop_path, "original"), movie.id);
          fetchMovieLogos(movie);
        });
      } catch (error) {
        console.error("Error loading movie assets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovieAssets();
  }, [movies]);

  if (loading) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: {
            xs: "calc(100vw * 0.75 + env(safe-area-inset-top) + 100px)",
            sm: "60vh",
          },
          overflow: "hidden",
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
        position: "relative",
        width: "100%",
        height: {
          xs: "calc(100vw * 0.75 + env(safe-area-inset-top) + 100px)",
          sm: "60vh",
        },
        overflow: "hidden",
      }}
    >
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        slidesPerView={1}
        spaceBetween={0}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
        className="backdrop-slider"
      >
        <style>
          {`
            .backdrop-slider .swiper-slide {
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            .backdrop-slider .swiper-slide-active {
              opacity: 1;
            }
          `}
        </style>
        {movies.slice(0, 10).map((movie) => (
          <SwiperSlide key={movie.id}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              {loadedImages[movie.id] ? (
                <Box
                  component="img"
                  src={imageUrl(movie.backdrop_path, "original")}
                  alt={movie.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: {
                      xs: "center 15%",
                      sm: "center top",
                    },
                    transform: "scale(1.02)",
                  }}
                />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  animation="wave"
                  sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
                />
              )}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: "-env(safe-area-inset-top)",
                  width: "100%",
                  height: "calc(100% + env(safe-area-inset-top) + 120px)",
                  background: `linear-gradient(
                    0deg,
                    rgba(20,20,20,1) 0%,
                    rgba(20,20,20,0.95) 10%,
                    rgba(20,20,20,0.9) 20%,
                    rgba(20,20,20,0.8) 30%,
                    rgba(20,20,20,0.6) 40%,
                    rgba(20,20,20,0.4) 50%,
                    rgba(20,20,20,0.2) 60%,
                    rgba(20,20,20,0.1) 70%,
                    rgba(20,20,20,0) 100%
                  )`,
                  zIndex: 1,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: "100%",
                  height: "40%",
                  background: `linear-gradient(
                    180deg,
                    rgba(20,20,20,0) 0%,
                    rgba(20,20,20,0.8) 50%,
                    rgba(20,20,20,1) 100%
                  )`,
                  zIndex: 1,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  bottom: { xs: "15%", sm: "20%", md: "25%" },
                  transform: "translateX(-50%)",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: { xs: "90%", sm: "80%", md: "60%" },
                  gap: 3,
                }}
              >
                {movieLogos[movie.id] ? (
                  <Box
                    component="img"
                    src={imageUrl(movieLogos[movie.id]!, "w500")}
                    alt={movie.title}
                    sx={{
                      width: { xs: "200px", sm: "250px", md: "300px" },
                      height: "auto",
                      objectFit: "contain",
                      filter: "drop-shadow(2px 14px 6px black)",
                      animation: "fadeInUp 0.8s ease-out",
                      "@keyframes fadeInUp": {
                        from: {
                          opacity: 0,
                          transform: "translateY(20px)",
                        },
                        to: {
                          opacity: 1,
                          transform: "translateY(0)",
                        },
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="h3"
                    sx={{
                      color: "white",
                      textAlign: "center",
                      fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                      fontWeight: "bold",
                      textShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      animation: "fadeInUp 0.8s ease-out",
                      "@keyframes fadeInUp": {
                        from: {
                          opacity: 0,
                          transform: "translateY(20px)",
                        },
                        to: {
                          opacity: 1,
                          transform: "translateY(0)",
                        },
                      },
                    }}
                  >
                    {movie.title}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    background: `linear-gradient(90deg, 
                      rgba(229,9,20,1) 0%, 
                      rgba(244,67,54,1) 100%
                    )`,
                    color: "white",
                    fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
                    px: { xs: 4, sm: 6, md: 8 },
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: 28,
                    "&:hover": {
                      background: `linear-gradient(90deg, 
                        rgba(244,67,54,1) 0%, 
                        rgba(229,9,20,1) 100%
                      )`,
                    },
                    minWidth: { xs: "140px", sm: "180px", md: "200px" },
                    textTransform: "none",
                    boxShadow: "0 8px 32px rgba(229,9,20,0.3)",
                    transition: "all 0.3s ease",
                    border: "none",
                    "&:active": {
                      transform: "scale(0.98)",
                    },
                  }}
                >
                  Смотреть
                </Button>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
