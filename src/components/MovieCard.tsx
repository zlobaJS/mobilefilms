import {
  Box,
  CardMedia,
  Typography,
  Skeleton,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import { imageUrl } from "../api/tmdb";
import { useNavigate } from "react-router-dom";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

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

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  showTitle?: boolean;
  showRemoveButtons?: boolean;
  onRemoveFromFavorites?: () => void;
  onRemoveFromWatched?: () => void;
  useBackdrop?: boolean;
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
          transform: "scale(1)",
          transition: "transform 0.2s",
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
          sx={{
            bgcolor: "rgba(255,255,255,0.1)",
            transform: "scale(1)",
            transition: "transform 0.2s",
          }}
        />
      </Box>
    </Box>
  );
};

export const MovieCard = ({
  movie,
  onClick,
  showTitle = false,
  showRemoveButtons = false,
  onRemoveFromFavorites,
  onRemoveFromWatched,
  useBackdrop = false,
}: MovieCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpenDetails = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".remove-button")) {
      return;
    }
    navigate(`/movie/${movie.id}`);
  };

  return (
    <Box
      onClick={onClick || handleOpenDetails}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        position: "relative",
      }}
    >
      {showRemoveButtons && (
        <Box
          className="remove-buttons"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {onRemoveFromFavorites && (
            <IconButton
              className="remove-button"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromFavorites();
              }}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255, 0, 0, 0.8)",
                },
              }}
            >
              <BookmarkRemoveIcon />
            </IconButton>
          )}
          {onRemoveFromWatched && (
            <IconButton
              className="remove-button"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromWatched();
              }}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255, 0, 0, 0.8)",
                },
              }}
            >
              <VisibilityOffIcon />
            </IconButton>
          )}
        </Box>
      )}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: useBackdrop ? "56.25%" : isMobile ? "140%" : "150%",
          backgroundColor: "transparent",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {(useBackdrop ? movie.backdrop_path : movie.poster_path) ? (
          <>
            {!imageLoaded && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                }}
              >
                <MovieCardSkeleton />
              </Box>
            )}
            <CardMedia
              component="img"
              image={imageUrl(
                useBackdrop ? movie.backdrop_path : movie.poster_path,
                useBackdrop ? "w780" : "w342"
              )}
              alt={movie.title}
              onLoad={() => setImageLoaded(true)}
              sx={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "12px",
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            />
            {useBackdrop && movie.logo_path && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "60%",
                  height: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={imageUrl(movie.logo_path, "w300")}
                  alt={`${movie.title} logo`}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    filter:
                      "drop-shadow(0 0 2px rgba(0,0,0,0.9)) drop-shadow(0 0 8px rgba(0,0,0,0.7))",
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
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
              fontSize: "0.7rem",
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
      </Box>

      {showTitle && (
        <Typography
          variant="subtitle1"
          sx={{
            color: "white",
            fontWeight: "bold",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            mt: 1,
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
  );
};
