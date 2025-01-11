import { MovieSlider } from "./MovieSlider";
import { useFavorites } from "../hooks/useFavorites";

interface FavoritesSliderProps {
  onMovieSelect?: (movie: any) => void;
}

export const FavoritesSlider = ({ onMovieSelect }: FavoritesSliderProps) => {
  const { favorites } = useFavorites();

  return (
    <MovieSlider
      title="Избранное"
      movies={favorites}
      loading={false}
      categoryId="favorites"
      onMovieSelect={onMovieSelect}
      showAllText="Показать все"
      showAllRoute="/favorites/all"
    />
  );
};
