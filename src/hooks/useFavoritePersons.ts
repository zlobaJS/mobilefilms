import { useState, useEffect } from "react";

interface FavoritePerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export const useFavoritePersons = () => {
  const [favoritePersons, setFavoritePersons] = useState<FavoritePerson[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("favoritePersons");
    if (stored) {
      setFavoritePersons(JSON.parse(stored));
    }
  }, []);

  const addToFavoritePersons = (person: FavoritePerson) => {
    setFavoritePersons((prev) => {
      const updated = [...prev, person];
      localStorage.setItem("favoritePersons", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromFavoritePersons = (personId: number) => {
    setFavoritePersons((prev) => {
      const updated = prev.filter((p) => p.id !== personId);
      localStorage.setItem("favoritePersons", JSON.stringify(updated));
      return updated;
    });
  };

  const isPersonFavorite = (personId: number) => {
    return favoritePersons.some((p) => p.id === personId);
  };

  return {
    favoritePersons,
    addToFavoritePersons,
    removeFromFavoritePersons,
    isPersonFavorite,
  };
};
