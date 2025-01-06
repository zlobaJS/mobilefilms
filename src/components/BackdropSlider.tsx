import {
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { imageUrl } from "../api/tmdb";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import "swiper/css";

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
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const truncateOverview = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Box
      sx={{
        mb: 4,
        position: "relative",
        mt: "-env(safe-area-inset-top)",
      }}
    >
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        style={{
          width: "100%",
          height: isMobile ? "70vh" : isTablet ? "75vh" : "80vh",
          marginTop: "env(safe-area-inset-top)",
        }}
      >
        {movies.slice(0, 10).map((movie) => (
          <SwiperSlide key={movie.id}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(
                    180deg,
                    rgba(20,20,20,0) 0%,
                    rgba(20,20,20,0.4) 50%,
                    rgba(20,20,20,0.8) 80%,
                    rgba(20,20,20,1) 100%
                  )`,
                  zIndex: 1,
                  marginTop: "env(safe-area-inset-top)",
                },
              }}
            >
              <Box
                component="img"
                src={imageUrl(movie.backdrop_path, "original")}
                alt={movie.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  marginTop: "env(safe-area-inset-top)",
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
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    bgcolor: "white",
                    color: "black",
                    fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
                    px: { xs: 4, sm: 6, md: 8 },
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: 28,
                    mb: { xs: 2, sm: 3 },
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.8)",
                    },
                    minWidth: { xs: "140px", sm: "180px", md: "200px" },
                    textTransform: "none",
                  }}
                >
                  Смотреть
                </Button>
                <Typography
                  variant="body1"
                  sx={{
                    color: "white",
                    textAlign: "center",
                    fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                    opacity: 0.9,
                    maxWidth: { xs: "100%", sm: "90%", md: "80%" },
                    lineHeight: 1.5,
                  }}
                >
                  {truncateOverview(movie.overview)}
                </Typography>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
