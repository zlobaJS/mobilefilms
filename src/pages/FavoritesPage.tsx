import { Box, Typography, Grid } from "@mui/material";
import { MovieCard } from "../components/MovieCard";
import { useFavorites } from "../hooks/useFavorites";

export const FavoritesPage = () => {
  const { favorites } = useFavorites();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Избранное
      </Typography>
      <Grid container spacing={2}>
        {favorites.map((movie) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={movie.id}>
            <MovieCard movie={movie} showTitle />
          </Grid>
        ))}
        {favorites.length === 0 && (
          <Typography sx={{ color: "grey.500", mt: 2 }}>
            Список избранного пуст
          </Typography>
        )}
      </Grid>
    </Box>
  );
};
