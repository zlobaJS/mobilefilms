import { useState, useCallback } from "react";

export const useWatched = () => {
  const [watchedMovies, setWatchedMovies] = useState<any[]>(() => {
    const stored = localStorage.getItem("watchedMovies");
    return stored ? JSON.parse(stored) : [];
  });

  const addToWatched = useCallback((movie: any) => {
    setWatchedMovies((prev) => {
      if (!prev.some((item) => item.id === movie.id)) {
        const updated = [movie, ...prev];
        localStorage.setItem("watchedMovies", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const removeFromWatched = useCallback((movieId: number) => {
    setWatchedMovies((prev) => {
      const updated = prev.filter((movie) => movie.id !== movieId);
      localStorage.setItem("watchedMovies", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isWatched = useCallback(
    (movieId: number) => {
      return watchedMovies.some((movie) => movie.id === movieId);
    },
    [watchedMovies]
  );

  return { watchedMovies, addToWatched, removeFromWatched, isWatched };
};
