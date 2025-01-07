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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ShareIcon from "@mui/icons-material/Share";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  imageUrl,
  getMovieImages,
  getMovieDetails,
  getMovieCredits,
  getCollection,
} from "../api/tmdb";
import { useEffect, useState } from "react";
import { KinoboxPlayer } from "./KinoboxPlayer";
import * as Flags from "country-flag-icons/react/3x2";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xxs: true;
  }
}

interface MovieDetailsProps {
  movie: {
    id: number;
    title: string;
    backdrop_path: string;
    poster_path: string;
    overview: string;
    vote_average: number;
    release_date: string;
    runtime?: number;
    genres?: { id: number; name: string }[];
    production_countries?: { iso_3166_1: string; name: string }[];
    vote_count?: number;
    release_quality?: string;
    belongs_to_collection?: {
      id: number;
      name: string;
      poster_path: string;
      backdrop_path: string;
    };
  } | null;
  open: boolean;
  onClose: () => void;
  onMovieSelect?: (movie: any) => void;
}

interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface Genre {
  id: number;
  name: string;
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

export const MovieDetails = ({
  movie,
  open,
  onClose,
  onMovieSelect,
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
  const [currentMovie, setCurrentMovie] = useState(movie);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpandedDescription, setIsExpandedDescription] = useState(false);

  // Выносим fetchData на уровень компонента
  const fetchData = async (movieData: any) => {
    if (movieData) {
      try {
        const [images, movieDetails, credits] = await Promise.all([
          getMovieImages(movieData.id),
          getMovieDetails(movieData.id),
          getMovieCredits(movieData.id),
        ]);

        if (images.logos && images.logos.length > 0) {
          const russianLogo = images.logos.find(
            (logo: any) => logo.iso_639_1 === "ru"
          );
          setLogo(
            russianLogo ? russianLogo.file_path : images.logos[0].file_path
          );
        } else {
          setLogo(null);
        }

        if (movieDetails) {
          setDetails(movieDetails);
        }

        if (credits?.cast) {
          setCast(credits.cast.slice(0, 15));
        }
      } catch (error) {
        console.error("Error loading movie details:", error);
      }
    }
  };

  useEffect(() => {
    if (open) {
      fetchData(movie);
    }
  }, [movie, open]);

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
    const newMovieDetails = await getMovieDetails(movieId);
    if (newMovieDetails) {
      setShowCollection(false);
      setCurrentMovie(newMovieDetails);
      // Перезагружаем все данные для нового фильма
      fetchData(newMovieDetails);
      if (onMovieSelect) {
        onMovieSelect(newMovieDetails);
      }
    }
  };

  // В useEffect добавляем обновление currentMovie при изменении movie
  useEffect(() => {
    setCurrentMovie(movie);
  }, [movie]);

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

  if (!movie) return null;

  // Функция форматирования времени
  const formatRuntime = (minutes: number | undefined) => {
    console.log("Runtime input:", minutes);
    if (typeof minutes !== "number" || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  // Форматируем количество голосов
  const formatVoteCount = (count?: number) => {
    if (!count) return "";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  // Добавим функцию для определения цвета рейтинга
  const getRatingColor = (rating: number | undefined) => {
    if (!rating) return "#888"; // серый для undefined
    if (rating >= 7) return "#4CAF50";
    if (rating >= 5.6) return "#888";
    return "#FF5252";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: {
          enter: 300,
          exit: 300,
        },
      }}
      PaperProps={{
        sx: {
          bgcolor: "#141414",
          height: "100%",
          width: "100%",
          margin: 0,
          padding: 0,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          "&.MuiDialog-paper": {
            margin: 0,
          },
          // Убираем все отступы
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          // Растягиваем на весь экран
          minHeight: "-webkit-fill-available",
          // Убираем белый фон
          background: "#141414",
        },
      }}
    >
      <Box
        className="dialog-content"
        sx={{
          height: "100%",
          width: "100%",
          position: "relative",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          margin: 0,
          padding: 0,
          // Убираем отступы
          paddingTop: 0,
          paddingBottom: 0,
          // Убираем белый фон
          background: "#141414",
        }}
      >
        {!showPlayer && (
          <IconButton
            onClick={onClose}
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
                    xs: "calc(100vw * 0.75 + env(safe-area-inset-top) + 100px)",
                    sm: "60vh",
                  },
                  overflow: "hidden",
                  mt: "-env(safe-area-inset-top)",
                }}
              >
                <Box
                  component="img"
                  src={imageUrl(
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
                    objectPosition: {
                      xs: "center 15%",
                      sm: "center top",
                    },
                    opacity: isBackdropLoaded ? 1 : 0,
                    transition: "opacity 0.3s ease-out",
                    transform: "scale(1.02)",
                    backgroundColor: "#000",
                    imageRendering: "high-quality",
                    WebkitBackfaceVisibility: "hidden",
                    MozBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                    marginTop: 0,
                  }}
                  onLoad={() => setIsBackdropLoaded(true)}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "calc(100% + 120px)",
                    background: `linear-gradient(
                      rgb(103 58 183 / 0%) 0%,
                      rgba(20, 20, 20, 0.2) 40%,
                      rgb(20 20 20) 65%,
                      rgb(20 20 20) 80%,
                      rgb(20 20 20) 90%,
                      rgb(20 20 20) 100%
                    )`,
                    transition: "background 0.2s ease",
                    marginTop: 0,
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
                  {logo ? (
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
                          maxWidth: "100%",
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
                    {currentMovie?.vote_average &&
                      currentMovie.vote_average > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            flexShrink: 0, // Предотвращаем сжатие элемента
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.9rem",
                              color: getRatingColor(currentMovie?.vote_average),
                            }}
                          >
                            {currentMovie?.vote_average.toFixed(1)}
                          </Typography>
                          {currentMovie?.vote_count &&
                            currentMovie?.vote_count > 0 && (
                              <>
                                <Typography
                                  sx={{
                                    color: "#888",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  •
                                </Typography>
                                <Typography
                                  sx={{
                                    color: "#888",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {formatVoteCount(currentMovie?.vote_count)}{" "}
                                  оценок
                                </Typography>
                              </>
                            )}
                        </Box>
                      )}

                    {/* Страны производства */}
                    {details?.production_countries &&
                      details.production_countries.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            flexWrap: "wrap", // Разрешаем перенос внутри блока стран
                            justifyContent: { xs: "center", sm: "flex-start" },
                          }}
                        >
                          {details.production_countries.map(
                            (country: ProductionCountry, index: number) => (
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
                                      "& > svg": {
                                        width: "100%",
                                      },
                                    }}
                                  >
                                    {(() => {
                                      const CountryFlag =
                                        Flags[
                                          country.iso_3166_1 as keyof typeof Flags
                                        ];
                                      return CountryFlag ? (
                                        <CountryFlag />
                                      ) : null;
                                    })()}
                                  </Box>
                                )}
                                <Typography
                                  sx={{
                                    color: "#888",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {translateCountry(country.name)}
                                </Typography>
                                {index <
                                  details.production_countries.length - 1 && (
                                  <Typography
                                    sx={{
                                      color: "#888",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    •
                                  </Typography>
                                )}
                              </Box>
                            )
                          )}
                        </Box>
                      )}

                    {/* Год */}
                    {currentMovie?.release_date && (
                      <Typography
                        sx={{
                          color: "#888",
                          fontSize: "0.9rem",
                          flexShrink: 0,
                        }}
                      >
                        {new Date(currentMovie?.release_date).getFullYear()}
                      </Typography>
                    )}

                    {/* Продолжительность */}
                    {typeof details?.runtime === "number" &&
                      details.runtime > 0 && (
                        <Typography
                          sx={{
                            color: "#888",
                            fontSize: "0.9rem",
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
                          fontSize: "0.9rem",
                          textAlign: { xs: "center", sm: "left" },
                        }}
                      >
                        {details.genres
                          .map((genre: Genre) => genre.name)
                          .join(", ")}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: isMobile ? "8px" : "16px",
                      mb: 2,
                      alignItems: "center",
                      justifyContent: { xs: "center", sm: "flex-start" },
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                    }}
                  >
                    <Button
                      onClick={() => setShowPlayer(true)}
                      startIcon={
                        <PlayArrowIcon
                          sx={{
                            fontSize: isMobile ? 20 : 24,
                            marginRight: isMobile ? 0 : 1,
                            marginLeft: isMobile ? 0 : -0.5,
                          }}
                        />
                      }
                      sx={{
                        background:
                          "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                        boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                        color: "white",
                        padding: isMobile ? "8px" : "8px 24px",
                        borderRadius: isMobile ? "50%" : "50px",
                        transition: "all 0.3s ease",
                        textTransform: "none",
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        fontWeight: 500,
                        minWidth: isMobile ? "40px" : "auto",
                        width: isMobile ? "40px" : "auto",
                        height: isMobile ? "40px" : "auto",
                        "& .MuiButton-startIcon": {
                          margin: isMobile ? 0 : "auto",
                          position: isMobile ? "absolute" : "relative",
                          left: isMobile ? "50%" : "auto",
                          transform: isMobile ? "translateX(-50%)" : "none",
                        },
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #1976D2 30%, #00B4E5 90%)",
                          boxShadow: "0 4px 8px 3px rgba(33, 203, 243, .4)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {!isMobile && "Смотреть"}
                    </Button>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        sx={{
                          color: "white",
                          bgcolor: "rgb(65 67 65 / 68%)",
                          "&:hover": {
                            bgcolor: "rgb(65 67 65 / 88%)",
                          },
                        }}
                      >
                        <StarBorderIcon />
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
                        <ShareIcon />
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
                        <DownloadIcon />
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
                    variant="h6"
                    sx={{
                      color: "#6b6868",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      mb: 1,
                      textAlign: "left",
                    }}
                  >
                    Описание
                  </Typography>

                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: { xs: "0.8rem", sm: "1rem" },
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

                  {/* Секция с актерами */}
                  {cast.length > 0 && isVisible && (
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
                          style={{
                            padding: "4px",
                            width: "100%",
                          }}
                        >
                          {cast.map((actor) => (
                            <SwiperSlide
                              key={actor.id}
                              style={{
                                width: "auto",
                                marginRight: "4px",
                              }}
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
                                }}
                              >
                                {actor.profile_path ? (
                                  <Box
                                    component="img"
                                    loading="lazy"
                                    src={imageUrl(actor.profile_path, "w342")}
                                    alt={actor.name}
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
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#666",
                                    }}
                                  >
                                    No photo
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
                                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                    fontWeight: 500,
                                    mb: 0.5,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    width: "100%",
                                  }}
                                >
                                  {actor.name}
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
                                  {actor.character}
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
                                  {new Date(movie.release_date).getFullYear()}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </Dialog>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};
