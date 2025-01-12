import { useState, useCallback } from "react";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const addToFavorites = useCallback((movie: any) => {
    setFavorites((prev) => {
      if (!prev.some((item) => item.id === movie.id)) {
        const updated = [movie, ...prev];
        localStorage.setItem("favorites", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const removeFromFavorites = useCallback((movieId: number) => {
    setFavorites((prev) => {
      const updated = prev.filter((movie) => movie.id !== movieId);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (movieId: number) => {
      return favorites.some((movie) => movie.id === movieId);
    },
    [favorites]
  );

  return { favorites, addToFavorites, removeFromFavorites, isFavorite };
};
