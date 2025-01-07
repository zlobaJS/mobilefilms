import {
  Box,
  CardMedia,
  Typography,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { useState } from "react";
import { imageUrl } from "../api/tmdb";
import { MovieDetails } from "./MovieDetails";

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    vote_average: number;
    release_date: string;
    release_quality?: string;
  };
  onMovieSelect?: (movie: any) => void;
  hideTitle?: boolean;
}

export const MovieCardSkeleton = () => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        backgroundColor: "transparent",
        boxShadow: "none",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
        sx={{
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: "12px",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
          padding: "16px",
        }}
      >
        <Skeleton
          variant="text"
          width="80%"
          height={24}
          animation="wave"
          sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
        />
      </Box>
    </Box>
  );
};

export const MovieCard = ({
  movie,
  onMovieSelect,
  hideTitle,
}: MovieCardProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = () => {
    if (onMovieSelect) {
      onMovieSelect(movie);
    }
    setIsDetailsOpen(true);
  };

  console.log("Movie card data:", movie);

  return (
    <>
      <Box
        onClick={handleOpenDetails}
        sx={{
          position: "relative",
          height: "100%",
          backgroundColor: "transparent",
          boxShadow: "none",
          borderRadius: "12px",
          overflow: "hidden",
          transition: isDesktop ? "transform 0.2s" : "none",
          cursor: "pointer",
          filter: {
            xs: "drop-shadow(2px 14px 6px black)",
            sm: "drop-shadow(2px 4px 6px black)",
          },
          "&:hover": {
            transform: isDesktop ? "scale(1.05)" : "none",
            zIndex: isDesktop ? 1 : "auto",
          },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardMedia
          component="img"
          image={imageUrl(movie.poster_path)}
          alt={movie.title}
          sx={{
            height: "100%",
            objectFit: "cover",
            borderRadius: "12px",
          }}
        />
        {movie.release_quality && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.75)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "500",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {movie.release_quality}
          </Box>
        )}
        {movie.vote_average > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor:
                movie.vote_average >= 7
                  ? "#4CAF50"
                  : movie.vote_average >= 5.6
                  ? "#888"
                  : "#FF5252",
              color: "#fff",
              padding: { xs: "2px 6px", sm: "4px 8px" },
              borderRadius: { xs: "6px", sm: "8px" },
              fontSize: { xs: "12px", sm: "14px" },
              fontWeight: "bold",
            }}
          >
            {movie.vote_average.toFixed(1)}
          </Box>
        )}
        {!hideTitle && (
          <Typography
            variant="subtitle1"
            sx={{
              color: "white",
              fontWeight: "500",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              mt: 1,
              px: 1,
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {movie.title}
          </Typography>
        )}
      </Box>

      <MovieDetails
        movie={movie}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onMovieSelect={(newMovie) => {
          if (onMovieSelect) {
            onMovieSelect(newMovie);
            setIsDetailsOpen(true);
          }
        }}
      />
    </>
  );
};
