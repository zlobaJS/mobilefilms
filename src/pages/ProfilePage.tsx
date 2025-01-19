import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Grid,
  Button,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardMedia,
} from "@mui/material";
import { motion } from "framer-motion";
import { FavoritesSlider } from "../components/FavoritesSlider";
import { WatchedSlider } from "../components/WatchedSlider";
import { useCallback, useState, useMemo, useEffect } from "react";
import { MovieDetails } from "../components/MovieDetails";
import { useFavorites } from "../hooks/useFavorites";
import { useWatched } from "../hooks/useWatched";
import * as Flags from "country-flag-icons/react/3x2";
import { getMovieDetails, imageUrl } from "../api/tmdb";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { StudiosSlider } from "../components/StudiosSlider";
import { FavoritePersonsSlider } from "../components/FavoritePersonsSlider";
import { useFavoritePersons } from "../hooks/useFavoritePersons";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate, useParams } from "react-router-dom";
import { Movie } from "../types/movie";
import { useAuth } from "../hooks/useAuth";
import GoogleIcon from "@mui/icons-material/Google";
import ShareIcon from "@mui/icons-material/Share";
import { useUserData } from "../hooks/useUserData";
import { useProfileBackdrop } from "../hooks/useProfileBackdrop";
import WallpaperIcon from "@mui/icons-material/Wallpaper";

// Добавляем объект с переводами стран (можно вынести в отдельный файл)
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
const translateCountry = (country: string): string => {
  return countryTranslations[country] || country;
};

// Добавляем интерфейс для типа страны производства
interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

// Добавляем интерфейс для типа студии
interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export const ProfilePage = () => {
  const { userId } = useParams(); // Получаем userId из URL
  const navigate = useNavigate();
  const { user, signInWithGoogle, logout } = useAuth();
  const { userData: profileUser, loading } = useUserData(userId);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  // Определяем, является ли это профилем текущего пользователя
  const isOwnProfile = !userId || (user && userId === user.uid);

  // Функция для шаринга профиля
  const handleShareProfile = async () => {
    if (!profileUser) return;

    const shareUrl = `${window.location.origin}/profile/${profileUser.uid}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Профиль ${profileUser.displayName || "пользователя"}`,
          text: "Посмотри профиль на MovieApp",
          url: shareUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Ошибка шаринга:", error);
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setIsSnackbarOpen(true);
    }
  };

  // Состояния для MovieDetails
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [countryStats, setCountryStats] = useState<
    Array<{
      country: string;
      countryCode: string;
      count: number;
      percentage: number;
    }>
  >([]);
  const [studioStats, setStudioStats] = useState<
    Array<{
      name: string;
      logo_path: string | null;
      count: number;
      percentage: number;
    }>
  >([]);

  // Получаем данные из хуков
  const { favorites, removeFromFavorites } = useFavorites();
  const { watchedMovies, removeFromWatched } = useWatched();
  const { favoritePersons, removeFromFavoritePersons } = useFavoritePersons();

  // Обновляем обработчик для диалога
  const handleMovieSelectDialog = useCallback((movie: Movie | number) => {
    // Если передан ID, получаем детали фильма
    if (typeof movie === "number") {
      getMovieDetails(movie).then((movieData) => {
        setSelectedMovie(movieData);
        setIsDialogOpen(true);
      });
    } else {
      setSelectedMovie(movie);
      setIsDialogOpen(true);
    }
  }, []);

  // Обработчик для навигации к странице фильма
  const handleMovieSelect = useCallback(
    (movieId: number) => {
      navigate(`/movie/${movieId}`);
    },
    [navigate]
  );

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMovie(null);
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  const handleRemoveFromFavorites = useCallback(
    (movieId: number) => {
      removeFromFavorites(movieId);
      setUpdateTrigger((prev) => prev + 1);
    },
    [removeFromFavorites]
  );

  const handleRemoveFromWatched = useCallback(
    (movieId: number) => {
      removeFromWatched(movieId);
      setUpdateTrigger((prev) => prev + 1);
    },
    [removeFromWatched]
  );

  const sliderProps = useMemo(
    () => ({
      showTitle: true,
      showRemoveButtons: true,
      updateTrigger,
    }),
    [updateTrigger]
  );

  // Статистика
  const totalWatchTime = useMemo(() => {
    return watchedMovies.length * 120; // Среднее время фильма 120 минут
  }, [watchedMovies]);

  const statsCards = [
    {
      title: "Избранных фильмов",
      value: favorites.length,
      color: "#FF4081",
    },
    {
      title: "Просмотрено фильмов",
      value: watchedMovies.length,
      color: "#64B5F6",
    },
    {
      title: "Часов просмотра",
      value: Math.round(totalWatchTime / 60),
      color: "#81C784",
    },
  ];

  // Обновляем расчет статистики по странам
  useEffect(() => {
    const calculateCountryStats = async () => {
      if (watchedMovies.length === 0) {
        setCountryStats([]);
        return;
      }

      const movieDetailsPromises = watchedMovies.map((movie) =>
        getMovieDetails(movie.id)
      );

      try {
        const movieDetails = await Promise.all(movieDetailsPromises);
        const countryCount: { [key: string]: number } = {};
        const countryISOCodes: { [key: string]: string } = {};

        movieDetails.forEach((details) => {
          if (details?.production_countries) {
            details.production_countries.forEach(
              (country: ProductionCountry) => {
                countryCount[country.name] =
                  (countryCount[country.name] || 0) + 1;
                countryISOCodes[country.name] = country.iso_3166_1;
              }
            );
          }
        });

        const stats = Object.entries(countryCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([country, count]) => ({
            country,
            countryCode: countryISOCodes[country],
            count,
            percentage: Math.round((count / watchedMovies.length) * 100),
          }));

        setCountryStats(stats);
      } catch (error) {
        console.error("Error calculating country stats:", error);
        setCountryStats([]);
      }
    };

    calculateCountryStats();
  }, [watchedMovies, updateTrigger]);

  // Обновляем расчет статистики, добавляя студии
  useEffect(() => {
    const calculateStats = async () => {
      if (watchedMovies.length === 0) {
        setCountryStats([]);
        setStudioStats([]);
        return;
      }

      const movieDetailsPromises = watchedMovies.map((movie) =>
        getMovieDetails(movie.id)
      );

      try {
        const movieDetails = await Promise.all(movieDetailsPromises);
        const studioCount: {
          [key: string]: { count: number; logo_path: string | null };
        } = {};

        movieDetails.forEach((details) => {
          if (details?.production_companies) {
            details.production_companies.forEach(
              (studio: ProductionCompany) => {
                if (!studioCount[studio.name]) {
                  studioCount[studio.name] = {
                    count: 0,
                    logo_path: studio.logo_path,
                  };
                }
                studioCount[studio.name].count += 1;
              }
            );
          }
        });

        const studios = Object.entries(studioCount)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, 50)
          .map(([name, data]) => ({
            name,
            logo_path: data.logo_path,
            count: data.count,
            percentage: Math.round((data.count / watchedMovies.length) * 100),
          }));

        setStudioStats(studios);
      } catch (error) {
        console.error("Error calculating studio stats:", error);
        setStudioStats([]);
      }
    };

    calculateStats();
  }, [watchedMovies, updateTrigger]);

  // Компонент для отображения пустого состояния
  const EmptyState = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: any;
    title: string;
    description: string;
  }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        py: { xs: 1, sm: 1.5 },
        px: 1,
        textAlign: "center",
      }}
    >
      <Icon
        sx={{
          fontSize: { xs: "1.5rem", sm: "2rem" },
          color: "rgba(255, 255, 255, 0.3)",
          mb: 0.5,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: { xs: "0.7rem", sm: "0.8rem" },
          lineHeight: 1.2,
          mb: 0.25,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: { xs: "0.6rem", sm: "0.7rem" },
          lineHeight: 1.1,
        }}
      >
        {description}
      </Typography>
    </Box>
  );

  const handlePersonSelect = useCallback(
    (personId: number) => {
      navigate(`/person/${personId}`);
    },
    [navigate]
  );

  useEffect(() => {
    if (!user && userId) {
      navigate("/profile");
    }
  }, [user, userId, navigate]);

  // Добавляем хук для управления фоном
  const { backdropPath, setProfileBackdrop } = useProfileBackdrop(
    userId || user?.uid
  );
  const [showBackdropMenu, setShowBackdropMenu] = useState(false);
  const [availableMovies, setAvailableMovies] = useState<Movie[]>([]);

  // Добавляем эффект для объединения фильмов
  useEffect(() => {
    // Объединяем просмотренные и избранные фильмы без дубликатов
    const allMovies = [
      ...new Map(
        [...favorites, ...watchedMovies].map((movie) => [movie.id, movie])
      ).values(),
    ];
    setAvailableMovies(allMovies);
  }, [favorites, watchedMovies]);

  // Добавляем обработчик установки фона
  const handleSetBackdrop = async (movie: Movie) => {
    if (!user) return;

    try {
      await setProfileBackdrop(movie.id, movie.backdrop_path);
      setShowBackdropMenu(false);
    } catch (error) {
      console.error("Error setting backdrop:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#141414",
          py: 4,
          position: "relative",
          paddingTop: "max(1rem, env(safe-area-inset-top))",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
          // Добавляем стили для фона
          backgroundImage: backdropPath ? `url(${backdropPath})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(20, 20, 20, 0.85)",
            zIndex: 0,
          },
        }}
      >
        {/* Добавляем кнопку смены фона */}
        {user && (
          <Tooltip title="Сменить фон профиля">
            <IconButton
              onClick={() => setShowBackdropMenu(true)}
              sx={{
                position: "fixed",
                top: "env(safe-area-inset-top, 16px)",
                right: "env(safe-area-inset-right, 16px)",
                zIndex: 2,
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <WallpaperIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Добавляем диалог выбора фона */}
        <Dialog
          open={showBackdropMenu}
          onClose={() => setShowBackdropMenu(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: "#141414", color: "white" }}>
            Выберите фон профиля
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "#141414", p: 2 }}>
            <Grid container spacing={2}>
              {availableMovies.map((movie) => (
                <Grid item xs={12} sm={6} md={4} key={movie.id}>
                  <Card
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "scale(1.02)",
                        transition: "transform 0.2s",
                      },
                    }}
                    onClick={() => handleSetBackdrop(movie)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={imageUrl(movie.backdrop_path, "w500")}
                      alt={movie.title}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1,
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.8))",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "white" }}>
                        {movie.title}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          {/* Профиль */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              position: "relative",
            }}
          >
            {/* Кнопка шаринга только для авторизованных пользователей */}
            {profileUser && (
              <IconButton
                onClick={handleShareProfile}
                sx={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                  color: "white",
                  opacity: 0.7,
                  "&:hover": {
                    opacity: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <ShareIcon />
              </IconButton>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 2,
              }}
            >
              {loading ? (
                <CircularProgress sx={{ color: "#0686ee" }} />
              ) : !user || (!userId && !profileUser) ? (
                // Улучшенная форма входа для неавторизованных
                <>
                  <Avatar
                    sx={{
                      width: 96,
                      height: 96,
                      backgroundColor: "rgba(6, 134, 238, 0.1)",
                      border: "2px solid rgba(6, 134, 238, 0.3)",
                      fontSize: "2.5rem",
                      color: "#0686ee",
                    }}
                  >
                    U
                  </Avatar>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "white",
                      mb: 1,
                      textAlign: "center",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    Войдите в аккаунт
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      mb: 2,
                      textAlign: "center",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      maxWidth: "80%",
                    }}
                  >
                    Чтобы сохранять фильмы и отслеживать просмотры
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={signInWithGoogle}
                    sx={{
                      backgroundColor: "#0686ee",
                      color: "white",
                      textTransform: "none",
                      fontSize: "0.95rem",
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "#0571cc",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Войти через Google
                  </Button>
                </>
              ) : profileUser ? (
                // Улучшенный профиль пользователя
                <>
                  <Avatar
                    src={profileUser?.photoURL || undefined}
                    sx={{
                      width: 96,
                      height: 96,
                      border: "4px solid rgba(6, 134, 238, 0.3)",
                      backgroundColor: "rgba(6, 134, 238, 0.1)",
                      fontSize: "2.5rem",
                      color: "#0686ee",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "rgba(6, 134, 238, 0.5)",
                      },
                    }}
                  >
                    {!profileUser?.photoURL &&
                      (profileUser?.displayName?.[0] || "U")}
                  </Avatar>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "white",
                      mb: 1,
                      textAlign: "center",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {profileUser?.displayName || "Пользователь"}
                  </Typography>
                  {isOwnProfile && (
                    <Button
                      variant="outlined"
                      onClick={logout}
                      sx={{
                        color: "#0686ee",
                        borderColor: "#0686ee",
                        textTransform: "none",
                        fontSize: "0.95rem",
                        px: 3,
                        py: 0.8,
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: "#0686ee",
                          backgroundColor: "rgba(6, 134, 238, 0.1)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      Выйти
                    </Button>
                  )}
                </>
              ) : (
                <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Профиль не найден
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Статистика */}
          <Grid
            container
            spacing={1}
            sx={{
              mb: 4,
              mx: "auto",
              maxWidth: { xs: "100%", sm: "90%", md: "80%" },
            }}
          >
            {statsCards.map((stat, index) => (
              <Grid item xs={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 2,
                    height: "100%",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    minHeight: { xs: 80, sm: 100 },
                    "&:hover": {
                      transform: "translateY(-4px)",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "2px",
                      background: `linear-gradient(to right, transparent, ${stat.color}, transparent)`,
                      opacity: 0.8,
                    },
                  }}
                >
                  {stat.value > 0 ? (
                    <>
                      <Typography
                        variant="h4"
                        sx={{
                          color: stat.color,
                          fontWeight: "bold",
                          lineHeight: 1,
                          fontSize: { xs: "1.25rem", sm: "1.75rem" },
                          mb: { xs: 0.5, sm: 1 },
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          lineHeight: 1.2,
                          px: 1,
                        }}
                      >
                        {stat.title}
                      </Typography>
                    </>
                  ) : (
                    <EmptyState
                      icon={
                        index === 0
                          ? FavoriteIcon
                          : index === 1
                          ? VisibilityIcon
                          : MovieFilterIcon
                      }
                      title={stat.title}
                      description="Нет данных"
                    />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Объединенная секция статистики */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
            }}
          >
            {countryStats.length > 0 ? (
              <Grid container spacing={2}>
                {countryStats.map(
                  ({ country, countryCode, count, percentage }, index) => (
                    <Grid item xs={12} key={country}>
                      <Box
                        sx={{
                          position: "relative",
                          mb: 1,
                          "&:hover": {
                            "& .MuiTypography-root": {
                              color: "#0686ee",
                            },
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {countryCode && (
                              <Box
                                component="span"
                                sx={{
                                  width: "24px",
                                  height: "18px",
                                  display: "inline-block",
                                  verticalAlign: "middle",
                                  "& svg": {
                                    display: "block",
                                    width: "100%",
                                    height: "100%",
                                  },
                                }}
                              >
                                {(() => {
                                  const CountryFlag =
                                    Flags[countryCode as keyof typeof Flags];
                                  return CountryFlag ? <CountryFlag /> : null;
                                })()}
                              </Box>
                            )}
                            <Typography
                              sx={{
                                color: "white",
                                transition: "color 0.2s",
                              }}
                            >
                              {translateCountry(country)}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              fontSize: "0.875rem",
                            }}
                          >
                            {count} фильм
                            {count === 1 ? "" : count < 5 ? "а" : "ов"} (
                            {percentage}%)
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: "100%",
                            height: "4px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percentage}%`,
                              height: "100%",
                              backgroundColor: [
                                "#FF4081",
                                "#64B5F6",
                                "#81C784",
                                "#FFD54F",
                                "#BA68C8",
                              ][index],
                              transition: "width 1s ease-in-out",
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  )
                )}
              </Grid>
            ) : (
              <EmptyState
                icon={MovieFilterIcon}
                title="Нет данных о странах"
                description="Добавьте фильмы в просмотренные, чтобы увидеть статистику по странам"
              />
            )}
          </Paper>

          {/* Слайдеры с фильмами */}
          <Box sx={{ mt: 4 }}>
            {favorites.length > 0 ? (
              <FavoritesSlider
                onMovieSelect={handleMovieSelectDialog}
                {...sliderProps}
                onRemoveFromFavorites={handleRemoveFromFavorites}
              />
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                }}
              >
                <EmptyState
                  icon={FavoriteIcon}
                  title="Нет избранных фильмов"
                  description="Добавляйте фильмы в избранное, чтобы они отображались здесь"
                />
              </Paper>
            )}

            {watchedMovies.length > 0 ? (
              <WatchedSlider
                onMovieSelect={handleMovieSelectDialog}
                {...sliderProps}
                onRemoveFromWatched={handleRemoveFromWatched}
              />
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                }}
              >
                <EmptyState
                  icon={VisibilityIcon}
                  title="Нет просмотренных фильмов"
                  description="Отмечайте фильмы как просмотренные, чтобы они появились здесь"
                />
              </Paper>
            )}

            {/* Добавляем слайдер студий */}
            <Box sx={{ mb: { xs: 7, sm: 4 } }}>
              {studioStats.length > 0 ? (
                <StudiosSlider
                  studios={studioStats.map((stat) => ({
                    name: stat.name,
                    logo_path: stat.logo_path,
                    movieCount: stat.count,
                  }))}
                />
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 2,
                  }}
                >
                  <EmptyState
                    icon={MovieFilterIcon}
                    title="Нет данных о киностудиях"
                    description="Добавьте фильмы в просмотренные, чтобы увидеть статистику по киностудиям"
                  />
                </Paper>
              )}
            </Box>

            {favoritePersons.length > 0 ? (
              <FavoritePersonsSlider
                persons={favoritePersons}
                showTitle={true}
                showRemoveButtons={true}
                onRemoveFromFavorites={removeFromFavoritePersons}
                onPersonSelect={handlePersonSelect}
              />
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                }}
              >
                <EmptyState
                  icon={PersonIcon}
                  title="Нет избранных персон"
                  description="Подпишитесь на персон, чтобы они появились здесь"
                />
              </Paper>
            )}
          </Box>

          {/* Диалог с деталями фильма */}
          <MovieDetails
            movie={selectedMovie}
            open={isDialogOpen}
            onClose={handleDialogClose}
            updateTrigger={updateTrigger}
            onPersonSelect={handlePersonSelect}
            onMovieSelect={handleMovieSelect}
          />

          {/* Добавляем Snackbar в конец компонента */}
          <Snackbar
            open={isSnackbarOpen}
            autoHideDuration={3000}
            onClose={() => setIsSnackbarOpen(false)}
            message="Ссылка на профиль скопирована"
          />
        </Container>
      </Box>
    </motion.div>
  );
};
