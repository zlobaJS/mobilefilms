const tmdbProxy = {
  name: "TMDB Proxy",
  version: "1.0.3",
  path_image: "https://imagetmdb.com/t/p",
  path_api: "https://apitmdb.cub.red/3",
};

const API_KEY = "25d88f055e7a91d25fd272f3fd287165";

export const imageUrl = (path: string, size: string = "w500") => {
  if (!path) return "";
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

export const getMovies = {
  popular: async (page = 1) => {
    const data = await fetchTMDB("/movie/popular", { page: page.toString() });
    return data;
  },
  trending: async (page = 1) => {
    const data = await fetchTMDB("/movie/now_playing", {
      page: page.toString(),
      // region: "RU",
      "vote_count.gte": "100",
      append_to_response: "release_dates",
    });
    console.log("Now playing (trending) movies data:", data);
    return data;
  },
  topRated: async (page = 1) => {
    const data = await fetchTMDB("/discover/movie", {
      page: page.toString(),
      sort_by: "vote_average.desc",
      "vote_count.gte": "1000",
      "vote_average.gte": "7.5",
    });
    return data;
  },
  upcoming: async (page = 1) => {
    const data = await fetchTMDB("/movie/upcoming", { page: page.toString() });
    return data;
  },
  nowPlaying: async (page = 1) => {
    clearCache();

    const data = await fetchTMDB("/movie/now_playing", {
      page: page.toString(),
      // region: "RU",
      "vote_count.gte": "10",
      sort_by: "popularity.desc",
    });
    console.log("Now playing movies data:", data);
    return data;
  },
  watchingToday: async (page = 1) => {
    const data = await fetchTMDB("/movie/now_playing", {
      page: page.toString(),
      // region: "RU",
      "vote_count.gte": "10",
      sort_by: "popularity.desc",
    });
    return data;
  },
  trendingToday: async (page = 1) => {
    const data = await fetchTMDB("/trending/movie/day", {
      page: page.toString(),
    });
    return data;
  },
  trendingWeek: async (page = 1) => {
    const data = await fetchTMDB("/trending/movie/week", {
      page: page.toString(),
    });
    return data;
  },
  byGenre: async (genreId: number, page = 1) => {
    const data = await fetchTMDB("/discover/movie", {
      page: page.toString(),
      with_genres: genreId.toString(),
      "vote_count.gte": "100",
      sort_by: "popularity.desc",
    });
    return data;
  },
  byMultipleGenres: async (genreIds: number[], page = 1) => {
    const data = await fetchTMDB("/discover/movie", {
      page: page.toString(),
      with_genres: genreIds.join(","),
      "vote_count.gte": "100",
      sort_by: "popularity.desc",
    });
    return data;
  },
};

export const getMovieImages = async (movieId: number) => {
  try {
    const data = await fetchTMDB(`/movie/${movieId}/images`, {
      include_image_language: "ru,null",
    });
    return data;
  } catch (error) {
    console.error("Error fetching movie images:", error);
    return { logos: [] };
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
  ACTION: 28, // Боевик
  COMEDY: 35, // Комедия
  HORROR: 27, // Ужасы
  SCIFI: 878, // Фантастика
  THRILLER: 53, // Триллер
  WESTERN: 37, // Вестерн
  DRAMA: 18, // Драма
  WAR: 10752, // Военный
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
