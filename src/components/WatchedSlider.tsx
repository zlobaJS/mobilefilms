import { MovieSlider } from "./MovieSlider";
import { useWatched } from "../hooks/useWatched";

interface WatchedSliderProps {
  onMovieSelect?: (movie: any) => void;
  showTitle?: boolean;
  showRemoveButtons?: boolean;
  onRemoveFromWatched?: (movieId: number) => void;
  updateTrigger?: number;
}

export const WatchedSlider = ({
  onMovieSelect,
  showTitle = true,
  showRemoveButtons = false,
  onRemoveFromWatched,
}: WatchedSliderProps) => {
  const { watchedMovies, removeFromWatched } = useWatched();

  const handleRemove = (movieId: number) => {
    removeFromWatched(movieId);
    onRemoveFromWatched?.(movieId);
  };

  return (
    <MovieSlider
      title="Просмотренные"
      movies={watchedMovies}
      loading={false}
      categoryId="watched"
      onMovieSelect={onMovieSelect}
      showAllText="Показать все"
      showAllRoute="/watched/all"
      showTitle={showTitle}
      showRemoveButtons={showRemoveButtons}
      onRemoveFromWatched={handleRemove}
    />
  );
};
