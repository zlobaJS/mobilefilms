import {
  Box,
  Typography,
  Button,
  Dialog,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ShareIcon from "@mui/icons-material/Share";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DownloadIcon from "@mui/icons-material/Download";
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
import "swiper/css";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [logo, setLogo] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [scrollOpacity] = useState(0.4); // начальная прозрачность 0.4
  const [isBackdropLoaded, setIsBackdropLoaded] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [_, setMediaUrl] = useState<string | null>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [collectionMovies, setCollectionMovies] = useState<any[]>([]);
  const [showCollection, setShowCollection] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(movie);

  // Добавьте определение размера изображения в зависимости от устройства
  const backdropSize = isMobile ? "w780" : "original";

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

  // Добавим лог перед рендерингом коллекции
  console.log("Collection data:", movie.belongs_to_collection);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      fullScreen
      TransitionProps={{
        timeout: 400,
      }}
      PaperProps={{
        sx: {
          bgcolor: "#141414",
          backgroundImage: "none",
          margin: 0,
          height: '100dvh',
          overflowY: "auto",
          padding: 0, // Убираем padding
        },
      }}
    >
      <Box
        className="dialog-content"
        sx={{
          height: '100dvh',
          position: 'relative',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {!showPlayer && (
          <IconButton
            onClick={onClose}
            sx={{
              position: "fixed",
              top: 'env(safe-area-inset-top, 16px)', // Учитываем notch
              right: 'env(safe-area-inset-right, 16px)',
              zIndex: 1301,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        {/* Backdrop image with notch area support */}
        <Box
          className="backdrop-image"
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "40vh", sm: "60vh" },
            backgroundImage: `url(${imageUrl(
              currentMovie?.backdrop_path || currentMovie?.poster_path || "",
              backdropSize
            )})`,
            backgroundSize: "cover",
            backgroundPosition: { xs: "center 15%", sm: "center top" },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: { xs: "40vh", sm: "60vh" },
              "&::after": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                background: `linear-gradient(to bottom, 
                  rgba(0,0,0,${scrollOpacity}) 0%, 
                  rgba(20,20,20,1) 100%)`,
                transition: "background 0.2s ease",
              },
            }}
          >
            <Box
              component="img"
              src={imageUrl(
                currentMovie?.backdrop_path || currentMovie?.poster_path || "",
                backdropSize
              )}
              alt={currentMovie?.title}
              onLoad={() => setIsBackdropLoaded(true)}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: { xs: "center 15%", sm: "center top" },
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0,
                transition: "opacity 0.6s ease-out",
                ...(isBackdropLoaded && {
                  opacity: 1,
                }),
              }}
            />
          </Box>

          <Box
            sx={{
              position: "relative",
              mt: { xs: -10, sm: -20 },
              px: 2,
              color: "white",
              display: "flex",
              justifyContent: "center",
              opacity: 0,
              animation: "fadeInUp 0.8s ease-out forwards",
              "@keyframes fadeInUp": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(40px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
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
                      opacity: 0,
                      animation: "fadeIn 0.6s ease-out 0.3s forwards",
                      "@keyframes fadeIn": {
                        to: { opacity: 1 },
                      },
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
                    opacity: 0,
                    animation: "fadeIn 0.6s ease-out 0.3s forwards",
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
                  opacity: 0,
                  animation: "fadeIn 0.6s ease-out 0.5s forwards",
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
                              {formatVoteCount(currentMovie?.vote_count)} оценок
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
                                  return CountryFlag ? <CountryFlag /> : null;
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
                  gap: 2,
                  mb: 3,
                  justifyContent: { xs: "center", sm: "flex-start" },
                  width: "100%",
                  opacity: 0,
                  animation: "fadeIn 0.6s ease-out 0.7s forwards",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => setShowPlayer(true)}
                  sx={{
                    bgcolor: "#ff6600",
                    color: "white",
                    "&:hover": { bgcolor: "#ff8533" },
                    borderRadius: 2,
                    px: 4,
                  }}
                >
                  Смотреть онлайн
                </Button>
                <IconButton
                  sx={{
                    bgcolor: "#1f1f1f",
                    color: "white",
                    "&:hover": { bgcolor: "#333" },
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  maxWidth: 400,
                  mb: 3,
                }}
              >
                <IconButton
                  sx={{
                    color: "#888",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <StarBorderIcon />
                  <Typography variant="caption">Оценить</Typography>
                </IconButton>
                <IconButton
                  sx={{
                    color: "#888",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <ShareIcon />
                  <Typography variant="caption">Буду смотреть</Typography>
                </IconButton>
                <IconButton
                  sx={{
                    color: "#888",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <ShareIcon />
                  <Typography variant="caption">Добавить</Typography>
                </IconButton>
                <IconButton
                  sx={{
                    color: "#888",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <MoreHorizIcon />
                  <Typography variant="caption">Еще</Typography>
                </IconButton>
              </Box>

              {/* Описание фильма */}
              {currentMovie?.overview && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      mb: 2,
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontWeight: 500,
                    }}
                  >
                    Описание
                  </Typography>
                  <Typography
                    sx={{
                      color: "#888",
                      fontSize: "0.9rem",
                      maxWidth: "800px",
                    }}
                  >
                    {currentMovie?.overview}
                  </Typography>
                </Box>
              )}

              {/* Секция с актерами */}
              {cast.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      mb: 2,
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontWeight: 500,
                    }}
                  >
                    В главных ролях
                  </Typography>
                  <Swiper
                    slidesPerView={"auto"}
                    spaceBetween={8}
                    style={{ padding: "4px" }}
                  >
                    {cast.map((actor) => (
                      <SwiperSlide
                        key={actor.id}
                        style={{
                          width: "auto",
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: "100px", sm: "120px", md: "140px" },
                            cursor: "pointer",
                            "&:hover": {
                              opacity: 0.8,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              paddingBottom: "100%",
                              position: "relative",
                              borderRadius: 1,
                              overflow: "hidden",
                              bgcolor: "#1f1f1f",
                              mb: 1,
                            }}
                          >
                            {actor.profile_path ? (
                              <Box
                                component="img"
                                src={imageUrl(actor.profile_path, "w185")}
                                alt={actor.name}
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
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
                          <Typography
                            sx={{
                              color: "white",
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                              fontWeight: 500,
                              mb: 0.5,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
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
                            }}
                          >
                            {actor.character}
                          </Typography>
                        </Box>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </Box>
              )}

              {/* Коллекция */}
              {details?.belongs_to_collection && (
                <>
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "white",
                        mb: 2,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        fontWeight: 500,
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
                            onClick={() => handleCollectionMovieClick(movie.id)}
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
  );
};
