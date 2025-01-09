import { useState, useEffect } from "react";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (movie: any) => {
    setFavorites((prev) => {
      if (!prev.some((item) => item.id === movie.id)) {
        return [...prev, movie];
      }
      return prev;
    });
  };

  const removeFromFavorites = (movieId: number) => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  const isFavorite = (movieId: number) => {
    return favorites.some((movie) => movie.id === movieId);
  };

  return { favorites, addToFavorites, removeFromFavorites, isFavorite };
};
