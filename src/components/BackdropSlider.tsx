import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { imageUrl } from "../api/tmdb";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

interface BackdropSliderProps {
  movies: Movie[];
  onMovieSelect?: (movie: any) => void;
}

export const BackdropSlider = ({ movies }: BackdropSliderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ mb: 4, position: "relative" }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="backdrop-slider"
        style={{
          width: "100%",
          height: isMobile ? "70vh" : isTablet ? "60vh" : "80vh",
        }}
      >
        {movies.slice(0, 10).map((movie) => (
          <SwiperSlide key={movie.id}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  background: isMobile
                    ? `linear-gradient(
                        180deg,
                        rgba(20,20,20,0) 0%,
                        rgba(20,20,20,0.6) 50%,
                        rgba(20,20,20,0.8) 70%,
                        rgba(20,20,20,0.95) 85%,
                        rgba(20,20,20,1) 100%
                      )`
                    : `linear-gradient(
                        90deg,
                        rgba(0,0,0,0.8) 0%,
                        rgba(0,0,0,0.4) 50%,
                        rgba(0,0,0,0) 100%
                      ),
                      linear-gradient(
                        180deg,
                        rgba(20,20,20,0) 0%,
                        rgba(20,20,20,0.4) 50%,
                        rgba(20,20,20,0.8) 75%,
                        rgba(20,20,20,0.95) 85%,
                        rgba(20,20,20,1) 100%
                      )`,
                  zIndex: 1,
                },
              }}
            >
              <Box
                component="img"
                src={imageUrl(movie.backdrop_path, "original")}
                alt={movie.title}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center center",
                  transform: isMobile ? "scale(1.1)" : "none",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: isMobile ? "10%" : "15%",
                  left: "5%",
                  maxWidth: isMobile ? "90%" : "40%",
                  zIndex: 2,
                  padding: isMobile ? "0 16px" : 0,
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    mb: 2,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                    fontSize: {
                      xs: "1.75rem",
                      sm: "2rem",
                      md: "2.5rem",
                    },
                    lineHeight: {
                      xs: 1.2,
                      sm: 1.3,
                    },
                  }}
                >
                  {movie.title}
                </Typography>
                <Typography
                  sx={{
                    color: "white",
                    mb: 3,
                    display: "-webkit-box",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    WebkitLineClamp: isMobile ? 4 : 3,
                    WebkitBoxOrient: "vertical",
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    lineHeight: 1.5,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {movie.overview}
                </Typography>
                <Button
                  variant="contained"
                  size={isMobile ? "large" : "medium"}
                  sx={{
                    bgcolor: "white",
                    color: "black",
                    fontWeight: "bold",
                    px: { xs: 4, sm: 3 },
                    py: { xs: 1.5, sm: 1 },
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.8)",
                    },
                  }}
                >
                  Подробнее
                </Button>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
