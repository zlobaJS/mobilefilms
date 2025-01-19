import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { imageUrl } from "../api/tmdb";

const BACKDROP_STORAGE_KEY = "profileBackdrop";

interface StoredBackdrop {
  backdropPath: string;
  movieId: number;
  userId: string;
}

export const useProfileBackdrop = (userId: string | undefined) => {
  const [backdropPath, setBackdropPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Функция для сохранения в localStorage
  const saveToLocalStorage = (data: StoredBackdrop) => {
    try {
      localStorage.setItem(BACKDROP_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving backdrop to localStorage:", error);
    }
  };

  // Функция для получения из localStorage
  const getFromLocalStorage = (): StoredBackdrop | null => {
    try {
      const stored = localStorage.getItem(BACKDROP_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error reading backdrop from localStorage:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadBackdrop = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Сначала пробуем загрузить из localStorage
        const storedBackdrop = getFromLocalStorage();
        if (storedBackdrop && storedBackdrop.userId === userId) {
          setBackdropPath(storedBackdrop.backdropPath);
        }

        // Затем загружаем из Firebase и обновляем если есть изменения
        const userDoc = await getDoc(doc(db, "users", userId));
        const data = userDoc.data();

        if (data?.profileBackdrop) {
          setBackdropPath(data.profileBackdrop);

          // Обновляем localStorage если данные отличаются
          if (
            !storedBackdrop ||
            storedBackdrop.backdropPath !== data.profileBackdrop
          ) {
            saveToLocalStorage({
              backdropPath: data.profileBackdrop,
              movieId: data.profileBackdropMovieId,
              userId: userId,
            });
          }
        }
      } catch (error) {
        console.error("Error loading profile backdrop:", error);

        // В случае ошибки Firebase используем данные из localStorage
        const storedBackdrop = getFromLocalStorage();
        if (storedBackdrop && storedBackdrop.userId === userId) {
          setBackdropPath(storedBackdrop.backdropPath);
        }
      } finally {
        setLoading(false);
      }
    };

    loadBackdrop();
  }, [userId]);

  const setProfileBackdrop = async (movieId: number, backdropPath: string) => {
    if (!userId) return;

    try {
      // Сохраняем в Firebase
      await setDoc(
        doc(db, "users", userId),
        {
          profileBackdrop: backdropPath,
          profileBackdropMovieId: movieId,
        },
        { merge: true }
      );

      // Сохраняем в localStorage
      saveToLocalStorage({
        backdropPath,
        movieId,
        userId,
      });

      setBackdropPath(backdropPath);
    } catch (error) {
      console.error("Error setting profile backdrop:", error);

      // Даже если Firebase недоступен, сохраняем в localStorage
      saveToLocalStorage({
        backdropPath,
        movieId,
        userId,
      });
      setBackdropPath(backdropPath);

      throw error;
    }
  };

  return {
    backdropPath: backdropPath ? imageUrl(backdropPath, "original") : null,
    setProfileBackdrop,
    loading,
  };
};
