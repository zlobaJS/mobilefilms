export interface RankData {
  rank: number | null;
}

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

  mostRated: async (page = 1) => {
    return await fetchTMDB("/discover/movie", {
      page: page.toString(),
      sort_by: "vote_count.desc",
      "vote_count.gte": "1000",
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
    });
  },

  mostRated2024: async (page = 1) => {
    return await fetchTMDB("/discover/movie", {
      page: page.toString(),
      sort_by: "vote_count.desc",
      "vote_count.gte": "100",
      primary_release_year: "2024",
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
    });
  },

  popular2024: async (page = 1) => {
    return await fetchTMDB("/discover/movie", {
      page: page.toString(),
      sort_by: "popularity.desc",
      primary_release_year: "2024",
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
    });
  },

  byCategory: async (category: string, page = 1, sortBy?: string) => {
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
      case "ru-movies":
        return await getMovies.byCountry("RU", page, sortBy);
      case "most-rated":
        return await getMovies.mostRated(page);
      case "most-rated-2024":
        return await getMovies.mostRated2024(page);
      case "popular-2024":
        return await getMovies.popular2024(page);
      default:
        return await getMovies.popular(page);
    }
  },

  byCountry: async (
    countryCode: string,
    page = 1,
    sortBy: string = "popularity.desc"
  ) => {
    const data = await fetchTMDB("/discover/movie", {
      with_origin_country: countryCode,
      page: page.toString(),
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
      sort_by: sortBy,
    });

    if (data.results && data.results.length > 0) {
      data.results = await Promise.all(data.results.map(enrichMovieWithImages));
    }

    return data;
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

export const getMovieReleaseInfo = async (movieId: number) => {
  try {
    const data = await fetchTMDB(`/movie/${movieId}/release_dates`, {});

    if (!data.results) {
      return { certification: null, releases: [] };
    }

    // Получаем сертификацию как раньше
    let certification = null;
    const ruRelease = data.results.find((r: any) => r.iso_3166_1 === "RU");
    if (ruRelease?.release_dates?.[0]?.certification) {
      certification = ruRelease.release_dates[0].certification;
    } else {
      const usRelease = data.results.find((r: any) => r.iso_3166_1 === "US");
      if (usRelease?.release_dates?.[0]?.certification) {
        certification = usRelease.release_dates[0].certification;
      }
    }

    // Форматируем данные о релизах с приоритетом RU и US
    const allReleases = data.results
      .map((country: any) => {
        if (!country.release_dates?.[0]) return null;

        return {
          country: country.iso_3166_1,
          type: country.release_dates[0].type,
          date: country.release_dates[0].release_date,
          certification: country.release_dates[0].certification,
        };
      })
      .filter(Boolean);

    // Сортируем релизы по приоритету стран и дате
    const releases = allReleases.sort((a: any, b: any) => {
      // Приоритет стран
      const getPriority = (country: string) => {
        if (country === "RU") return 0;
        if (country === "US") return 1;
        return 2;
      };

      const priorityA = getPriority(a.country);
      const priorityB = getPriority(b.country);

      // Сначала сортируем по приоритету стран
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Затем по дате
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return { certification, releases };
  } catch (error) {
    console.error("Error fetching movie release info:", error);
    return { certification: null, releases: [] };
  }
};

export const AGE_RATINGS: { [key: string]: string } = {
  G: "0+",
  PG: "6+",
  "PG-13": "13+",
  R: "17+",
  "NC-17": "18+",
  // Российские рейтинги
  "0+": "0+",
  "6+": "6+",
  "12+": "12+",
  "16+": "16+",
  "18+": "18+",
  // Дополнительные рейтинги
  TV14: "14+",
  "TV-14": "14+",
  "TV-MA": "17+",
  "TV-PG": "6+",
  "TV-G": "0+",
  // Европейские рейтинги
  U: "0+",
  UA: "6+",
  "12": "12+",
  "12A": "12+",
  "15": "15+",
  "16": "16+",
  "18": "18+",
};

export const getPersonDetails = async (personId: number) => {
  try {
    const data = await fetchTMDB(`/person/${personId}`, {});
    return data;
  } catch (error) {
    console.error("Error fetching person details:", error);
    return null;
  }
};

export const getPersonMovieCredits = async (personId: number) => {
  try {
    const data = await fetchTMDB(`/person/${personId}/movie_credits`, {});
    return data;
  } catch (error) {
    console.error("Error fetching person movie credits:", error);
    return null;
  }
};

export const getPersonImages = async (personId: number) => {
  try {
    const data = await fetchTMDB(`/person/${personId}/images`, {});
    return data.profiles || [];
  } catch (error) {
    console.error("Error fetching person images:", error);
    return [];
  }
};

export const getMoviesByStudio = async (studioName: string, page = 1) => {
  try {
    // Сначала получаем ID студии по её имени
    const searchCompany = await fetchTMDB("/search/company", {
      query: studioName,
      page: "1",
    });

    if (!searchCompany.results?.[0]?.id) {
      return { results: [] };
    }

    const companyId = searchCompany.results[0].id;

    // Затем получаем все фильмы этой студии
    const data = await fetchTMDB("/discover/movie", {
      with_companies: companyId.toString(),
      page: page.toString(),
      sort_by: "popularity.desc",
      include_image_language: "ru,en,null",
      region: "RU",
      language: "ru-RU",
    });

    return data;
  } catch (error) {
    console.error("Error fetching movies by studio:", error);
    return { results: [] };
  }
};

// 3. Модифицировать функцию получения ранга
export const getMovieRankByVoteCount = async (movieId: number) => {
  try {
    const movieDetails = await getMovieDetails(movieId);
    if (!movieDetails?.vote_count) return null;

    // Получаем первую страницу для определения общего количества фильмов
    const initialData = await fetchTMDB("/discover/movie", {
      sort_by: "vote_count.desc",
      page: "1",
      region: "RU",
      language: "ru-RU",
      include_image_language: "ru,en,null",
      "vote_count.gte": "100",
    });

    // Проверяем, есть ли фильм на первой странице
    const firstPagePosition = initialData.results.findIndex(
      (movie: any) => movie.id === movieId
    );

    if (firstPagePosition !== -1) {
      // Если фильм на первой странице, возвращаем его точную позицию
      return { rank: firstPagePosition + 1 };
    }

    // Если фильм не на первой странице, используем бинарный поиск
    let currentRank = null;
    const totalPages = Math.min(Math.ceil(5000 / 20), initialData.total_pages);

    let left = 2; // Начинаем со второй страницы
    let right = totalPages;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      const data = await fetchTMDB("/discover/movie", {
        sort_by: "vote_count.desc",
        page: mid.toString(),
        region: "RU",
        language: "ru-RU",
        include_image_language: "ru,en,null",
        "vote_count.gte": "100",
      });

      const position = data.results.findIndex(
        (movie: any) => movie.id === movieId
      );

      if (position !== -1) {
        // Нашли фильм на текущей странице
        currentRank = (mid - 1) * 20 + position + 1;
        break;
      }

      // Определяем, в какую сторону двигаться, сравнивая количество голосов
      const firstMovieVoteCount = data.results[0]?.vote_count || 0;
      const lastMovieVoteCount =
        data.results[data.results.length - 1]?.vote_count || 0;

      if (movieDetails.vote_count > firstMovieVoteCount) {
        // Фильм должен быть на более ранних страницах
        right = mid - 1;
      } else if (movieDetails.vote_count < lastMovieVoteCount) {
        // Фильм должен быть на более поздних страницах
        left = mid + 1;
      } else {
        // Фильм должен быть на текущей странице, но мы его не нашли
        // Это может быть из-за особенностей сортировки API
        // Продолжаем поиск в обе стороны
        const prevPage = await fetchTMDB("/discover/movie", {
          sort_by: "vote_count.desc",
          page: (mid - 1).toString(),
          region: "RU",
          language: "ru-RU",
          include_image_language: "ru,en,null",
          "vote_count.gte": "100",
        });

        const prevPosition = prevPage.results.findIndex(
          (movie: any) => movie.id === movieId
        );

        if (prevPosition !== -1) {
          currentRank = (mid - 2) * 20 + prevPosition + 1;
          break;
        }

        const nextPage = await fetchTMDB("/discover/movie", {
          sort_by: "vote_count.desc",
          page: (mid + 1).toString(),
          region: "RU",
          language: "ru-RU",
          include_image_language: "ru,en,null",
          "vote_count.gte": "100",
        });

        const nextPosition = nextPage.results.findIndex(
          (movie: any) => movie.id === movieId
        );

        if (nextPosition !== -1) {
          currentRank = mid * 20 + nextPosition + 1;
          break;
        }

        // Если все еще не нашли, двигаемся вперед
        left = mid + 2;
      }
    }

    if (!currentRank || currentRank > 5000) {
      return null;
    }

    return { rank: currentRank };
  } catch (error) {
    console.error("Error getting movie rank:", error);
    return null;
  }
};
