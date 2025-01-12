import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Container,
} from "@mui/material";
import { MovieCard } from "../components/MovieCard";
import { useWatched } from "../hooks/useWatched";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MovieDetails } from "../components/MovieDetails";

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

export const AllWatchedPage = () => {
  const { watchedMovies } = useWatched();
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const navigate = useNavigate();

  const handleMovieSelect = useCallback(
    (movie: Movie) => {
      navigate(`/movie/${movie.id}`);
    },
    [navigate]
  );

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMovie(null);
  };

  useEffect(() => {
    // Имитация загрузки для плавного UX
    const timer = setTimeout(() => {
      setInitialLoading(false);
      setTimeout(() => {
        setContentVisible(true);
      }, 300);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {initialLoading ? (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#141414",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={60} sx={{ color: "white" }} />
            <Typography variant="h6" sx={{ color: "white" }}>
              Загрузка просмотренного...
            </Typography>
          </Box>
        </Box>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: contentVisible ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              minHeight: "100vh",
              backgroundColor: "#141414",
              py: 4,
              position: "relative",
              paddingTop: "max(1rem, env(safe-area-inset-top))",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              paddingLeft: "env(safe-area-inset-left)",
              paddingRight: "env(safe-area-inset-right)",
            }}
          >
            <Container maxWidth="xl">
              <Typography
                variant="h4"
                sx={{
                  mb: 4,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                Все просмотренные фильмы
              </Typography>
              <Grid container spacing={2}>
                {watchedMovies.map((movie) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={movie.id}>
                    <MovieCard
                      movie={movie}
                      onClick={() => handleMovieSelect(movie)}
                    />
                  </Grid>
                ))}
              </Grid>
              <MovieDetails
                movie={selectedMovie}
                open={isDialogOpen}
                onClose={handleDialogClose}
              />
            </Container>
          </Box>
        </motion.div>
      )}
    </>
  );
};
