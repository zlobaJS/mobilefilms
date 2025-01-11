const tmdbProxy = {
  name: "TMDB Proxy",
  version: "1.0.3",
  path_image: "https://imagetmdb.com/t/p",
  path_api: "https://apitmdb.cub.red/3",
};

const API_KEY = "25d88f055e7a91d25fd272f3fd287165";

export const imageUrl = (
  path: string | null | undefined,
  size: string = "original"
) => {
  if (!path) {
    return "https://via.placeholder.com/500x750?text=No+Image";
  }
  return `${tmdbProxy.path_image}/${size}${path}`;
};

interface CacheItem {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheItem>();
const CACHE_LIFETIME = 0; // было 2 * 60 * 60 * 1000

export const fetchTMDB = async (
  endpoint: string,
  params: Record<string, string> = {}
) => {
  const cacheKey = `${endpoint}?${new URLSearchParams(params)}`;
  const now = Date.now();

  if (cache.has(cacheKey)) {
    const cachedItem = cache.get(cacheKey)!;
    if (now - cachedItem.timestamp < CACHE_LIFETIME) {
      return cachedItem.data;
    }
    cache.delete(cacheKey);
  }

  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: "ru-RU",
    region: "RU",
    ...params,
  });

  try {
    const response = await fetch(
      `${tmdbProxy.path_api}${endpoint}?${queryParams}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: now });
    return data;
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    return { results: [] };
  }
};

export const clearCache = () => {
  cache.clear();
  console.log("Cache cleared");
};

// Вспомогательная функция для обогащения фильма изображениями
const enrichMovieWithImages = async (movie: any) => {
  try {
    const images = await getMovieImages(movie.id);
    if (images.backdrops?.[0]) {
      movie.backdrop_path = images.backdrops[0].file_path;
    }
    if (images.posters && images.posters.length > 0) {
      const russianPoster = images.posters.find(
        (p: any) => p.iso_639_1 === "ru"
      );
      if (russianPoster) {
        movie.poster_path = russianPoster.file_path;
      }
    }
    return movie;
  } catch (error) {
    return movie;
  }
};

export const getMovies = {
  nowPlaying: async (page = 1) => {
    return await fetchTMDB("/movie/now_playing", {
      page: page.toString(),
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
    });
  },

  trendingToday: async (page = 1) => {
    return await fetchTMDB("/trending/movie/day", {
      page: page.toString(),
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
    });
  },

  trendingWeek: async (page = 1) => {
    return await fetchTMDB("/trending/movie/week", {
      page: page.toString(),
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
    });
  },

  popular: async (page = 1) => {
    return await fetchTMDB("/movie/popular", {
      page: page.toString(),
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
    });
  },

  byGenre: async (genreId: number, page = 1) => {
    const data = await fetchTMDB("/discover/movie", {
      with_genres: genreId.toString(),
      page: page.toString(),
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
    });

    if (data.results && data.results.length > 0) {
      data.results = await Promise.all(data.results.map(enrichMovieWithImages));
    }

    return data;
  },

  byCategory: async (category: string, page = 1) => {
    switch (category) {
      case "now-playing":
        return await getMovies.nowPlaying(page);
      case "trending-today":
        return await getMovies.trendingToday(page);
      case "trending-week":
        return await getMovies.trendingWeek(page);
      case "popular":
        return await getMovies.popular(page);
      case "horror":
        return await getMovies.byGenre(GENRES.HORROR, page);
      case "action":
        return await getMovies.byGenre(GENRES.ACTION, page);
      case "comedy":
        return await getMovies.byGenre(GENRES.COMEDY, page);
      case "scifi":
        return await getMovies.byGenre(GENRES.SCIFI, page);
      case "fantasy":
        return await getMovies.byGenre(GENRES.FANTASY, page);
      case "thriller":
        return await getMovies.byGenre(GENRES.THRILLER, page);
      case "western":
        return await getMovies.byGenre(GENRES.WESTERN, page);
      case "drama":
        return await getMovies.byGenre(GENRES.DRAMA, page);
      case "war":
        return await getMovies.byGenre(GENRES.WAR, page);
      default:
        return await getMovies.popular(page);
    }
  },
};

export const getMovieImages = async (movieId: number) => {
  try {
    const data = await fetchTMDB(`/movie/${movieId}/images`, {
      include_image_language: "ru,en,null",
    });

    // Сортировка backdrops по приоритету языка и качеству
    if (data.backdrops && data.backdrops.length > 0) {
      // Сначала ищем backdrop без языка
      const noLanguageBackdrop = data.backdrops.find((b: any) => !b.iso_639_1);

      // Если нет без языка, ищем русский backdrop
      const russianBackdrop = data.backdrops.find(
        (b: any) => b.iso_639_1 === "ru"
      );

      // Используем найденный backdrop или первый доступный
      const bestBackdrop =
        noLanguageBackdrop || russianBackdrop || data.backdrops[0];

      // Сортируем backdrops по размеру для лучшего качества
      data.backdrops = [bestBackdrop].sort((a: any, b: any) => {
        return b.width * b.height - a.width * a.height;
      });
    }

    // Существующая логика для logos
    if (data.logos && data.logos.length > 0) {
      const russianLogo = data.logos.find(
        (logo: any) => logo.iso_639_1 === "ru"
      );
      const englishLogo = data.logos.find(
        (logo: any) => logo.iso_639_1 === "en"
      );
      const neutralLogo = data.logos.find((logo: any) => !logo.iso_639_1);

      const bestLogo =
        russianLogo || englishLogo || neutralLogo || data.logos[0];
      data.logos = bestLogo ? [bestLogo] : [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching movie images:", error);
    return { backdrops: [], logos: [], posters: [] };
  }
};

export const getMovieDetails = async (movieId: number) => {
  try {
    const data = await fetchTMDB(`/movie/${movieId}`, {});
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

export const getMovieCredits = async (movieId: number) => {
  try {
    const data = await fetchTMDB(`/movie/${movieId}/credits`, {});
    return data;
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    return null;
  }
};

export const GENRES = {
  ACTION: 28,
  COMEDY: 35,
  HORROR: 27,
  SCIFI: 878,
  FANTASY: 14,
  THRILLER: 53,
  WESTERN: 37,
  DRAMA: 18,
  WAR: 10752,
};

export const getCollection = async (collectionId: number) => {
  try {
    const data = await fetchTMDB(`/collection/${collectionId}`, {});
    return data;
  } catch (error) {
    console.error("Error fetching collection:", error);
    return null;
  }
};

export const getMovieRecommendations = async (movieId: number) => {
  try {
    const data = await fetchTMDB(`/movie/${movieId}/recommendations`, {});
    return data.results || [];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};

export const getMovieKeywords = async (movieId: number) => {
  try {
    const data = await fetchTMDB(`/movie/${movieId}/keywords`, {});
    return data.keywords || [];
  } catch (error) {
    console.error("Error fetching movie keywords:", error);
    return [];
  }
};

export const getMoviesByKeyword = async (keywordId: number, page = 1) => {
  try {
    const data = await fetchTMDB("/discover/movie", {
      with_keywords: keywordId.toString(),
      page: page.toString(),
      sort_by: "popularity.desc",
    });
    return data;
  } catch (error) {
    console.error("Error fetching movies by keyword:", error);
    return { results: [] };
  }
};

export const searchMovies = async (query: string, page = 1) => {
  try {
    const data = await fetchTMDB("/search/movie", {
      query,
      page: page.toString(),
      include_image_language: "ru,en,null",
      region: "RU",
    });

    if (data.results && data.results.length > 0) {
      data.results = await Promise.all(data.results.map(enrichMovieWithImages));
    }

    return data.results || [];
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

export const getMovieVideos = async (movieId: number) => {
  try {
    const data = await fetchTMDB(`/movie/${movieId}/videos`, {
      language: "ru-RU,en-US",
    });
    return data.results || [];
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    return [];
  }
};
