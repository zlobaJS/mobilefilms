import { MovieSlider } from "./MovieSlider";
import { useFavorites } from "../hooks/useFavorites";

interface FavoritesSliderProps {
  onMovieSelect?: (movie: any) => void;
  showTitle?: boolean;
  showRemoveButtons?: boolean;
  onRemoveFromFavorites?: (movieId: number) => void;
  updateTrigger?: number;
}

export const FavoritesSlider = ({
  onMovieSelect,
  showTitle = true,
  showRemoveButtons = false,
  onRemoveFromFavorites,
}: FavoritesSliderProps) => {
  const { favorites, removeFromFavorites } = useFavorites();

  const handleRemove = (movieId: number) => {
    removeFromFavorites(movieId);
    onRemoveFromFavorites?.(movieId);
  };

  return (
    <MovieSlider
      title="Избранное"
      movies={favorites}
      loading={false}
      categoryId="favorites"
      onMovieSelect={onMovieSelect}
      showAllText="Показать все"
      showAllRoute="/favorites/all"
      showTitle={showTitle}
      showRemoveButtons={showRemoveButtons}
      onRemoveFromFavorites={handleRemove}
    />
  );
};
