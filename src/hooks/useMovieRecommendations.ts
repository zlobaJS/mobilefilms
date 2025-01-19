import { useState, useEffect } from "react";
import {
  getMovieKeywords,
  getMoviesByKeyword,
  getMovieDetails,
} from "../api/tmdb";
import { Movie } from "../types/movie";

interface Genre {
  id: number;
  name: string;
}

interface Keyword {
  id: number;
  name: string;
}

interface MovieWithScore extends Movie {
  score?: number;
  genreScore?: number;
  keywordScore?: number;
}

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

        const userMovies = [...favorites, ...watchedMovies];
        if (userMovies.length === 0) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // Получаем детали и ключевые слова для фильмов пользователя
        const moviesDetailsPromises = userMovies.map((movie) =>
          getMovieDetails(movie.id)
        );
        const keywordsPromises = userMovies.map((movie) =>
          getMovieKeywords(movie.id)
        );

        const [moviesDetails, moviesKeywords] = await Promise.all([
          Promise.all(moviesDetailsPromises),
          Promise.all(keywordsPromises),
        ]);

        // Собираем статистику по жанрам
        const genreWeights = new Map<number, number>();
        moviesDetails.forEach((movie) => {
          if (movie?.genres) {
            movie.genres.forEach((genre: Genre) => {
              const currentWeight = genreWeights.get(genre.id) || 0;
              genreWeights.set(genre.id, currentWeight + 1);
            });
          }
        });

        // Собираем статистику по ключевым словам
        const keywordWeights = new Map<number, number>();
        moviesKeywords.forEach((keywords) => {
          if (keywords) {
            keywords.forEach((keyword: Keyword) => {
              const currentWeight = keywordWeights.get(keyword.id) || 0;
              keywordWeights.set(keyword.id, currentWeight + 1);
            });
          }
        });

        // Сортируем ключевые слова по весу
        const sortedKeywords = Array.from(keywordWeights.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5); // Берем топ-5 ключевых слов

        // Получаем фильмы по каждому ключевому слову
        const moviesByKeywordPromises = sortedKeywords.map(([keywordId]) =>
          getMoviesByKeyword(keywordId)
        );
        const moviesByKeyword = await Promise.all(moviesByKeywordPromises);

        // Объединяем все найденные фильмы
        const potentialRecommendations = new Map<number, MovieWithScore>();

        // Обрабатываем каждый найденный фильм
        for (const [keywordIndex, movies] of moviesByKeyword.entries()) {
          const keywordWeight = sortedKeywords[keywordIndex][1];

          for (const movie of movies.results || []) {
            if (!potentialRecommendations.has(movie.id)) {
              // Получаем детали фильма для проверки жанров
              const movieDetails = await getMovieDetails(movie.id);
              if (!movieDetails) continue;

              // Вычисляем схожесть по жанрам
              let genreScore = 0;
              movieDetails.genres?.forEach((genre: Genre) => {
                genreScore += genreWeights.get(genre.id) || 0;
              });

              // Вычисляем общий скор
              const keywordScore = keywordWeight * 2; // Увеличиваем вес ключевых слов
              const score =
                keywordScore +
                genreScore * 1.5 + // Добавляем вес жанров
                (movie.vote_average || 0);

              potentialRecommendations.set(movie.id, {
                ...movie,
                score,
                genreScore,
                keywordScore,
              });
            } else {
              // Если фильм уже есть, увеличиваем его keywordScore
              const existing = potentialRecommendations.get(movie.id)!;
              const additionalScore = keywordWeight * 2;
              existing.keywordScore =
                (existing.keywordScore || 0) + additionalScore;
              existing.score = (existing.score || 0) + additionalScore;
            }
          }
        }

        // Фильтруем и сортируем рекомендации
        const sortedRecommendations = Array.from(
          potentialRecommendations.values()
        )
          .filter(
            (movie) =>
              !favorites.some((f) => f.id === movie.id) &&
              !watchedMovies.some((w) => w.id === movie.id)
          )
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 20);

        console.log(
          "Final recommendations with scores:",
          sortedRecommendations
        );
        setRecommendations(sortedRecommendations);
      } catch (error) {
        console.error("Error generating recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [favorites, watchedMovies]);

  return { recommendations, loading };
};
