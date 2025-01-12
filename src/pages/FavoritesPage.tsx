import { Box } from "@mui/material";
import { FavoritesSlider } from "../components/FavoritesSlider";
import { useCallback, useState } from "react";
import { MovieDetails } from "../components/MovieDetails";

export const FavoritesPage = () => {
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMovieSelect = useCallback((movie: any) => {
    setSelectedMovie(movie);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMovie(null);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        pt: { xs: "calc(env(safe-area-inset-top) + 16px)", sm: 2 },
        pb: { xs: "calc(56px + env(safe-area-inset-bottom))", sm: 2 },
      }}
    >
      <FavoritesSlider onMovieSelect={handleMovieSelect} showTitle={true} />
      <MovieDetails
        movie={selectedMovie}
        open={isDialogOpen}
        onClose={handleDialogClose}
      />
    </Box>
  );
};
