import { StrictMode, useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  Typography,
  CircularProgress,
  Grid,
  InputBase,
  Paper,
  IconButton,
  Skeleton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";
import { MovieSlider } from "./components/MovieSlider";
import { BackdropSlider } from "./components/BackdropSlider";
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
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#141414",
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

function SplashScreen() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#141414",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Box
        component={motion.div}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        sx={{
          width: 120,
          height: 120,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <HomeIcon sx={{ fontSize: 60, color: "#0686ee" }} />
      </Box>
      <CircularProgress size={40} sx={{ color: "#0686ee" }} />
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Загрузка контента...
      </Typography>
    </Box>
  );
}

function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

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
      case "/about":
        setValue(5);
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
      case 5:
        path = "/about";
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
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1300,
          display: { xs: "block", sm: "none" },
          paddingTop: "20px",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: -1,
          },
        }}
      >
        <BottomNavigation
          value={value}
          onChange={(_, newValue) => handleNavigation(newValue)}
          sx={{
            bgcolor: "transparent",
            height: "56px",
            background:
              "linear-gradient(to top, rgba(20, 20, 20, 1) 0%, rgba(20, 20, 20, 0.8) 100%)",
            marginBottom: "env(safe-area-inset-bottom)",
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
            icon={<PersonIcon />}
            sx={{
              "&.Mui-selected .MuiSvgIcon-root": {
                transform: "scale(1.1)",
                transition: "transform 0.2s",
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
          <BottomNavigationAction
            icon={<InfoIcon />}
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

function DesktopNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", sm: "block" },
        "& .MuiDrawer-paper": {
          width: "72px",
          backgroundColor: "#141414",
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: "env(safe-area-inset-top)",
        },
      }}
    >
      <List
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/")}
            selected={location.pathname === "/"}
            sx={{
              minHeight: 48,
              justifyContent: "center",
              "&.Mui-selected": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.12)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                justifyContent: "center",
                color:
                  location.pathname === "/"
                    ? "white"
                    : "rgba(255, 255, 255, 0.5)",
              }}
            >
              <HomeIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/search")}
            selected={location.pathname === "/search"}
            sx={{
              minHeight: 48,
              justifyContent: "center",
              "&.Mui-selected": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.12)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                justifyContent: "center",
                color:
                  location.pathname === "/search"
                    ? "white"
                    : "rgba(255, 255, 255, 0.5)",
              }}
            >
              <SearchIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

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

  const handleSearch = async () => {
    if (query) {
      setIsLoading(true);
      setTimeout(async () => {
        const searchResults = await searchMovies(query);
        setResults(searchResults);
        setIsLoading(false);
        navigate(`/search?query=${encodeURIComponent(query)}`);
      }, 1500); // Задержка в 1.5 секунды
    } else {
      setResults([]);
      navigate("/search");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (!value) {
      setResults([]);
      navigate("/search");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
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
          backgroundColor: "#333",
          borderRadius: "8px",
          p: "2px 4px",
          boxShadow: "0 3px 5px rgba(0,0,0,0.2)",
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, color: "white" }}
          placeholder="Поиск фильмов..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          inputProps={{ "aria-label": "поиск фильмов" }}
        />
        <IconButton
          type="button"
          sx={{ p: "10px", color: "white" }}
          aria-label="search"
          onClick={handleSearch}
        >
          <SearchIcon />
        </IconButton>
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
      {!isLoading && firstMovie && (
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
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 1,
            }}
          />
        </Box>
      )}
      <SearchResults query={query} movies={results} loading={isLoading} />
    </Box>
  );
}

function AppRoutes({ movies, isLoading }: { movies: any; isLoading: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();

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
    <>
      <DesktopNavigation />
      <Box
        sx={{
          ml: { xs: 0, sm: "72px" },
          minHeight: "100dvh",
          pt: "env(safe-area-inset-top)",
          backgroundColor: "#141414",
          position: "relative",
          zIndex: 1,
          overflowX: "hidden",
          overflowY: "auto",
          height: "100dvh",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
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
                      backgroundColor: "#141414",
                      paddingTop: {
                        xs: "calc(100vw * 1.2 + env(safe-area-inset-top) + 16px)",
                        sm: "60vh",
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
                        height: {
                          xs: "calc(100vw * 1.2 + env(safe-area-inset-top))",
                          sm: "60vh",
                        },
                        pointerEvents: "none",
                        zIndex: 1,
                      },
                    }}
                  >
                    <BackdropSlider
                      movies={movies.popular}
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Сейчас смотрят"
                      movies={movies.watchingToday}
                      loading={isLoading}
                      categoryId="now-playing"
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
                      title="Популярное"
                      movies={movies.popular}
                      loading={isLoading}
                      categoryId="popular"
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
              path="/about"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h4">О приложении</Typography>
                  </Box>
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
          </Routes>
        </AnimatePresence>
      </Box>
      <MobileNavigation />
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [movies, setMovies] = useState<{
    watchingToday: Movie[];
    trendingToday: Movie[];
    trendingWeek: Movie[];
    popular: Movie[];
    horror: Movie[];
    action: Movie[];
    comedy: Movie[];
    scifi: Movie[];
    thriller: Movie[];
    western: Movie[];
    drama: Movie[];
    war: Movie[];
    backdrop: Movie[];
    fantasy: Movie[];
    ruMovies: Movie[];
  }>({
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
  });
  const startTimeRef = useRef(Date.now());
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
        });

        setContentLoaded(true);

        const currentTime = Date.now();
        const elapsedTime = currentTime - startTimeRef.current;
        const minDisplayTime = 3000;
        const remainingTime = Math.max(minDisplayTime - elapsedTime, 500);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsLoading(false);
        setContentLoaded(true);
      }
    };

    initializeApp();
  }, []);

  return (
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

            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                  }}
                >
                  <SplashScreen />
                </motion.div>
              )}
            </AnimatePresence>
          </ThemeProvider>
        </CastProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
