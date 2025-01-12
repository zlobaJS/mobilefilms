import { Box, Grid, Typography, Container } from "@mui/material";
import { MovieCard } from "../components/MovieCard";
import { useFavorites } from "../hooks/useFavorites";
import { useState, useCallback } from "react";
import { MovieDetails } from "../components/MovieDetails";
import { motion } from "framer-motion";

export const AllFavoritesPage = () => {
  // 1. Все useState хуки
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // 2. Кастомные хуки
  const { favorites, removeFromFavorites } = useFavorites();

  // 3. useCallback хуки
  const handleMovieSelect = useCallback((movie: any) => {
    setSelectedMovie(movie);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMovie(null);
  }, []);

  const handleRemoveFromFavorites = useCallback(
    (movieId: number) => {
      removeFromFavorites(movieId);
      setUpdateTrigger((prev) => prev + 1);
    },
    [removeFromFavorites]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
            Все избранные фильмы
          </Typography>
          <Grid container spacing={2}>
            {favorites.map((movie) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={movie.id}>
                <MovieCard
                  movie={movie}
                  onClick={() => handleMovieSelect(movie)}
                  showRemoveButtons={true}
                  onRemoveFromFavorites={() =>
                    handleRemoveFromFavorites(movie.id)
                  }
                />
              </Grid>
            ))}
          </Grid>
          <MovieDetails
            movie={selectedMovie}
            open={isDialogOpen}
            onClose={handleDialogClose}
            updateTrigger={updateTrigger}
          />
        </Container>
      </Box>
    </motion.div>
  );
};
