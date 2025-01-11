import {
  Box,
  Card,
  CardMedia,
  Typography,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { memo } from "react";
import { imageUrl } from "../api/tmdb";
import { useNavigate } from "react-router-dom";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";

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
  showTitle?: boolean;
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

export const MovieCard = memo(({ movie, showTitle = true }: MovieCardProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const handleOpenDetails = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <Card
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
        background: "none",
        backgroundImage: "none",
        "&::before": {
          display: "none",
        },
        "& .MuiPaper-root": {
          "--Paper-overlay": "none !important",
          backgroundImage: "none !important",
        },
      }}
      elevation={0}
    >
      <Box
        onClick={handleOpenDetails}
        sx={{
          position: "relative",
          height: "100%",
          backgroundColor: "transparent",
          boxShadow: "none",
          borderRadius: "12px",
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0)",
            transition: "background-color 0.2s ease",
            borderRadius: "12px",
            pointerEvents: "none",
          },
          "&:hover::after": {
            backgroundColor: isDesktop
              ? "rgba(0, 0, 0, 0.4)"
              : "rgba(0, 0, 0, 0)",
          },
        }}
      >
        {movie.poster_path ? (
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
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              p: 2,
              aspectRatio: "2/3",
            }}
          >
            <ImageNotSupportedIcon
              sx={{
                fontSize: 48,
                color: "rgba(255,255,255,0.3)",
                mb: 1,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.5)",
                textAlign: "center",
                fontSize: "0.75rem",
              }}
            >
              Постер отсутствует
            </Typography>
          </Box>
        )}
        {movie.release_quality && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#000000",
              textTransform: "uppercase",
              fontWeight: "bold",
              backgroundColor: "rgba(255,255,255,0.7)",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.8rem",
            }}
          >
            {movie.release_quality}
          </Box>
        )}
        {movie.vote_average > 0 && !isNaN(movie.vote_average) && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: (() => {
                const rating = Number(movie.vote_average);
                if (rating >= 7) return "#4CAF50";
                if (rating >= 5.6) return "#888";
                return "#FF5252";
              })(),
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
        {showTitle && (
          <Typography
            variant="subtitle1"
            sx={{
              color: "white",
              fontWeight: "bold",
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
    </Card>
  );
});
