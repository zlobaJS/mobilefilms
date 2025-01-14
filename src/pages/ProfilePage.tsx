import { Box, Container, Typography, Paper, Avatar, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { FavoritesSlider } from "../components/FavoritesSlider";
import { WatchedSlider } from "../components/WatchedSlider";
import { useCallback, useState, useMemo, useEffect } from "react";
import { MovieDetails } from "../components/MovieDetails";
import { useFavorites } from "../hooks/useFavorites";
import { useWatched } from "../hooks/useWatched";
import * as Flags from "country-flag-icons/react/3x2";
import { getMovieDetails } from "../api/tmdb";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { StudiosSlider } from "../components/StudiosSlider";
import { FavoritePersonsSlider } from "../components/FavoritePersonsSlider";
import { useFavoritePersons } from "../hooks/useFavoritePersons";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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

  // Обработчики событий
  const handleMovieSelectDialog = useCallback((movie: any) => {
    setSelectedMovie(movie);
    setIsDialogOpen(true);
  }, []);

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
        }}
      >
        <Container maxWidth="xl">
          {/* Профиль */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
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
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "#0686ee",
                  fontSize: "3rem",
                }}
              >
                U
              </Avatar>
              <Typography
                variant="h5"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Пользователь
              </Typography>
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
        </Container>
      </Box>
    </motion.div>
  );
};
