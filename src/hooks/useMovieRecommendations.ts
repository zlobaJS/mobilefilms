import { useState, useEffect } from "react";
import { getMovieRecommendations } from "../api/tmdb";
import { Movie } from "../types/movie";

export const useMovieRecommendations = (
  favorites: Movie[],
  watchedMovies: Movie[]
) => {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        // Объединяем все фильмы и создаем Set их ID для быстрой проверки
        const allMovies = [...favorites, ...watchedMovies];
        const existingMovieIds = new Set(allMovies.map((movie) => movie.id));

        if (allMovies.length === 0) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // Получаем рекомендации для каждого фильма
        const recommendationsPromises = allMovies.map((movie) =>
          getMovieRecommendations(movie.id)
        );

        const allRecommendationsArrays = await Promise.all(
          recommendationsPromises
        );

        // Создаем Map для хранения уникальных рекомендаций
        const uniqueRecommendationsMap = new Map<number, Movie>();

        // Обрабатываем каждый массив рекомендаций
        allRecommendationsArrays.forEach((recommendations) => {
          recommendations.forEach((movie: Movie) => {
            // Пропускаем фильмы, которые уже есть в избранном или просмотренных
            if (
              !existingMovieIds.has(movie.id) &&
              !uniqueRecommendationsMap.has(movie.id)
            ) {
              uniqueRecommendationsMap.set(movie.id, movie);
            }
          });
        });

        // Преобразуем Map в массив и сортируем
        const uniqueRecommendations = Array.from(
          uniqueRecommendationsMap.values()
        )
          .sort((a, b) => b.vote_average - a.vote_average)
          .slice(0, 20);

        setRecommendations(uniqueRecommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [favorites, watchedMovies]);

  return { recommendations, loading };
};
