import { Box } from "@mui/material";
import { FavoritesSlider } from "../components/FavoritesSlider";
import { WatchedSlider } from "../components/WatchedSlider";
import { useCallback, useState, useMemo } from "react";
import { MovieDetails } from "../components/MovieDetails";
import { useFavorites } from "../hooks/useFavorites";
import { useWatched } from "../hooks/useWatched";
import { getMovieDetails } from "../api/tmdb";
import { Movie } from "../types/movie";

export const FavoritesPage = () => {
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const { removeFromFavorites } = useFavorites();
  const { removeFromWatched } = useWatched();

  const handleMovieSelect = useCallback((movie: Movie | number) => {
    if (typeof movie === "number") {
      getMovieDetails(movie).then((movieData) => {
        setSelectedMovie(movieData);
        setIsDialogOpen(true);
      });
    } else {
      setSelectedMovie(movie);
      setIsDialogOpen(true);
    }
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMovie(null);
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  const handleRemoveFromFavorites = useCallback(
    (movieId: number) => {
      removeFromFavorites(movieId);
      setUpdateTrigger((prev) => prev + 1);
    },
    [removeFromFavorites]
  );

  const handleRemoveFromWatched = useCallback(
    (movieId: number) => {
      removeFromWatched(movieId);
      setUpdateTrigger((prev) => prev + 1);
    },
    [removeFromWatched]
  );

  const sliderProps = useMemo(
    () => ({
      showTitle: true,
      showRemoveButtons: true,
      updateTrigger,
    }),
    [updateTrigger]
  );

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        pt: { xs: "calc(env(safe-area-inset-top) + 16px)", sm: 2 },
        pb: { xs: "calc(56px + env(safe-area-inset-bottom))", sm: 2 },
      }}
    >
      <FavoritesSlider
        onMovieSelect={handleMovieSelect}
        {...sliderProps}
        onRemoveFromFavorites={handleRemoveFromFavorites}
      />
      <WatchedSlider
        onMovieSelect={handleMovieSelect}
        {...sliderProps}
        onRemoveFromWatched={handleRemoveFromWatched}
      />
      <MovieDetails
        movie={selectedMovie}
        open={isDialogOpen}
        onClose={handleDialogClose}
        updateTrigger={updateTrigger}
      />
    </Box>
  );
};
