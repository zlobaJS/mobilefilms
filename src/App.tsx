import { StrictMode, useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  BottomNavigation,
  BottomNavigationAction,
  Typography,
  CircularProgress,
  Grid,
  InputBase,
  Paper,
  IconButton,
  Skeleton,
  Avatar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import { MovieSlider } from "./components/MovieSlider";
import { getMovies, GENRES, searchMovies } from "./api/tmdb";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { CategoryPage } from "./pages/CategoryPage";
import CastProvider from "react-chromecast";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { KeywordPage } from "./pages/KeywordPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { MovieCard } from "./components/MovieCard";
import { imageUrl } from "./api/tmdb";
import { AllFavoritesPage } from "./pages/AllFavoritesPage";
import { MovieDetailsPage } from "./pages/MovieDetailsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AllWatchedPage } from "./pages/AllWatchedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StudioMoviesPage } from "./pages/StudioMoviesPage";
import { PersonPage } from "./pages/PersonPage";
import { ChangelogPage } from "./pages/ChangelogPage";
import { InstallPWA } from "./components/InstallPWA";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./contexts/AuthContext";
import CloseIcon from "@mui/icons-material/Close";
import { ColorContext } from "./contexts/ColorContext";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "transparent",
      paper: "#141414",
    },
  },
});

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  release_quality?: string;
}

// В начале файла добавим константы с наборами цветов
const COLOR_SCHEMES = {
  blue: {
    topLeft: "#162e52",
    topRight: "#0f35b6",
    bottomRight: "#2b55a6",
    bottomLeft: "#522c69",
  },
  red: {
    topLeft: "#091533",
    topRight: "#28090c",
    bottomRight: "#972013",
    bottomLeft: "#042660",
  },
};

function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        setValue(2);
        break;
      case "/search":
        setValue(0);
        break;
      case "/favorites":
        setValue(1);
        break;
      case "/profile":
        setValue(3);
        break;
      case "/settings":
        setValue(4);
        break;
      case "/changelog":
        setValue(6);
        break;
      default:
        if (location.pathname.includes("/category")) {
          setValue(2);
        }
    }
  }, [location]);

  const handleNavigation = (newValue: number) => {
    setIsLoading(true);
    setValue(newValue);

    let path = "/";
    switch (newValue) {
      case 0:
        path = "/search";
        break;
      case 1:
        path = "/favorites";
        break;
      case 2:
        path = "/";
        break;
      case 3:
        path = "/profile";
        break;
      case 4:
        path = "/settings";
        break;
      case 6:
        path = "/changelog";
        break;
    }

    // Сначала скроллим наверх
    const contentContainer = document.querySelector(".MuiBox-root");
    if (contentContainer) {
      contentContainer.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }

    // Выполняем навигацию и выключаем загрузку после небольшой задержки
    navigate(path);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ color: "white" }} />
        </Box>
      )}
      <Box
        className="bottom-navigation-container"
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1300,
          display: { xs: "block", sm: "none" },
          paddingTop: "20px",
          backgroundColor: "transparent",
          marginBottom: "env(safe-area-inset-bottom)",
          transform: "translateY(env(safe-area-inset-bottom))",
        }}
      >
        <BottomNavigation
          value={value}
          onChange={(_, newValue) => handleNavigation(newValue)}
          sx={{
            bgcolor: "transparent",
            height: "56px",
            background: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(10px)",
            position: "relative",
            zIndex: 2,
            "& .MuiBottomNavigationAction-root": {
              minWidth: "auto",
              padding: 0,
              color: "rgba(255, 255, 255, 0.5)",
              position: "relative",
              "&.Mui-selected": {
                color: "#0686ee",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "20px",
                  height: "2px",
                  backgroundColor: "#0686ee",
                  borderRadius: "2px",
                },
              },
              "& .MuiSvgIcon-root": {
                fontSize: "24px",
              },
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.625rem",
            },
          }}
        >
          <BottomNavigationAction
            icon={<SearchIcon />}
            sx={{
              "&.Mui-selected .MuiSvgIcon-root": {
                transform: "scale(1.1)",
                transition: "transform 0.2s",
              },
            }}
          />
          <BottomNavigationAction
            icon={<FavoriteIcon />}
            sx={{
              "&.Mui-selected .MuiSvgIcon-root": {
                transform: "scale(1.1)",
                transition: "transform 0.2s",
              },
            }}
          />
          <BottomNavigationAction
            icon={<HomeIcon />}
            sx={{
              "&.Mui-selected .MuiSvgIcon-root": {
                transform: "scale(1.1)",
                transition: "transform 0.2s",
              },
            }}
          />
          <BottomNavigationAction
            icon={
              user ? (
                <Avatar
                  src={user.photoURL || undefined}
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: "1rem",
                  }}
                >
                  {user.photoURL ? null : user.displayName?.[0] || "U"}
                </Avatar>
              ) : (
                <PersonIcon />
              )
            }
            sx={{
              "&.Mui-selected .MuiSvgIcon-root": {
                transform: "scale(1.1)",
                transition: "transform 0.2s",
              },
              "& .MuiAvatar-root": {
                transition: "transform 0.2s",
              },
              "&.Mui-selected .MuiAvatar-root": {
                transform: "scale(1.1)",
              },
            }}
          />
          <BottomNavigationAction
            icon={<SettingsIcon />}
            sx={{
              "&.Mui-selected .MuiSvgIcon-root": {
                transform: "scale(1.1)",
                transition: "transform 0.2s",
              },
            }}
          />
        </BottomNavigation>
      </Box>
    </>
  );
}

// function DesktopNavigation() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   return (
//     <Drawer
//       variant="permanent"
//       sx={{
//         display: { xs: "none", sm: "block" },
//         "& .MuiDrawer-paper": {
//           width: "72px",
//           backgroundColor: "#141414",
//           borderRight: "none",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           pt: "env(safe-area-inset-top)",
//         },
//       }}
//     >
//       <List
//         sx={{
//           width: "100%",
//           height: "100%",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           alignItems: "center",
//           gap: 1,
//         }}
//       >
//         <ListItem disablePadding>
//           <ListItemButton
//             onClick={() => navigate("/")}
//             selected={location.pathname === "/"}
//             sx={{
//               minHeight: 48,
//               justifyContent: "center",
//               "&.Mui-selected": {
//                 bgcolor: "rgba(255, 255, 255, 0.08)",
//               },
//               "&:hover": {
//                 bgcolor: "rgba(255, 255, 255, 0.12)",
//               },
//             }}
//           >
//             <ListItemIcon
//               sx={{
//                 minWidth: 0,
//                 justifyContent: "center",
//                 color:
//                   location.pathname === "/"
//                     ? "white"
//                     : "rgba(255, 255, 255, 0.5)",
//               }}
//             >
//               <HomeIcon />
//             </ListItemIcon>
//           </ListItemButton>
//         </ListItem>
//         <ListItem disablePadding>
//           <ListItemButton
//             onClick={() => navigate("/search")}
//             selected={location.pathname === "/search"}
//             sx={{
//               minHeight: 48,
//               justifyContent: "center",
//               "&.Mui-selected": {
//                 bgcolor: "rgba(255, 255, 255, 0.08)",
//               },
//               "&:hover": {
//                 bgcolor: "rgba(255, 255, 255, 0.12)",
//               },
//             }}
//           >
//             <ListItemIcon
//               sx={{
//                 minWidth: 0,
//                 justifyContent: "center",
//                 color:
//                   location.pathname === "/search"
//                     ? "white"
//                     : "rgba(255, 255, 255, 0.5)",
//               }}
//             >
//               <SearchIcon />
//             </ListItemIcon>
//           </ListItemButton>
//         </ListItem>
//       </List>
//     </Drawer>
//   );
// }

function SearchResults({
  query,
  movies,
  loading,
}: {
  query: string;
  movies: Movie[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Grid container spacing={2} sx={{ p: 2 }}>
        {[...Array(20)].map((_, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
            <Box
              sx={{
                aspectRatio: "2/3",
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <Skeleton
                variant="rectangular"
                width="100%"
                height="100%"
                animation="wave"
                sx={{
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (movies.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {query ? "Ничего не найдено" : "Введите запрос для поиска"}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {movies.map((movie) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={movie.id}>
          <MovieCard movie={movie} />
        </Grid>
      ))}
    </Grid>
  );
}

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Обновляем поиск при вводе с debounce
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery) {
        setIsLoading(true);
        try {
          const searchResults = await searchMovies(searchQuery);
          setResults(searchResults);
          navigate(`/search?query=${encodeURIComponent(searchQuery)}`, {
            replace: true,
          });
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        navigate("/search", { replace: true });
      }
    },
    [navigate]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Отменяем предыдущий таймаут
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Устанавливаем новый таймаут для поиска
    searchTimeout.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleClearInput = () => {
    setQuery("");
    setResults([]);
    navigate("/search", { replace: true });
  };

  const firstMovie: Movie | null = results.length > 0 ? results[0] : null;

  return (
    <Box sx={{ p: 3, position: "relative", marginTop: 4 }}>
      <Paper
        component="form"
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: "100px",
          p: "4px 16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease",
          border: "1px solid rgba(255,255,255,0.1)",
          "&:hover, &:focus-within": {
            backgroundColor: "rgba(255,255,255,0.15)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.2)",
          },
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <SearchIcon
          sx={{
            color: "rgba(255,255,255,0.7)",
            mr: 1,
          }}
        />
        <InputBase
          sx={{
            ml: 1,
            flex: 1,
            color: "white",
            "& input": {
              padding: "8px 0",
              fontSize: "1rem",
              "&::placeholder": {
                color: "rgba(255,255,255,0.5)",
                opacity: 1,
              },
            },
          }}
          placeholder="Поиск фильмов..."
          value={query}
          onChange={handleInputChange}
          inputProps={{ "aria-label": "поиск фильмов" }}
        />
        {query && (
          <IconButton
            sx={{
              color: "rgba(255,255,255,0.5)",
              p: "8px",
              "&:hover": {
                color: "rgba(255,255,255,0.8)",
              },
            }}
            aria-label="clear search"
            onClick={handleClearInput}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Paper>

      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress sx={{ color: "#0686ee" }} />
        </Box>
      )}

      {firstMovie && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${imageUrl(
              firstMovie.backdrop_path,
              "original"
            )})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: -1,
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)",
            },
          }}
        />
      )}

      <SearchResults query={query} movies={results} loading={isLoading} />
    </Box>
  );
}

function AppRoutes({ movies, isLoading }: { movies: any; isLoading: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Добавляем состояние для хранения текущей цветовой схемы
  const [currentColors] = useState(() => {
    return Math.random() > 0.5 ? COLOR_SCHEMES.blue : COLOR_SCHEMES.red;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const contentContainer = document.querySelector(".MuiBox-root");
    if (contentContainer) {
      contentContainer.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [location.pathname]);

  const handleMovieSelect = useCallback(
    (movieOrId: Movie | number) => {
      const movieId = typeof movieOrId === "number" ? movieOrId : movieOrId.id;
      navigate(`/movie/${movieId}`);
    },
    [navigate]
  );

  return (
    <ColorContext.Provider value={currentColors}>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          backgroundImage: `
            radial-gradient(circle farthest-side at top left, ${currentColors.topLeft}, transparent 70%),
            radial-gradient(circle farthest-side at top right, ${currentColors.topRight}, transparent 70%),
            radial-gradient(circle farthest-side at bottom right, ${currentColors.bottomRight}, transparent 70%),
            radial-gradient(circle farthest-side at bottom left, ${currentColors.bottomLeft}, transparent 70%)
          `,
          backgroundColor: "#141414",
        }}
      />
      <Box
        className="content-container"
        sx={{
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    sx={{
                      minHeight: "100dvh",
                      // backgroundColor: "#141414",
                      backgroundColor: "transparent",
                      paddingTop: {
                        xs: "18vh",
                        // xs: "calc(100vw * 1.2 + env(safe-area-inset-top) - 16px)",
                        sm: "10vh",
                      },
                      position: "relative",
                      zIndex: 4,
                      WebkitOverflowScrolling: "touch",
                      overscrollBehavior: "contain",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        // height: {
                        //   xs: "calc(100vw * 1.2 + env(safe-area-inset-top))",
                        //   sm: "60vh",
                        // },
                        pointerEvents: "none",
                        zIndex: 1,
                      },
                    }}
                  >
                    <MovieSlider
                      title="Сейчас смотрят"
                      movies={movies.watchingToday}
                      loading={isLoading}
                      categoryId="now-playing"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Популярное"
                      movies={movies.popular}
                      loading={isLoading}
                      categoryId="popular"
                      onMovieSelect={handleMovieSelect}
                      showTitle={false}
                      useBackdrop={true}
                    />
                    <MovieSlider
                      title="Самые высокооцененные"
                      movies={movies.mostRated}
                      loading={isLoading}
                      categoryId="most-rated"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Лучшие фильмы 2024"
                      movies={movies.mostRated2024}
                      loading={isLoading}
                      categoryId="most-rated-2024"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Сегодня в тренде"
                      movies={movies.trendingToday}
                      loading={isLoading}
                      categoryId="trending-today"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="За неделю в тренде"
                      movies={movies.trendingWeek}
                      loading={isLoading}
                      categoryId="trending-week"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Ужасы"
                      movies={movies.horror}
                      loading={isLoading}
                      categoryId="horror"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Боевики"
                      movies={movies.action}
                      loading={isLoading}
                      categoryId="action"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Комедии"
                      movies={movies.comedy}
                      loading={isLoading}
                      categoryId="comedy"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Фантастика"
                      movies={movies.scifi}
                      loading={isLoading}
                      categoryId="scifi"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Фэнтези"
                      movies={movies.fantasy}
                      loading={isLoading}
                      categoryId="fantasy"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Триллеры"
                      movies={movies.thriller}
                      loading={isLoading}
                      categoryId="thriller"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Вестерны"
                      movies={movies.western}
                      loading={isLoading}
                      categoryId="western"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Драмы"
                      movies={movies.drama}
                      loading={isLoading}
                      categoryId="drama"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Военные"
                      movies={movies.war}
                      loading={isLoading}
                      categoryId="war"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Исторические"
                      movies={movies.historical}
                      loading={isLoading}
                      categoryId="historical"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                    <MovieSlider
                      title="Российские фильмы"
                      movies={movies.ruMovies}
                      loading={isLoading}
                      categoryId="ru-movies"
                      onMovieSelect={handleMovieSelect}
                      showTitle={true}
                    />
                  </Box>
                </motion.div>
              }
            />
            <Route
              path="/category/:categoryId"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  <CategoryPage />
                </motion.div>
              }
            />
            <Route
              path="/search"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SearchPage />
                </motion.div>
              }
            />
            <Route
              path="/favorites"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ pb: { xs: 7, sm: 0 } }}>
                    <FavoritesPage />
                  </Box>
                </motion.div>
              }
            />
            <Route
              path="/settings"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  <SettingsPage />
                </motion.div>
              }
            />
            <Route
              path="/keyword/:keywordId/:keywordName"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <KeywordPage />
                </motion.div>
              }
            />
            <Route
              path="/favorites/all"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AllFavoritesPage />
                </motion.div>
              }
            />
            <Route
              path="/movie/:id"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MovieDetailsPage />
                </motion.div>
              }
            />
            <Route
              path="/watched/all"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AllWatchedPage />
                </motion.div>
              }
            />
            <Route
              path="/profile"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfilePage />
                </motion.div>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfilePage />
                </motion.div>
              }
            />
            <Route
              path="/studio/:studioName"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <StudioMoviesPage />
                </motion.div>
              }
            />
            <Route
              path="/person/:personId"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PersonPage />
                </motion.div>
              }
            />
            <Route
              path="/changelog"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChangelogPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </Box>
      <MobileNavigation />
      <InstallPWA />
    </ColorContext.Provider>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [movies, setMovies] = useState({
    watchingToday: [],
    trendingToday: [],
    trendingWeek: [],
    popular: [],
    horror: [],
    action: [],
    comedy: [],
    scifi: [],
    thriller: [],
    western: [],
    drama: [],
    war: [],
    backdrop: [],
    fantasy: [],
    ruMovies: [],
    mostRated: [],
    mostRated2024: [],
    historical: [],
  });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [
          backdropData,
          nowPlayingData,
          trendingTodayData,
          trendingWeekData,
          popularData,
          horrorData,
          actionData,
          comedyData,
          scifiData,
          thrillerData,
          westernData,
          dramaData,
          warData,
          fantasyData,
          ruMoviesData,
          mostRatedData,
          mostRated2024Data,
          historicalData,
        ] = await Promise.all([
          getMovies.popular(),
          getMovies.nowPlaying(),
          getMovies.trendingToday(),
          getMovies.trendingWeek(),
          getMovies.popular(),
          getMovies.byGenre(GENRES.HORROR),
          getMovies.byGenre(GENRES.ACTION),
          getMovies.byGenre(GENRES.COMEDY),
          getMovies.byGenre(GENRES.SCIFI),
          getMovies.byGenre(GENRES.THRILLER),
          getMovies.byGenre(GENRES.WESTERN),
          getMovies.byGenre(GENRES.DRAMA),
          getMovies.byGenre(GENRES.WAR),
          getMovies.byGenre(GENRES.FANTASY),
          getMovies.byCountry("RU"),
          getMovies.mostRated(),
          getMovies.mostRated2024(),
          getMovies.byGenre(GENRES.HISTORY),
        ]);

        const backdropMovies = backdropData.results.slice(0, 5);

        setMovies({
          watchingToday: nowPlayingData.results,
          trendingToday: trendingTodayData.results,
          trendingWeek: trendingWeekData.results,
          popular: popularData.results,
          horror: horrorData.results,
          action: actionData.results,
          comedy: comedyData.results,
          scifi: scifiData.results,
          thriller: thrillerData.results,
          western: westernData.results,
          drama: dramaData.results,
          war: warData.results,
          backdrop: backdropMovies,
          fantasy: fantasyData.results,
          ruMovies: ruMoviesData.results,
          mostRated: mostRatedData.results,
          mostRated2024: mostRated2024Data.results,
          historical: historicalData.results,
        });

        setContentLoaded(true);

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsLoading(false);
        setContentLoaded(true);
      }
    };

    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <StrictMode>
        <BrowserRouter>
          <CastProvider>
            <ThemeProvider theme={darkTheme}>
              <CssBaseline />
              <div
                ref={contentRef}
                style={{
                  visibility: isLoading ? "hidden" : "visible",
                  position: isLoading ? "fixed" : "relative",
                  width: "100%",
                  height: "100%",
                }}
              >
                <AppRoutes movies={movies} isLoading={!contentLoaded} />
              </div>
            </ThemeProvider>
          </CastProvider>
        </BrowserRouter>
      </StrictMode>
    </AuthProvider>
  );
}

export default App;
