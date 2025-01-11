import { Box } from "@mui/material";
import { FavoritesSlider } from "../components/FavoritesSlider";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const FavoritesPage = () => {
  const navigate = useNavigate();

  const handleMovieSelect = useCallback(
    (movie: any) => {
      navigate(`/movie/${movie.id}`);
    },
    [navigate]
  );

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        pt: { xs: "calc(env(safe-area-inset-top) + 16px)", sm: 2 },
        pb: { xs: "calc(56px + env(safe-area-inset-bottom))", sm: 2 },
      }}
    >
      <FavoritesSlider onMovieSelect={handleMovieSelect} />
    </Box>
  );
};
