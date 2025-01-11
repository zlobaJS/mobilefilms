import { Box } from "@mui/material";
import { FavoritesSlider } from "../components/FavoritesSlider";
import { useCallback } from "react";

export const FavoritesPage = () => {
  const handleMovieSelect = useCallback((movie: any) => {
    // Обработка выбора фильма, если необходимо
  }, []);

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
