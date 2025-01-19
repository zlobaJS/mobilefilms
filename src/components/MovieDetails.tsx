import {
  Box,
  Typography,
  Dialog,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Fade,
  Button,
  Divider,
  Backdrop,
  Chip,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import {
  imageUrl,
  getMovieImages,
  getMovieDetails,
  getMovieCredits,
  getCollection,
  getMovieRecommendations,
  getMovieKeywords,
  getMovieVideos,
  getMovieReleaseInfo,
  AGE_RATINGS,
  getMovieRankByVoteCount,
  RankData,
} from "../api/tmdb";
import { useEffect, useState } from "react";
import { KinoboxPlayer } from "./KinoboxPlayer";
import * as Flags from "country-flag-icons/react/3x2";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import { isIOS, isAndroid } from "react-device-detect";
import ReactPlayer from "react-player";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useWatched } from "../hooks/useWatched";
import { PersonDetails } from "./PersonDetails";
// Добавьте импорт для Radar из recharts
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
// Добавим новый импорт
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// В начале файла добавим импорт
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import { MovieImage } from "../api/tmdb";
// Добавляем импорт контекста авторизации
import { useAuthContext } from "../contexts/AuthContext";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xxs: true;
  }
}

interface MovieDetailsProps {
  movie?: any;
  movieId?: number;
  open: boolean;
  onClose: () => void;
  onMovieSelect?: (movieId: number) => void;
  onPersonSelect?: (personId: number) => void;
  isPage?: boolean;
  updateTrigger?: number;
}

interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface CrewMember {
  id: number;
  job: string;
  department: string;
  jobs?: string[];
  isCreator?: boolean;
  [key: string]: any;
}

// Добавляем объект с переводами стран
const countryTranslations: { [key: string]: string } = {
  "United States of America": "США",
  "United Kingdom": "Великобритания",
  Russia: "Россия",
  France: "Франция",
  Germany: "Германия",
  Italy: "Италия",
  Spain: "Испания",
  China: "Китай",
  Japan: "Япония",
  "South Korea": "Южная Корея",
  India: "Индия",
  Canada: "Канада",
  Australia: "Австралия",
  Brazil: "Бразилия",
  Mexico: "Мексика",
  Bulgaria: "Болгария",
  Sweden: "Швеция",
  Denmark: "Дания",
  Norway: "Норвегия",
  Finland: "Финляндия",
  Poland: "Польша",
  Netherlands: "Нидерланды",
  Belgium: "Бельгия",
  Austria: "Австрия",
  Switzerland: "Швейцария",
  Greece: "Греция",
  Turkey: "Турция",
  Hungary: "Венгрия",
  "Czech Republic": "Чехия",
  Ireland: "Ирландия",
  "New Zealand": "Новая Зеландия",
  Argentina: "Аргентина",
  Thailand: "Таиланд",
  Ukraine: "Украина",
  Romania: "Румыния",
  Portugal: "Португалия",
};

// Функция для перевода названия страны
const translateCountry = (englishName: string): string => {
  return countryTranslations[englishName] || englishName;
};

// Функция форматирования даты
const formatReleaseDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Добавим интерфейс для метрики
interface Metric {
  label: string;
  value: string;
  description: string;
}

// Добавляем интерфейс для секции
interface MetricSection {
  section: string;
  metrics: (Metric | false)[];
}

export const MovieDetails = ({
  movie: initialMovie,
  movieId,
  open,
  onClose,
  onMovieSelect,
  isPage = false,
  updateTrigger = 0,
}: MovieDetailsProps) => {
  const theme = useTheme();
  theme.breakpoints.values = {
    ...theme.breakpoints.values,
    xxs: 395,
  };
  const isMobile = useMediaQuery("(max-width:400px)");
  const [logo, setLogo] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [isBackdropLoaded, setIsBackdropLoaded] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [_, setMediaUrl] = useState<string | null>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [collectionMovies, setCollectionMovies] = useState<any[]>([]);
  const [showCollection, setShowCollection] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(initialMovie);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpandedDescription, setIsExpandedDescription] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLogoLoading, setIsLogoLoading] = useState(true);
  const [hasLogo, setHasLogo] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Общее состояние загрузки
  const [keywords, setKeywords] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const autoplayTrailer = useSelector(
    (state: RootState) => state.settings.autoplayTrailer
  );
  const [certification, setCertification] = useState<string | null>(null);
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);
  const { addToWatched, removeFromWatched, isWatched } = useWatched();
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [isPersonDetailsOpen, setIsPersonDetailsOpen] = useState(false);
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [releaseData, setReleaseData] = useState<{
    certification: string | null;
    releases: any[];
  }>({
    certification: null,
    releases: [],
  });
  // Добавляем новое состояние для контроля тултипа на мобильных устройствах
  const [showVoteTooltip, setShowVoteTooltip] = useState(false);
  // Добавим состояние для модального окна с деталями
  const [showMetricsDetails, setShowMetricsDetails] = useState(false);
  // Внутри компонента MovieDetails добавим новые состояния
  const [availableBackdrops, setAvailableBackdrops] = useState<MovieImage[]>(
    []
  );
  const [currentBackdropIndex, setCurrentBackdropIndex] = useState(0);

  // Добавляем useMediaQuery для определения мобильного разрешения
  const isMobileView = useMediaQuery(theme.breakpoints.down("sm"));

  // Получаем данные о пользователе из контекста
  const { user } = useAuthContext();

  // Добавляем функцию для сохранения backdrop в localStorage
  const saveBackdropToLocalStorage = (
    movieId: number,
    backdropPath: string
  ) => {
    if (user) {
      // Используем uid пользователя для уникального ключа
      const key = `userBackdrops_${user.uid}`;
      const savedBackdrops = JSON.parse(localStorage.getItem(key) || "{}");
      savedBackdrops[movieId] = backdropPath;
      localStorage.setItem(key, JSON.stringify(savedBackdrops));
    }
  };

  // Добавляем функцию для получения сохраненного backdrop
  const getSavedBackdrop = (movieId: number): string | null => {
    if (user) {
      // Используем uid пользователя для уникального ключа
      const key = `userBackdrops_${user.uid}`;
      const savedBackdrops = JSON.parse(localStorage.getItem(key) || "{}");
      return savedBackdrops[movieId] || null;
    }
    return null;
  };

  // Добавляем функцию hasValue на уровне компонента
  const hasValue = (value: any) => {
    return value !== null && value !== undefined && value !== 0;
  };

  // Функция для расчета популярности
  const calculatePopularityScore = (releaseDate: string, voteCount: number) => {
    if (!releaseDate || !voteCount) return 0;

    const releaseDateTime = new Date(releaseDate).getTime();
    const currentTime = new Date().getTime();
    const daysSinceRelease =
      (currentTime - releaseDateTime) / (1000 * 60 * 60 * 24);

    // Если фильм вышел менее 30 дней назад
    if (daysSinceRelease < 30) {
      // Для новых фильмов используем более мягкую шкалу
      return Math.min(voteCount / 1000, 1); // 1000 голосов за первый месяц считаем максимумом
    }

    // Для более старых фильмов считаем среднее количество голосов в день
    const votesPerDay = voteCount / Math.max(daysSinceRelease, 1);

    // Нормализуем значение. Считаем, что 5 голосов в день - это хороший показатель
    return Math.min(votesPerDay / 5, 1);
  };

  // Функция для расчета окупаемости
  const calculateROI = (budget: number, revenue: number) => {
    if (!budget || !revenue) return 0;
    const roi = (revenue - budget) / budget;
    return Math.min(roi / 10, 1);
  };

  // Модифицируем fetchData
  const fetchData = async (movieData: any) => {
    if (movieData) {
      setIsLoading(true);
      try {
        const [
          images,
          movieDetails,
          credits,
          recommendedMovies,
          keywordsData,
          releaseInfo,
          rank,
        ] = await Promise.all([
          getMovieImages(movieData.id),
          getMovieDetails(movieData.id),
          getMovieCredits(movieData.id),
          getMovieRecommendations(movieData.id),
          getMovieKeywords(movieData.id),
          getMovieReleaseInfo(movieData.id),
          getMovieRankByVoteCount(movieData.id),
        ]);

        console.log("Movie ID:", movieData.id);
        console.log("Release Info from API:", releaseInfo);
        console.log("Current certification state:", certification);

        // Добавим логирование для отладки
        console.log("Release Info:", releaseInfo);

        // Используем backdrop из images API вместо movieData.backdrop_path
        if (movieDetails && images.backdrops?.[0]) {
          movieDetails.backdrop_path = images.backdrops[0].file_path;
        }

        let logoPath = null;
        let hasLogoTemp = false;

        if (images.logos && images.logos.length > 0) {
          logoPath = images.logos[0].file_path;
          hasLogoTemp = true;
        }

        setLogo(logoPath);
        setHasLogo(hasLogoTemp);
        setDetails(movieDetails || null);

        // Разделяем актеров и создателей
        const actors =
          credits?.cast?.slice(0, 15).map((person: CrewMember) => ({
            ...person,
            isActor: true,
            department: "Acting",
          })) || [];

        const creators =
          credits?.crew
            ?.filter(
              (person: CrewMember) =>
                person.job === "Director" ||
                person.job === "Screenplay" ||
                person.job === "Writer" ||
                person.job === "Producer"
            )
            // Группируем по id человека
            .reduce((acc: CrewMember[], person: CrewMember) => {
              const existingPerson = acc.find((p) => p.id === person.id);
              if (existingPerson) {
                // Если человек уже есть, добавляем ему новую роль
                existingPerson.jobs = [
                  ...(existingPerson.jobs || []),
                  person.job,
                ];
              } else {
                // Если человека еще нет, добавляем его с первой ролью
                acc.push({
                  ...person,
                  jobs: [person.job],
                  isCreator: true,
                  department: person.department,
                });
              }
              return acc;
            }, []) || [];

        // Объединяем все данные в один массив, но помечаем создателей специальным флагом
        const castAndCrew = [...actors, ...creators];

        setCast(castAndCrew);

        setRecommendations(recommendedMovies || []);
        setKeywords(keywordsData);
        setCertification(releaseInfo.certification);
        setReleaseData(releaseInfo);
        setIsLogoLoading(false);
        setIsLoading(false);
        setRankData(rank);
      } catch (error) {
        console.error("Error in fetchData:", error);
        setIsLoading(false);
      }
    }
  };

  // Обновляем эффект для загрузки данных
  useEffect(() => {
    const loadMovieData = async () => {
      if (movieId) {
        setIsLoading(true);
        try {
          const movieDetails = await getMovieDetails(movieId);
          setCurrentMovie(movieDetails);
          fetchData(movieDetails);
        } catch (error) {
          console.error("Error loading movie:", error);
          setIsLoading(false);
        }
      }
    };

    if (open && movieId) {
      loadMovieData();
    } else if (open && initialMovie) {
      setCurrentMovie(initialMovie);
      fetchData(initialMovie);
    }
  }, [movieId, open, initialMovie]);

  // Обработчик для получения URL от Kinobox
  const handleMediaUrl = (url: string) => {
    setMediaUrl(url);
  };

  // Сбрасываем состояние плеера при закрытии диалога
  useEffect(() => {
    if (!open) {
      setShowPlayer(false);
    }
  }, [open]);

  // Добавляем функцию обработки клика
  const handleCollectionClick = async () => {
    if (details?.belongs_to_collection) {
      const collection = await getCollection(details.belongs_to_collection.id);
      if (collection?.parts) {
        // Сортируем фильмы по году (от старых к новым)
        const sortedMovies = [...collection.parts].sort((a, b) => {
          const yearA = new Date(a.release_date).getFullYear();
          const yearB = new Date(b.release_date).getFullYear();
          return yearA - yearB;
        });
        setCollectionMovies(sortedMovies);
        setShowCollection(true);
      }
    }
  };

  // Обновляем обработчик клика по фильму в коллекции
  const handleCollectionMovieClick = async (movieId: number) => {
    try {
      setIsUpdating(true);
      const movieDetails = await getMovieDetails(movieId);

      if (movieDetails) {
        setCurrentMovie(movieDetails);
        setRecommendations([]);
        fetchData(movieDetails);
        setShowCollection(false);

        if (onMovieSelect) {
          setTimeout(() => {
            onMovieSelect(movieDetails);
          }, 50);
        }
      }
    } catch (error) {
      console.error("Error loading movie details:", error);
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 300);
    }
  };

  // В useEffect добавляем обновление currentMovie при изменении movie
  useEffect(() => {
    setCurrentMovie(initialMovie);
  }, [initialMovie]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  // Функция для обрезки текста до ближайшей точки
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;

    // Обрезаем до максимальной длины
    let truncated = text.slice(0, maxLength);

    // Ищем последнюю точку в обрезанном тексте
    const lastDot = truncated.lastIndexOf(".");

    // Если точка найдена и она не в самом начале текста
    if (lastDot > 0) {
      // Обрезаем до последней точки и добавляем саму точку
      return truncated.slice(0, lastDot + 1);
    }

    // Если точка не найдена, ищем ближайшую точку после maxLength
    const nextDot = text.indexOf(".", maxLength);
    if (nextDot !== -1 && nextDot <= maxLength + 50) {
      // Ищем точку в пределах 50 символов после maxLength
      return text.slice(0, nextDot + 1);
    }

    // Если подходящая точка не найдена, возвращаем обрезанный текст
    return truncated.trim();
  };

  // Модифицируем эффект для загрузки рекомендаций
  useEffect(() => {
    let isMounted = true; // Флаг для предотвращения утечек памяти

    const fetchRecommendations = async () => {
      if (!currentMovie?.id) return;

      try {
        setRecommendations([]); // Очищаем предыдущие рекомендации
        const recommendedMovies = await getMovieRecommendations(
          currentMovie.id
        );

        if (isMounted) {
          setRecommendations(recommendedMovies || []);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        if (isMounted) {
          setRecommendations([]);
        }
      }
    };

    if (open && currentMovie?.id) {
      fetchRecommendations();
    }

    return () => {
      isMounted = false;
    };
  }, [currentMovie?.id, open]);

  // Обновляем обработчик клика по рекомендации
  const handleRecommendationClick = async (movie: any) => {
    try {
      setIsUpdating(true);
      navigate(`/movie/${movie.id}`);
    } catch (error) {
      console.error("Error loading movie details:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Обновляем эффект для сброса состояний
  useEffect(() => {
    if (!open) {
      setLogo(null);
      setDetails(null);
      setIsBackdropLoaded(false);
      setShowPlayer(false);
      setMediaUrl(null);
      setCast([]);
      setCollectionMovies([]);
      setShowCollection(false);
      setCurrentMovie(initialMovie);
      setIsVisible(false);
      setIsExpandedDescription(false);
      setRecommendations([]); // Очищаем рекомендации при закрытии
      setIsUpdating(false);
    } else {
      // При открытии устанавливаем начальный фильм
      setCurrentMovie(initialMovie);
    }
  }, [open, initialMovie]);

  // Модифицируем обработчик закрытия
  const handleClose = () => {
    onClose();
  };

  // Добавьте загрузку тегов в useEffect
  useEffect(() => {
    const fetchKeywords = async () => {
      if (currentMovie?.id) {
        const keywordsData = await getMovieKeywords(currentMovie.id);
        setKeywords(keywordsData);
      }
    };
    fetchKeywords();
  }, [currentMovie?.id]);

  const handleKeywordClick = (keywordId: number, keywordName: string) => {
    const encodedKeywordName = encodeURIComponent(keywordName);
    const path = `/keyword/${keywordId}/${encodedKeywordName}`;

    try {
      setIsUpdating(true);
      onClose();
      // Добавим небольшую задержку перед навигацией
      setTimeout(() => {
        navigate(path);
      }, 100);
    } catch (error) {
      console.error("Error navigating to keyword:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFavoriteClick = () => {
    if (currentMovie) {
      if (isFavorite(currentMovie.id)) {
        removeFromFavorites(currentMovie.id);
      } else {
        addToFavorites(currentMovie);
      }
    }
  };

  const handleShare = async () => {
    if (!currentMovie) return;

    // Создаем абсолютный URL для фильма
    const movieUrl = new URL(
      `/movie/${currentMovie.id}`,
      window.location.origin
    ).href;

    const shareData = {
      title: currentMovie.title,
      text: `Смотреть ${currentMovie.title} онлайн`,
      url: movieUrl, // Используем абсолютный URL вместо текущего URL
    };

    try {
      if (navigator.share && (isIOS || isAndroid)) {
        // Используем нативный шеринг для мобильных устройств
        await navigator.share(shareData);
      } else {
        // Fallback для десктопов или устройств без поддержки Web Share API
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(movieUrl);
          // Здесь можно добавить уведомление о копировании ссылки
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Добавьте эффект для загрузки трейлера (после других useEffect)
  useEffect(() => {
    if (currentMovie?.id && open) {
      setShowTrailer(false);
      setTrailerUrl(null);

      const loadTrailer = async () => {
        try {
          const videos = await getMovieVideos(currentMovie.id);
          let trailer = videos.find(
            (video: any) =>
              video.type === "Trailer" &&
              video.site === "YouTube" &&
              video.iso_639_1 === "ru"
          );

          if (!trailer) {
            trailer = videos.find(
              (video: any) =>
                video.type === "Trailer" &&
                video.site === "YouTube" &&
                video.iso_639_1 === "en"
            );
          }

          if (!trailer) {
            trailer = videos.find(
              (video: any) =>
                video.type === "Teaser" && video.site === "YouTube"
            );
          }

          if (trailer) {
            setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
            // Используем autoplayTrailer здесь
            if (autoplayTrailer) {
              setTimeout(() => {
                setShowTrailer(true);
              }, 3000);
            }
          }
        } catch (error) {
          console.error("Error fetching trailer:", error);
        }
      };

      loadTrailer();
    }

    return () => {
      setShowTrailer(false);
      setTrailerUrl(null);
    };
  }, [currentMovie?.id, open, autoplayTrailer]); // Добавляем autoplayTrailer в зависимости

  // Добавьте новый useEffect для контроля времени воспроизведения трейлера
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showTrailer && trailerUrl) {
      timer = setTimeout(() => {
        setShowTrailer(false);
        setTrailerUrl(null);
      }, 40000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showTrailer, trailerUrl]);

  useEffect(() => {
    if (open && autoplayTrailer) {
      // Логика автовоспроизведения
    }
  }, [open, autoplayTrailer]);

  useEffect(() => {
    console.log("Current certification:", certification);
  }, [certification]);

  const handleWatchedClick = () => {
    if (currentMovie) {
      if (isWatched(currentMovie.id)) {
        removeFromWatched(currentMovie.id);
      } else {
        addToWatched(currentMovie);
      }
      // Обновляем состояние текущего фильма для обновления UI
      setCurrentMovie({ ...currentMovie });
    }
  };

  // Добавим эффект для обновления состояния кнопок
  useEffect(() => {
    if (currentMovie) {
      // Обновляем состояние при изменении updateTrigger
      setCurrentMovie({ ...currentMovie });
    }
  }, [updateTrigger]);

  const handlePersonClick = (personId: number) => {
    setIsPersonDetailsOpen(true);
    setSelectedPerson(personId);
  };

  const handlePersonMovieSelect = (movieId: number) => {
    setIsPersonDetailsOpen(false);
    setSelectedPerson(null);
    if (onMovieSelect) {
      onMovieSelect(movieId);
    } else {
      navigate(`/movie/${movieId}`);
    }
  };

  useEffect(() => {
    if (rankData) {
      console.log("Rank Data:", {
        rank: rankData.rank,
      });
    }
  }, [rankData]);

  // Добавляем функцию для получения типа релиза
  const getReleaseType = (type: number) => {
    const types: { [key: number]: string } = {
      1: "Премьера",
      2: "Театральный релиз",
      3: "Цифровой релиз",
      4: "Физический релиз",
      5: "ТВ релиз",
    };
    return types[type] || "Релиз";
  };

  if (!currentMovie && !movieId) return null;

  // Функция форматирования времени
  const formatRuntime = (minutes: number | undefined) => {
    console.log("Runtime input:", minutes);
    if (typeof minutes !== "number" || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  // Обновляем функцию форматирования количества голосов
  const formatVoteCount = (count: number) => {
    if (!count) return "-";
    if (count >= 1000) {
      const thousands = Math.floor(count / 1000);
      return `${thousands}K`;
    }
    return count.toString();
  };

  // Добавим функцию для определения цвета рейтинга
  const getRatingColor = (rating: number | undefined) => {
    if (!rating) return "#888"; // серый для undefined
    if (rating >= 7) return "#57de94";
    if (rating >= 5.6) return "#888";
    return "#FF5252";
  };

  // Обновляем функцию calculateMetrics
  const calculateMetrics = (details: any) => {
    // Собираем только метрики с существующими значениями
    const metrics = [];

    // Рейтинг
    if (hasValue(details?.vote_average)) {
      metrics.push({
        metric: "Рейтинг",
        value: details.vote_average / 10,
        fullMark: 1,
      });
    }

    // Длительность
    if (hasValue(details?.runtime)) {
      metrics.push({
        metric: "Длительность",
        value: Math.min(details.runtime / 180, 1),
        fullMark: 1,
      });
    }

    // Популярность
    if (hasValue(details?.vote_count) && details?.release_date) {
      const popularityScore = calculatePopularityScore(
        details.release_date,
        details.vote_count
      );
      if (popularityScore > 0) {
        metrics.push({
          metric: "Популярность",
          value: popularityScore,
          fullMark: 1,
        });
      }
    }

    // Бюджет
    if (hasValue(details?.budget)) {
      metrics.push({
        metric: "Бюджет",
        value: Math.min(details.budget / 200000000, 1),
        fullMark: 1,
      });
    }

    // Тренд
    if (hasValue(details?.popularity)) {
      metrics.push({
        metric: "Тренд",
        value: Math.min(details.popularity / 1000, 1),
        fullMark: 1,
      });
    }

    // Окупаемость
    if (hasValue(details?.budget) && hasValue(details?.revenue)) {
      const roi = calculateROI(details.budget, details.revenue);
      if (roi > 0) {
        metrics.push({
          metric: "Окупаемость",
          value: roi,
          fullMark: 1,
        });
      }
    }

    return metrics;
  };

  // В модальном окне также добавим проверки
  <Dialog
    open={showMetricsDetails}
    onClose={() => setShowMetricsDetails(false)}
    // ...остальные пропсы...
  >
    <Box sx={{ p: 3 }}>
      {/* ... заголовок ... */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {(
          [
            {
              section: "Оценки",
              metrics: [
                hasValue(details?.vote_average) && {
                  label: "Рейтинг",
                  value: `${details.vote_average.toFixed(1)} из 10`,
                  description: "Средняя оценка фильма по мнению пользователей",
                },
                hasValue(details?.vote_count) && {
                  label: "Популярность",
                  value: `${details.vote_count.toLocaleString()} голосов`,
                  description: "Количество голосов",
                },
                hasValue(details?.popularity) && {
                  label: "Тренд",
                  value: `${details.popularity.toFixed(1)} из 1000`,
                  description: "Текущий показатель популярности на TMDB",
                },
              ].filter(Boolean),
            },
            {
              section: "Характеристики",
              metrics: [
                hasValue(details?.runtime) && {
                  label: "Длительность",
                  value: `${details.runtime} мин`,
                  description: "Продолжительность фильма",
                },
              ].filter(Boolean),
            },
            {
              section: "Финансы",
              metrics: [
                hasValue(details?.budget) && {
                  label: "Бюджет",
                  value: `$${(details.budget / 1000000).toFixed(1)}M`,
                  description: "Бюджет производства фильма",
                },
                hasValue(details?.revenue) && {
                  label: "Доход",
                  value: `$${(details.revenue / 1000000000).toFixed(1)}B`,
                  description: "Общие кассовые сборы фильма",
                },
                hasValue(details?.budget) &&
                  hasValue(details?.revenue) && {
                    label: "Окупаемость",
                    value: `${(
                      ((details.revenue - details.budget) / details.budget) *
                      100
                    ).toFixed(0)}%`,
                    description:
                      "Процент возврата инвестиций относительно бюджета",
                  },
              ].filter(Boolean),
            },
          ] as MetricSection[]
        )
          .filter((section) => section.metrics.length > 0)
          .map((section) => (
            <Box key={section.section}>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  mb: 2,
                }}
              >
                {section.section}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {section.metrics.map(
                  (metric: Metric | false) =>
                    metric && (
                      <Box key={metric.label}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                            }}
                          >
                            {metric.label}
                          </Typography>
                          <Typography
                            sx={{
                              color: "#0686ee",
                              fontWeight: 500,
                            }}
                          >
                            {metric.value}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.5)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {metric.description}
                        </Typography>
                      </Box>
                    )
                )}
              </Box>
            </Box>
          ))}
      </Box>
    </Box>
  </Dialog>;

  // Добавим useEffect для загрузки backdrops
  useEffect(() => {
    const loadBackdrops = async () => {
      if (currentMovie?.id) {
        const images = await getMovieImages(currentMovie.id);
        if (images.backdrops && images.backdrops.length > 0) {
          // Ограничиваем количество backdrops до 10
          const limitedBackdrops = images.backdrops.slice(0, 10);
          setAvailableBackdrops(limitedBackdrops);

          // Проверяем сохраненный backdrop
          const savedBackdropPath = getSavedBackdrop(currentMovie.id);
          if (savedBackdropPath) {
            const savedIndex = limitedBackdrops.findIndex(
              (backdrop: MovieImage) => backdrop.file_path === savedBackdropPath
            );
            if (savedIndex !== -1) {
              setCurrentBackdropIndex(savedIndex);
            }
          }
        }
      }
    };
    loadBackdrops();
  }, [currentMovie?.id, user]);

  // Модифицируем функцию смены backdrop
  const handleChangeBackdrop = () => {
    if (availableBackdrops.length > 1) {
      // Если достигли последнего backdrop, возвращаемся к первому
      const newIndex =
        currentBackdropIndex === availableBackdrops.length - 1
          ? 0
          : currentBackdropIndex + 1;

      setCurrentBackdropIndex(newIndex);

      // Сохраняем выбранный backdrop
      if (currentMovie?.id && user) {
        saveBackdropToLocalStorage(
          currentMovie.id,
          availableBackdrops[newIndex].file_path
        );
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: {
          enter: 400,
          exit: 400,
        },
      }}
      PaperProps={{
        sx: {
          bgcolor: "#141414",
          height: "100vh",
          width: "100vw",
          margin: 0,
          maxHeight: "100vh",
          maxWidth: "100vw",
          borderRadius: 0,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: 0,
          overflow: "hidden",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: isPage ? 1 : 0,
          animation: isPage ? "none" : "fadeIn 0.4s ease-in-out forwards",
          "@keyframes fadeIn": {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            animation: open
              ? "lightUp 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards"
              : "none",
            "@keyframes lightUp": {
              "0%": {
                backgroundColor: "rgba(0, 0, 0, 0.85)",
              },
              "100%": {
                backgroundColor: "rgba(20, 20, 20, 0.7)",
              },
            },
          },
        },
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#141414",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={60} sx={{ color: "white" }} />
            <Typography variant="h6" sx={{ color: "white" }}>
              Загрузка фильма...
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        className="dialog-content"
        sx={{
          height: "100vh",
          width: "100vw",
          position: "relative",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          margin: 0,
          padding: 0,
          opacity: !isLoading && isVisible ? 1 : 0,
          transition: "opacity 1s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1,
        }}
      >
        <Backdrop
          open={isLoading}
          sx={{
            position: "absolute",
            zIndex: 9999,
            backgroundColor: "transparent",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            opacity: 0,
            animation: "fadeInBackdrop 0.4s ease-in-out forwards",
            "@keyframes fadeInBackdrop": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        />

        {!showPlayer && (
          <IconButton
            onClick={handleClose}
            sx={{
              position: "fixed",
              top: "env(safe-area-inset-top, 16px)",
              right: "env(safe-area-inset-right, 16px)",
              zIndex: 1301,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
              mt: "20px",
              mr: "20px",
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        <Box
          sx={{
            position: "relative",
            width: "100%",
            minHeight: "100%",
            bgcolor: "#141414",
          }}
        >
          {/* Оверлей с затемнением */}
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.7)",
              zIndex: 1300,
              opacity: isUpdating ? 1 : 0,
              visibility: isUpdating ? "visible" : "hidden",
              transition:
                "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
            }}
          />
          {showPlayer ? (
            <KinoboxPlayer
              tmdbId={currentMovie?.id || 0}
              title={currentMovie?.title}
              onMediaUrl={handleMediaUrl}
              onClose={() => setShowPlayer(false)}
            />
          ) : (
            <Box>
              <Box
                className="backdrop-image"
                sx={{
                  position: "relative",
                  width: "100%",
                  height: {
                    xs: "calc(100vw * 0.95 * 0.95)",
                    sm: "105vh",
                  },
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 0,
                  mb: { xs: 2, sm: 0 },
                }}
              >
                {showTrailer && trailerUrl ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: "100%",
                      height: "100%",
                      transform: "translate(-50%, -50%)",
                      opacity: isBackdropLoaded ? 1 : 0,
                      transition: "opacity 0.3s ease-out",
                    }}
                  >
                    <ReactPlayer
                      url={trailerUrl}
                      width="100%"
                      height="100%"
                      playing={true}
                      muted={true}
                      loop={false}
                      playsinline={true}
                      config={{
                        youtube: {
                          playerVars: {
                            controls: 0,
                            modestbranding: 1,
                            showinfo: 0,
                            rel: 0,
                            iv_load_policy: 3,
                            playsinline: 1,
                            origin: window.location.origin,
                            start: 0,
                            autoplay: 1,
                            mute: 1,
                            enablejsapi: 1,
                            ...(isMobile && {
                              playsinline: 1,
                              fs: 0,
                              controls: 0,
                              disablekb: 1,
                            }),
                          },
                          embedOptions: {
                            autoplay: 1,
                            controls: 0,
                            muted: 1,
                            playsinline: 1,
                          },
                        },
                      }}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%) scale(1.5)",
                        pointerEvents: "none",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        console.error("Player Error:", e);
                        setShowTrailer(false);
                      }}
                      onReady={(player) => {
                        setIsBackdropLoaded(true);
                        if (isMobile) {
                          player.getInternalPlayer()?.playVideo();
                        }
                      }}
                      onEnded={() => {
                        setShowTrailer(false);
                        setTrailerUrl(null);
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    component="img"
                    src={imageUrl(
                      availableBackdrops[currentBackdropIndex]?.file_path ||
                        currentMovie?.backdrop_path ||
                        currentMovie?.poster_path ||
                        "",
                      isMobile ? "w1280" : "original"
                    )}
                    alt={currentMovie?.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center center",
                      opacity: isBackdropLoaded ? 1 : 0,
                      transition: "opacity 0.3s ease-out",
                      transform: "scale(1)",
                      backgroundColor: "#000",
                      imageRendering: "high-quality",
                      WebkitBackfaceVisibility: "hidden",
                      MozBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                      borderRadius: 0,
                    }}
                    onLoad={() => setIsBackdropLoaded(true)}
                  />
                )}

                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    width: "100%",
                    height: "75%",
                    background: `linear-gradient(
                      0deg,
                      rgb(20 20 20) 0%,
                      rgba(20, 20, 20, 0.9) 25%,
                      rgba(20, 20, 20, 0.7) 50%,
                      rgba(20, 20, 20, 0) 100%
                    )`,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "35%",
                    height: "100%",
                    background: `linear-gradient(
                      90deg,
                      rgb(20 20 20) 0%,
                      rgba(20, 20, 20, 0.8) 30%,
                      rgba(20, 20, 20, 0.4) 60%,
                      rgba(20, 20, 20, 0) 100%
                    )`,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: "35%",
                    height: "100%",
                    background: `linear-gradient(
                      -90deg,
                      rgb(20 20 20) 0%,
                      rgba(20, 20, 20, 0.8) 30%,
                      rgba(20, 20, 20, 0.4) 60%,
                      rgba(20, 20, 20, 0) 100%
                    )`,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
              </Box>

              <Box
                sx={{
                  position: "relative",
                  mt: "-107px",
                  px: 2,
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(40px)",
                  transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "1200px",
                    width: "100%",
                  }}
                >
                  {!isLogoLoading &&
                    (hasLogo && logo ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: { xs: "center", sm: "flex-start" },
                          width: "100%",
                          minHeight: "80px",
                        }}
                      >
                        <Box
                          component="img"
                          src={imageUrl(logo, "w500")}
                          alt={currentMovie?.title}
                          sx={{
                            maxHeight: "80px",
                            maxWidth: "70%",
                            objectFit: "contain",
                            mb: 2,
                            filter: "brightness(1.2)",
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: "bold",
                          mb: 2,
                          fontSize: { xs: "1.5rem", sm: "2rem" },
                          textAlign: { xs: "center", sm: "left" },
                        }}
                      >
                        {currentMovie?.title}
                      </Typography>
                    ))}

                  {/* Добавляем слоган */}
                  {details?.tagline && (
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "1rem",
                        fontStyle: "italic",
                        mb: 2,
                        textAlign: { xs: "center", sm: "left" },
                      }}
                    >
                      {details.tagline}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      mb: 2,
                      alignItems: "center",
                      justifyContent: { xs: "center", sm: "flex-start" },
                      width: "100%",
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    {/* Рейтинг */}
                    {currentMovie &&
                      currentMovie.vote_average > 0 &&
                      !isNaN(currentMovie.vote_average) && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "1rem",
                              color: getRatingColor(currentMovie.vote_average),
                              filter:
                                currentMovie.vote_average >= 7
                                  ? "drop-shadow(2px 4px 6px #59ffa4)"
                                  : "none",
                            }}
                          >
                            {currentMovie.vote_average.toFixed(1)}
                          </Typography>
                          {currentMovie?.vote_count &&
                            currentMovie.vote_count > 0 && (
                              <>
                                <Typography
                                  sx={{ color: "#888", fontSize: "0.9rem" }}
                                >
                                  •
                                </Typography>
                                {currentMovie.vote_count >= 1000 ? (
                                  <Tooltip
                                    open={
                                      isMobileView ? showVoteTooltip : undefined
                                    }
                                    onClose={() => setShowVoteTooltip(false)}
                                    title={`${currentMovie.vote_count.toLocaleString(
                                      "ru-RU"
                                    )} оценок`}
                                    arrow
                                    placement="top"
                                    enterDelay={200}
                                    leaveDelay={200}
                                  >
                                    <Typography
                                      onClick={() => {
                                        if (isMobileView) {
                                          setShowVoteTooltip(!showVoteTooltip);
                                        }
                                      }}
                                      sx={{
                                        color: "#888",
                                        fontSize: "1rem",
                                        borderBottom:
                                          "1px dotted rgba(255,255,255,0.3)",
                                        cursor: "help",
                                        "&:hover": {
                                          borderBottom:
                                            "1px dotted rgba(255,255,255,0.5)",
                                        },
                                        userSelect: "none", // Предотвращаем выделение текста при тапе
                                        WebkitTapHighlightColor: "transparent", // Убираем подсветку при тапе на iOS
                                      }}
                                    >
                                      {formatVoteCount(currentMovie.vote_count)}{" "}
                                      оценок
                                    </Typography>
                                  </Tooltip>
                                ) : (
                                  <Typography
                                    sx={{ color: "#888", fontSize: "1rem" }}
                                  >
                                    {currentMovie.vote_count} оценок
                                  </Typography>
                                )}
                              </>
                            )}
                        </Box>
                      )}

                    {/* Страны производства */}
                    {details?.production_countries && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {details.production_countries
                          .slice(0, 2)
                          .map((country: ProductionCountry, index: number) => (
                            <Box
                              key={country.iso_3166_1}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {country.iso_3166_1 && (
                                <Box
                                  component="span"
                                  sx={{
                                    width: "16px",
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {(() => {
                                    const CountryFlag =
                                      Flags[
                                        country.iso_3166_1 as keyof typeof Flags
                                      ];
                                    return CountryFlag ? <CountryFlag /> : null;
                                  })()}
                                </Box>
                              )}
                              <Typography
                                sx={{ color: "#888", fontSize: "1rem" }}
                              >
                                {translateCountry(country.name)}
                              </Typography>
                              {index <
                                Math.min(
                                  details.production_countries.length - 1,
                                  1
                                ) && (
                                <Typography
                                  sx={{ color: "#888", fontSize: "1rem" }}
                                >
                                  •
                                </Typography>
                              )}
                            </Box>
                          ))}
                      </Box>
                    )}

                    {/* Год */}
                    {isMobileView ? (
                      <Tooltip
                        open={showMobileTooltip}
                        onClose={() => setShowMobileTooltip(false)}
                        title={
                          currentMovie?.release_date
                            ? formatReleaseDate(currentMovie.release_date)
                            : ""
                        }
                        arrow
                        placement="top"
                        PopperProps={{
                          disablePortal: true,
                        }}
                      >
                        <Typography
                          onClick={() =>
                            setShowMobileTooltip(!showMobileTooltip)
                          }
                          sx={{
                            color: "#888",
                            fontSize: "1rem",
                            cursor: "pointer",
                            borderBottom: "1px dotted rgba(255,255,255,0.3)",
                            display: "inline-block",
                            "&:active": {
                              borderBottom: "1px dotted rgba(255,255,255,0.5)",
                            },
                          }}
                        >
                          {new Date(
                            currentMovie?.release_date || ""
                          ).getFullYear()}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title={
                          currentMovie?.release_date
                            ? formatReleaseDate(currentMovie.release_date)
                            : ""
                        }
                        arrow
                        placement="top"
                      >
                        <Typography
                          sx={{
                            color: "#888",
                            fontSize: "1rem",
                            cursor: "help",
                            borderBottom: "1px dotted rgba(255,255,255,0.3)",
                            display: "inline-block",
                            "&:hover": {
                              borderBottom: "1px dotted rgba(255,255,255,0.5)",
                            },
                          }}
                        >
                          {new Date(
                            currentMovie?.release_date || ""
                          ).getFullYear()}
                        </Typography>
                      </Tooltip>
                    )}

                    {/* Продолжительность */}
                    {typeof details?.runtime === "number" &&
                      details.runtime > 0 && (
                        <Typography
                          sx={{
                            color: "#888",
                            fontSize: "1rem",
                            flexShrink: 0,
                          }}
                        >
                          {formatRuntime(details.runtime)}
                        </Typography>
                      )}

                    {/* Жанры */}
                    {details?.genres && (
                      <Typography
                        sx={{
                          color: "#888",
                          fontSize: "1rem",
                          textAlign: { xs: "center", sm: "left" },
                        }}
                      >
                        {details.genres
                          .slice(0, 2)
                          .map((genre: Genre) => genre.name)
                          .join(", ")}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {certification && (
                        <Chip
                          label={AGE_RATINGS[certification] || certification}
                          sx={{
                            backgroundColor: "transparent",
                            color: "#888",
                            fontSize: "0.9rem",
                            height: "20px",
                            minWidth: "34px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "4px",
                            "& .MuiChip-label": {
                              padding: "0 6px",
                              fontWeight: "500",
                              lineHeight: 1,
                            },
                            "&:hover": {
                              backgroundColor: "transparent",
                            },
                          }}
                        />
                      )}
                      {rankData?.rank !== null &&
                        rankData?.rank !== undefined &&
                        rankData?.rank <= 5000 && (
                          <Typography
                            sx={{
                              color: "#888",
                              fontSize: "0.9rem",
                              display: "flex",
                              alignItems: "center",
                              "&::before": {
                                content: '"•"',
                                marginRight: "8px",
                              },
                            }}
                          >
                            {rankData?.rank <= 1000 && (
                              <Box
                                component="img"
                                src="https://yastatic.net/s3/kinopoisk-frontend/hd-www/release/_next/static/media/lightning-3x.8986661f.png"
                                alt="top"
                                sx={{
                                  width: "16px",
                                  height: "16px",
                                  marginRight: "4px",
                                  opacity: 0.8,
                                }}
                              />
                            )}
                            {(
                              (rankData?.rank === 0 ? 1 : rankData?.rank) ?? 0
                            ).toLocaleString("ru-RU")}
                          </Typography>
                        )}
                    </Box>
                  </Box>

                  {/* Кнопки управления */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "8px",
                      mb: 2,
                      mt: "21px",
                      alignItems: "center",
                      justifyContent: { xs: "center", sm: "flex-start" },
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                    }}
                  >
                    <Button
                      onClick={() => setShowPlayer(true)}
                      sx={{
                        color: "white",
                        background:
                          "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                        boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                        width: "40px",
                        height: "40px",
                        minWidth: "40px",
                        borderRadius: "50%",
                        padding: 0,
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #1976D2 30%, #00B4E5 90%)",
                          boxShadow: "0 4px 8px 3px rgba(33, 203, 243, .4)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 24 }} />
                    </Button>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        onClick={handleFavoriteClick}
                        sx={{
                          color: "white",
                          background: isFavorite(currentMovie?.id || 0)
                            ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                            : "rgb(65 67 65 / 68%)",
                          boxShadow: isFavorite(currentMovie?.id || 0)
                            ? "0 3px 5px 2px rgba(33, 203, 243, .3)"
                            : "none",
                          "&:hover": {
                            background: isFavorite(currentMovie?.id || 0)
                              ? "linear-gradient(45deg, #1976D2 30%, #00B4E5 90%)"
                              : "rgb(65 67 65 / 88%)",
                          },
                        }}
                      >
                        {isFavorite(currentMovie?.id || 0) ? (
                          <BookmarkIcon />
                        ) : (
                          <BookmarkBorderIcon />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={handleShare}
                        sx={{
                          color: "white",
                          bgcolor: "rgb(65 67 65 / 68%)",
                          "&:hover": {
                            bgcolor: "rgb(65 67 65 / 88%)",
                          },
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                      <IconButton
                        onClick={handleWatchedClick}
                        sx={{
                          color: "white",
                          background: isWatched(currentMovie?.id || 0)
                            ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                            : "rgb(65 67 65 / 68%)",
                          boxShadow: isWatched(currentMovie?.id || 0)
                            ? "0 3px 5px 2px rgba(33, 203, 243, .3)"
                            : "none",
                          "&:hover": {
                            background: isWatched(currentMovie?.id || 0)
                              ? "linear-gradient(45deg, #1976D2 30%, #00B4E5 90%)"
                              : "rgb(65 67 65 / 88%)",
                          },
                        }}
                      >
                        {isWatched(currentMovie?.id || 0) ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                      <IconButton
                        sx={{
                          color: "white",
                          bgcolor: "rgb(65 67 65 / 68%)",
                          "&:hover": {
                            bgcolor: "rgb(65 67 65 / 88%)",
                          },
                        }}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider
                    sx={{
                      my: 3,
                      borderColor: "rgba(255, 255, 255, 0.04)",
                      width: "85%",
                      mx: "auto",
                      display: { xs: "block", sm: "none" },
                    }}
                  />
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: { xs: "1rem", sm: "1rem" },
                      lineHeight: 1.6,
                      textAlign: "left",
                      opacity: 0.7,
                      mb: 4,
                    }}
                  >
                    {isExpandedDescription
                      ? currentMovie?.overview
                      : truncateText(currentMovie?.overview || "", 200)}
                    {(currentMovie?.overview?.length || 0) > 200 && (
                      <Button
                        onClick={() =>
                          setIsExpandedDescription(!isExpandedDescription)
                        }
                        sx={{
                          color: "#21CBF3",
                          textTransform: "none",
                          minWidth: "auto",
                          padding: "0 0 0 8px",
                          fontSize: "inherit",
                          fontWeight: "normal",
                          "&:hover": {
                            background: "transparent",
                            color: "#2196F3",
                          },
                          textDecoration: "none",
                          verticalAlign: "baseline",
                        }}
                      >
                        {isExpandedDescription ? " Свернуть" : " Подробнее"}
                      </Button>
                    )}
                  </Typography>

                  {/* Секция с метриками фильма */}
                  <Box sx={{ mt: 3, mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#6b6868",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          textAlign: "left",
                        }}
                      >
                        Метрики фильма
                      </Typography>
                      <IconButton
                        onClick={() => setShowMetricsDetails(true)}
                        sx={{
                          color: "rgba(255, 255, 255, 0.4)",
                          "&:hover": {
                            color: "rgba(255, 255, 255, 0.7)",
                          },
                        }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: "1.2rem" }} />
                      </IconButton>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        height: 300,
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "12px",
                        p: 2,
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          data={calculateMetrics(details)}
                        >
                          <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                          <PolarAngleAxis
                            dataKey="metric"
                            tick={{
                              fill: "rgba(255, 255, 255, 0.6)",
                              fontSize: 12,
                            }}
                          />
                          <Radar
                            name="Метрики"
                            dataKey="value"
                            stroke="#0686ee"
                            fill="#0686ee"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>

                  {/* Даты релиза в виде слайдера */}
                  {releaseData.releases.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#6b6868",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          mb: 2,
                          textAlign: "left",
                        }}
                      >
                        Даты релиза
                      </Typography>
                      <Box sx={{ position: "relative" }}>
                        <Swiper
                          modules={[FreeMode]}
                          slidesPerView="auto"
                          spaceBetween={8}
                          freeMode
                          style={{ padding: "4px" }}
                        >
                          {releaseData.releases.map((release, index) => {
                            const Flag =
                              (Flags as any)[release.country] || null;
                            return (
                              <SwiperSlide
                                key={index}
                                style={{
                                  width: "auto",
                                  marginRight: "4px",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    minWidth: { xs: "200px", sm: "250px" },
                                  }}
                                >
                                  {Flag && (
                                    <Flag
                                      title={release.country}
                                      style={{
                                        width: "24px",
                                        height: "18px",
                                        borderRadius: "2px",
                                      }}
                                    />
                                  )}
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontSize: "0.9rem",
                                        color: "white",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {translateCountry(release.country)}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "0.8rem",
                                        color: "#888",
                                      }}
                                    >
                                      {new Date(
                                        release.date
                                      ).toLocaleDateString("ru-RU", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                      {" • "}
                                      {getReleaseType(release.type)}
                                      {release.certification &&
                                        ` • ${release.certification}`}
                                    </Typography>
                                  </Box>
                                </Box>
                              </SwiperSlide>
                            );
                          })}
                        </Swiper>
                      </Box>
                    </Box>
                  )}

                  {/* Студии - идут после дат релиза */}
                  {details?.production_companies &&
                    details.production_companies.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#6b6868",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            mb: 2,
                            textAlign: "left",
                          }}
                        >
                          Студии
                        </Typography>
                        <Box sx={{ position: "relative" }}>
                          <Swiper
                            modules={[FreeMode]}
                            slidesPerView="auto"
                            spaceBetween={8}
                            freeMode
                            style={{ padding: "4px" }}
                          >
                            {details.production_companies.map((studio: any) => (
                              <SwiperSlide
                                key={studio.id}
                                style={{
                                  width: "auto",
                                  marginRight: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  navigate(
                                    `/studio/${encodeURIComponent(studio.name)}`
                                  )
                                }
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    transition: "background-color 0.2s",
                                    "&:hover": {
                                      backgroundColor: "rgba(255,255,255,0.1)",
                                    },
                                    minWidth: { xs: "200px", sm: "250px" },
                                  }}
                                >
                                  {studio.logo_path ? (
                                    <Box
                                      component="img"
                                      src={imageUrl(studio.logo_path, "w92")}
                                      alt={studio.name}
                                      sx={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "contain",
                                        filter: "brightness(0) invert(1)",
                                        flexShrink: 0,
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor:
                                          "rgba(255,255,255,0.1)",
                                        borderRadius: "4px",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          color: "rgba(255,255,255,0.5)",
                                          fontSize: "1.2rem",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {studio.name.charAt(0)}
                                      </Typography>
                                    </Box>
                                  )}
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      sx={{
                                        color: "white",
                                        fontSize: "0.9rem",
                                        fontWeight: 500,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                      title={studio.name}
                                    >
                                      {studio.name}
                                    </Typography>
                                    {studio.origin_country && (
                                      <Typography
                                        sx={{
                                          color: "rgba(255,255,255,0.5)",
                                          fontSize: "0.8rem",
                                        }}
                                      >
                                        {studio.origin_country}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </Box>
                      </Box>
                    )}

                  {/* Создатели - оставляем после студий */}
                  {cast.filter((person: CrewMember) => person.isCreator)
                    .length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#6b6868",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          mb: 2,
                          textAlign: "left",
                        }}
                      >
                        Создатели
                      </Typography>
                      <Box sx={{ position: "relative" }}>
                        <Swiper
                          modules={[FreeMode]}
                          slidesPerView="auto"
                          spaceBetween={4}
                          freeMode
                          style={{
                            padding: "4px",
                            width: "100%",
                          }}
                        >
                          {cast
                            .filter((person: CrewMember) => person.isCreator)
                            .map((person) => (
                              <SwiperSlide
                                key={person.id}
                                style={{
                                  width: "auto",
                                  marginRight: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handlePersonClick(person.id)}
                              >
                                <Box
                                  sx={{
                                    aspectRatio: "2/3",
                                    width: {
                                      xs: "65px",
                                      sm: "126px",
                                    },
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    position: "relative",
                                    mb: 1,
                                    transition: "transform 0.2s",
                                    "&:hover": {
                                      transform: "scale(1.05)",
                                    },
                                  }}
                                >
                                  {person.profile_path ? (
                                    <Box
                                      component="img"
                                      loading="lazy"
                                      src={imageUrl(
                                        person.profile_path,
                                        "w342"
                                      )}
                                      alt={person.name}
                                      sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        imageRendering: [
                                          "crisp-edges",
                                          "-webkit-optimize-contrast",
                                        ],
                                        backfaceVisibility: "hidden",
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor:
                                          "rgba(255,255,255,0.05)",
                                        borderRadius: "8px",
                                        gap: 1,
                                      }}
                                    >
                                      <PersonIcon
                                        sx={{
                                          fontSize: { xs: 24, sm: 32 },
                                          color: "rgba(255,255,255,0.3)",
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "rgba(255,255,255,0.5)",
                                          fontSize: {
                                            xs: "0.6rem",
                                            sm: "0.7rem",
                                          },
                                          textAlign: "center",
                                          px: 1,
                                        }}
                                      >
                                        Нет фото
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                <Box
                                  sx={{
                                    width: {
                                      xs: "65px",
                                      sm: "126px",
                                    },
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      color: "white",
                                      fontSize: {
                                        xs: "0.8rem",
                                        sm: "0.9rem",
                                      },
                                      fontWeight: 500,
                                      mb: 0.5,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      width: "100%",
                                    }}
                                  >
                                    {person.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: "#888",
                                      fontSize: {
                                        xs: "0.75rem",
                                        sm: "0.8rem",
                                      },
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      width: "100%",
                                    }}
                                  >
                                    {(() => {
                                      const isDirector =
                                        person.jobs?.includes("Director");
                                      const isWriter =
                                        person.jobs?.includes("Screenplay") ||
                                        person.jobs?.includes("Writer");
                                      const isProducer =
                                        person.jobs?.includes("Producer");

                                      const roles = [];
                                      if (isDirector) roles.push("Режиссер");
                                      if (isWriter) roles.push("Сценарист");
                                      if (isProducer) roles.push("Продюсер");

                                      return roles.join(", ");
                                    })()}
                                  </Typography>
                                </Box>
                              </SwiperSlide>
                            ))}
                        </Swiper>
                      </Box>
                    </Box>
                  )}

                  {/* В главных ролях */}
                  {cast.filter((person: any) => !person.isCreator).length >
                    0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#6b6868",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          mb: 2,
                          textAlign: "left",
                        }}
                      >
                        В главных ролях
                      </Typography>
                      <Box sx={{ position: "relative" }}>
                        <Swiper
                          modules={[FreeMode]}
                          slidesPerView="auto"
                          spaceBetween={4}
                          freeMode
                          style={{ padding: "4px", width: "100%" }}
                        >
                          {cast
                            .filter((person: any) => !person.isCreator)
                            .map((person) => (
                              <SwiperSlide
                                key={person.id}
                                style={{
                                  width: "auto",
                                  marginRight: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handlePersonClick(person.id)}
                              >
                                <Box
                                  sx={{
                                    width: { xs: "120px", sm: "160px" },
                                    position: "relative",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      paddingTop: "150%",
                                      position: "relative",
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                      backgroundColor: "rgba(255,255,255,0.05)",
                                      mb: 1,
                                    }}
                                  >
                                    {person.profile_path ? (
                                      <Box
                                        component="img"
                                        loading="lazy"
                                        src={imageUrl(
                                          person.profile_path,
                                          "w342"
                                        )}
                                        alt={person.name}
                                        sx={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          imageRendering: [
                                            "crisp-edges",
                                            "-webkit-optimize-contrast",
                                          ],
                                          backfaceVisibility: "hidden",
                                        }}
                                      />
                                    ) : (
                                      <Box
                                        sx={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "100%",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor:
                                            "rgba(255,255,255,0.05)",
                                          borderRadius: "8px",
                                          gap: 1,
                                        }}
                                      >
                                        <PersonIcon
                                          sx={{
                                            fontSize: { xs: 24, sm: 32 },
                                            color: "rgba(255,255,255,0.3)",
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "rgba(255,255,255,0.5)",
                                            fontSize: {
                                              xs: "0.6rem",
                                              sm: "0.7rem",
                                            },
                                            textAlign: "center",
                                            px: 1,
                                          }}
                                        >
                                          Нет фото
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                  <Typography
                                    sx={{
                                      color: "white",
                                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                      fontWeight: 500,
                                      mb: 0.5,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      width: "100%",
                                    }}
                                  >
                                    {person.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: "#888",
                                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      width: "100%",
                                    }}
                                  >
                                    {person.character}
                                  </Typography>
                                </Box>
                              </SwiperSlide>
                            ))}
                        </Swiper>
                      </Box>
                    </Box>
                  )}

                  {/* Коллекция */}
                  {details?.belongs_to_collection && (
                    <>
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#6b6868",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            mb: 2,
                            textAlign: "left",
                          }}
                        >
                          Коллекция
                        </Typography>
                        <Box
                          onClick={handleCollectionClick}
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: { xs: "150px", sm: "200px", md: "250px" },
                            borderRadius: 2,
                            overflow: "hidden",
                            cursor: "pointer",
                            "&:hover": {
                              "& .collection-overlay": {
                                background: "rgba(0,0,0,0.5)",
                              },
                              "& .collection-title": {
                                transform: "scale(1.05)",
                              },
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={imageUrl(
                              details.belongs_to_collection.backdrop_path ||
                                details.belongs_to_collection.poster_path,
                              "w1280"
                            )}
                            alt={details.belongs_to_collection.name}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Box
                            className="collection-overlay"
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: "rgba(0,0,0,0.7)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "background 0.3s ease",
                            }}
                          >
                            <Typography
                              className="collection-title"
                              sx={{
                                color: "white",
                                textAlign: "center",
                                fontSize: {
                                  xs: "1.2rem",
                                  sm: "1.5rem",
                                  md: "1.8rem",
                                },
                                fontWeight: "bold",
                                px: 3,
                                transition: "transform 0.3s ease",
                              }}
                            >
                              {details.belongs_to_collection.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Модальное окно с фильмами коллекции */}
                      <Dialog
                        open={showCollection}
                        onClose={() => setShowCollection(false)}
                        maxWidth="md"
                        fullWidth
                        TransitionProps={{
                          timeout: 500,
                          enter: true,
                          exit: true,
                        }}
                        PaperProps={{
                          sx: {
                            bgcolor: "#141414",
                            borderRadius: 2,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "#141414",
                            color: "white",
                            p: 3,
                            position: "relative",
                          }}
                        >
                          {/* Кнопка закрытия */}
                          <IconButton
                            onClick={() => setShowCollection(false)}
                            sx={{
                              position: "absolute",
                              right: 8,
                              top: 8,
                              color: "white",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.1)",
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>

                          <Typography variant="h5" sx={{ mb: 3, pr: 4 }}>
                            {details.belongs_to_collection.name}
                          </Typography>

                          {/* Остальной контент */}
                          <Grid
                            container
                            spacing={2}
                            sx={{
                              opacity: 0,
                              animation: "fadeIn 0.6s ease-out forwards",
                              "@keyframes fadeIn": {
                                to: { opacity: 1 },
                              },
                            }}
                          >
                            {collectionMovies.map((movie) => (
                              <Grid
                                item
                                xs={6}
                                sm={4}
                                md={3}
                                key={movie.id}
                                onClick={() =>
                                  handleCollectionMovieClick(movie.id)
                                }
                                sx={{
                                  cursor: "pointer",
                                  transition: "transform 0.2s",
                                  "&:hover": {
                                    transform: "scale(1.02)",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    position: "relative",
                                    paddingTop: "150%",
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    mb: 1,
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={imageUrl(movie.poster_path, "w342")}
                                    alt={movie.title}
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: "0.9rem",
                                    fontWeight: 500,
                                    mb: 0.5,
                                  }}
                                >
                                  {movie.title}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    color: "#888",
                                  }}
                                >
                                  {new Date(
                                    movie.release_date
                                  ).toLocaleDateString("ru-RU", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </Dialog>
                    </>
                  )}

                  {recommendations.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#6b6868",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          mb: 2,
                          textAlign: "left",
                        }}
                      >
                        Рекомендации
                      </Typography>
                      <Box sx={{ position: "relative" }}>
                        <Swiper
                          modules={[FreeMode]}
                          slidesPerView="auto"
                          spaceBetween={8}
                          freeMode
                          style={{ padding: "4px" }}
                        >
                          {recommendations.map((movie) => (
                            <SwiperSlide
                              key={movie.id}
                              style={{
                                width: "auto",
                                height: "auto",
                              }}
                            >
                              <Box
                                onClick={() => handleRecommendationClick(movie)}
                                sx={{
                                  cursor: "pointer",
                                  transition: "transform 0.2s",
                                  "&:hover": {
                                    transform: "scale(1.02)",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: {
                                      xs: "120px",
                                      sm: "200px",
                                    },
                                    aspectRatio: "2/3",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    mb: 1,
                                    bgcolor: "rgba(255,255,255,0.1)",
                                  }}
                                >
                                  {movie.poster_path ? (
                                    <Box
                                      component="img"
                                      src={imageUrl(movie.poster_path, "w342")}
                                      alt={movie.title}
                                      sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#666",
                                      }}
                                    >
                                      No image
                                    </Box>
                                  )}
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem" },
                                    fontWeight: 500,
                                    color: "white",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    width: {
                                      xs: "120px",
                                      sm: "200px",
                                    },
                                  }}
                                >
                                  {movie.title}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                    color: "#888",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    width: {
                                      xs: "120px",
                                      sm: "200px",
                                    },
                                  }}
                                >
                                  {new Date(
                                    movie.release_date
                                  ).toLocaleDateString("ru-RU", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </Typography>
                              </Box>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </Box>
                    </Box>
                  )}

                  {keywords.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#6b6868",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          mb: 1,
                          textAlign: "left",
                        }}
                      >
                        Ключевые слова
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          justifyContent: { xs: "center", sm: "flex-start" },
                        }}
                      >
                        {keywords.map((keyword) => (
                          <Chip
                            key={keyword.id}
                            label={keyword.name}
                            onClick={() =>
                              handleKeywordClick(keyword.id, keyword.name)
                            }
                            sx={{
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                              color: "#fff",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.12)",
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Модальное окно с деталями метрик */}
                  <Dialog
                    open={showMetricsDetails}
                    onClose={() => setShowMetricsDetails(false)}
                    TransitionComponent={Fade}
                    TransitionProps={{
                      timeout: 300,
                    }}
                    PaperProps={{
                      sx: {
                        backgroundColor: "#1a1a1a",
                        borderRadius: "12px",
                        maxWidth: "600px",
                        width: "90%",
                        m: 2,
                      },
                    }}
                  >
                    <Box sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ color: "white" }}>
                          Детали метрик
                        </Typography>
                        <IconButton
                          onClick={() => setShowMetricsDetails(false)}
                          sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {[
                          {
                            section: "Оценки",
                            metrics: [
                              hasValue(details?.vote_average) && {
                                label: "Рейтинг",
                                value: `${details.vote_average.toFixed(
                                  1
                                )} из 10`,
                                description:
                                  "Средняя оценка фильма по мнению пользователей",
                              },
                              hasValue(details?.vote_count) && {
                                label: "Популярность",
                                value: `${details.vote_count.toLocaleString()} голосов`,
                                description: "Количество голосов",
                              },
                              hasValue(details?.popularity) && {
                                label: "Тренд",
                                value: `${details.popularity.toFixed(
                                  1
                                )} из 1000`,
                                description:
                                  "Текущий показатель популярности на TMDB",
                              },
                            ].filter(Boolean),
                          },
                          {
                            section: "Характеристики",
                            metrics: [
                              hasValue(details?.runtime) && {
                                label: "Длительность",
                                value: `${details.runtime} мин`,
                                description: "Продолжительность фильма",
                              },
                            ].filter(Boolean),
                          },
                          {
                            section: "Финансы",
                            metrics: [
                              hasValue(details?.budget) && {
                                label: "Бюджет",
                                value: `$${(details.budget / 1000000).toFixed(
                                  1
                                )}M`,
                                description: "Бюджет производства фильма",
                              },
                              hasValue(details?.revenue) && {
                                label: "Доход",
                                value: `$${(
                                  details.revenue / 1000000000
                                ).toFixed(1)}B`,
                                description: "Общие кассовые сборы фильма",
                              },
                              hasValue(details?.budget) &&
                                hasValue(details?.revenue) && {
                                  label: "Окупаемость",
                                  value: `${(
                                    ((details.revenue - details.budget) /
                                      details.budget) *
                                    100
                                  ).toFixed(0)}%`,
                                  description:
                                    "Процент возврата инвестиций относительно бюджета",
                                },
                            ].filter(Boolean),
                          },
                        ]
                          .filter((section) => section.metrics.length > 0)
                          .map((section) => (
                            <Box key={section.section}>
                              <Typography
                                sx={{
                                  color: "rgba(255, 255, 255, 0.9)",
                                  fontSize: "1rem",
                                  fontWeight: 500,
                                  mb: 2,
                                }}
                              >
                                {section.section}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 2,
                                }}
                              >
                                {section.metrics.map(
                                  (metric: Metric | false) =>
                                    metric && (
                                      <Box key={metric.label}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 0.5,
                                          }}
                                        >
                                          <Typography
                                            sx={{
                                              color: "rgba(255, 255, 255, 0.7)",
                                            }}
                                          >
                                            {metric.label}
                                          </Typography>
                                          <Typography
                                            sx={{
                                              color: "#0686ee",
                                              fontWeight: 500,
                                            }}
                                          >
                                            {metric.value}
                                          </Typography>
                                        </Box>
                                        <Typography
                                          sx={{
                                            color: "rgba(255, 255, 255, 0.5)",
                                            fontSize: "0.85rem",
                                          }}
                                        >
                                          {metric.description}
                                        </Typography>
                                      </Box>
                                    )
                                )}
                              </Box>
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  </Dialog>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      {selectedPerson && (
        <PersonDetails
          personId={selectedPerson}
          open={isPersonDetailsOpen}
          onClose={() => {
            setIsPersonDetailsOpen(false);
            setSelectedPerson(null);
          }}
          onMovieSelect={handlePersonMovieSelect}
        />
      )}
      {availableBackdrops.length > 1 && (
        <Tooltip
          title={user ? "" : "Войдите, чтобы менять фон"}
          placement="right"
        >
          <span>
            <IconButton
              onClick={handleChangeBackdrop}
              disabled={!user}
              sx={{
                position: "fixed",
                top: "env(safe-area-inset-top, 16px)",
                left: "env(safe-area-inset-left, 16px)",
                zIndex: 1301,
                color: "white",
                bgcolor: user ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
                backdropFilter: "blur(4px)",
                mt: "20px",
                ml: "20px",
                "&:hover": {
                  bgcolor: user ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)",
                },
                "&.Mui-disabled": {
                  color: "rgba(255,255,255,0.3)",
                },
              }}
            >
              <WallpaperIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Dialog>
  );
};
