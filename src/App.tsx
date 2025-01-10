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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import { MovieSlider } from "./components/MovieSlider";
import { BackdropSlider } from "./components/BackdropSlider";
import { getMovies, GENRES } from "./api/tmdb";
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

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#141414",
      paper: "#141414",
    },
  },
});

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
      case "/settings":
        setValue(3);
        break;
      case "/about":
        setValue(4);
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

    // Плавная прокрутка вверх
    window.scrollTo({ top: 0, behavior: "smooth" });

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
        path = "/settings";
        break;
      case 4:
        path = "/about";
        break;
    }

    navigate(path);

    // Задержка для анимации загрузки
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      {isLoading && (
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 1299,
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
          pb: "env(safe-area-inset-bottom)",
          backgroundColor: "#141414",
          boxShadow: "-4px 5px 72px 16px #39393a",
        }}
      >
        <BottomNavigation
          value={value}
          onChange={(_, newValue) => handleNavigation(newValue)}
          sx={{
            bgcolor: "transparent",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            height: "64px",
            position: "relative",
            "& .MuiBottomNavigationAction-root": {
              minWidth: "auto",
              padding: 0,
              color: "rgba(255, 255, 255, 0.5)",
              transition: "background-color 0.3s",
              "&:focus": {
                outline: "none",
              },
              "&.Mui-focusVisible": {
                outline: "none",
              },
              "&:hover": {
                backgroundColor: "transparent",
              },
              "&.Mui-selected": {
                color: "white",
                backgroundColor: "#0686ee",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "26px",
                transition: "transform 0.2s",
              },
              "&.Mui-selected .MuiSvgIcon-root": {
                transform: "scale(1.1)",
              },
            },
            "& .MuiBottomNavigationAction-root:nth-of-type(2)": {
              marginRight: "52px",
            },
            "& .MuiBottomNavigationAction-root:nth-of-type(4)": {
              marginLeft: "52px",
            },
            "& .MuiBottomNavigationAction-root:nth-of-type(3)": {
              position: "absolute",
              left: "50%",
              top: "-24px",
              transform: "translateX(-50%)",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#141414",
              color: "rgba(255, 255, 255, 0.5)",
              boxShadow: {
                ...(value === 2 && {
                  boxShadow: `
                    0 -4px 12px rgba(6, 134, 238, 0.5),
                    0 0 0 6px rgba(6, 134, 238, 0.1),
                    0 0 0 3px rgba(6, 134, 238, 0.2)
                  `,
                }),
              },
              padding: 0,
              minWidth: "50px",
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-3px",
                left: "-3px",
                right: "-3px",
                bottom: "-3px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at center, rgba(0,132,238,0.2) 0%, transparent 70%)",
                animation: value === 2 ? "pulse 2s infinite" : "none",
              },
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  opacity: 0.8,
                },
                "70%": {
                  transform: "scale(1.3)",
                  opacity: 0,
                },
                "100%": {
                  transform: "scale(1.3)",
                  opacity: 0,
                },
              },
              "&.Mui-selected": {
                backgroundColor: "#0686ee",
                color: "white",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "32px",
                position: "static",
                transform: "none",
                margin: 0,
                filter: "drop-shadow(0 0 4px rgba(255,255,255,0.3))",
              },
            },
          }}
        >
          <BottomNavigationAction icon={<SearchIcon />} />
          <BottomNavigationAction icon={<FavoriteIcon />} />
          <BottomNavigationAction icon={<HomeIcon />} />
          <BottomNavigationAction icon={<SettingsIcon />} />
          <BottomNavigationAction icon={<InfoIcon />} />
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

function AppRoutes({ movies }: { movies: any }) {
  const location = useLocation();
  const [_, setSelectedMovie] = useState<any>(null);

  const handleMovieSelect = useCallback((movie: any) => {
    setSelectedMovie(null);
    setTimeout(() => {
      setSelectedMovie(movie);
    }, 50);
  }, []);

  return (
    <>
      <DesktopNavigation />
      <Box
        sx={{
          ml: { xs: 0, sm: "72px" },
          minHeight: "100dvh",
          position: "relative",
          zIndex: 1,
          overflowX: "hidden",
          overflowY: "auto",
          height: "100dvh",
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
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
                      loading={false}
                      categoryId="now-playing"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Сегодня в тренде"
                      movies={movies.trendingToday}
                      loading={false}
                      categoryId="trending-today"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="За неделю в тренде"
                      movies={movies.trendingWeek}
                      loading={false}
                      categoryId="trending-week"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Популярное"
                      movies={movies.popular}
                      loading={false}
                      categoryId="popular"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Ужасы"
                      movies={movies.horror}
                      loading={false}
                      categoryId="horror"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Боевики"
                      movies={movies.action}
                      loading={false}
                      categoryId="action"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Комедии"
                      movies={movies.comedy}
                      loading={false}
                      categoryId="comedy"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Фантастика"
                      movies={movies.scifi}
                      loading={false}
                      categoryId="scifi"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Фэнтези"
                      movies={movies.fantasy}
                      loading={false}
                      categoryId="fantasy"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Триллеры"
                      movies={movies.thriller}
                      loading={false}
                      categoryId="thriller"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Вестерны"
                      movies={movies.western}
                      loading={false}
                      categoryId="western"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Драмы"
                      movies={movies.drama}
                      loading={false}
                      categoryId="drama"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Военные"
                      movies={movies.war}
                      loading={false}
                      categoryId="war"
                      onMovieSelect={handleMovieSelect}
                    />
                  </Box>
                </motion.div>
              }
            />
            <Route
              path="/category/:categoryId"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  key="category"
                >
                  <CategoryPage />
                </motion.div>
              }
            />
            <Route
              path="/search"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h4">Поиск</Typography>
                  </Box>
                </motion.div>
              }
            />
            <Route
              path="/favorites"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FavoritesPage />
                </motion.div>
              }
            />
            <Route
              path="/settings"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  key="settings"
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h4">Настройки</Typography>
                  </Box>
                </motion.div>
              }
            />
            <Route
              path="/about"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  key="about"
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  key="keyword"
                >
                  <KeywordPage />
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
  });
  const startTimeRef = useRef(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Загружаем все данные
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
        ]);

        const backdropMovies = backdropData.results.slice(0, 5);

        // 2. Устанавливаем данные
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
        });

        // 3. Ждем пока контент отрендерится
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 4. Предварительно загружаем изображения для backdrop
        await Promise.all(
          backdropMovies.map((movie: { backdrop_path: string }) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.src = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
        );

        // 5. Вычисляем оставшееся время для splash screen
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTimeRef.current;
        const minDisplayTime = 3000;
        const remainingTime = Math.max(minDisplayTime - elapsedTime, 500);

        // 6. Ждем оставшееся время и скрываем splash
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.style.visibility = "visible";
          }
          setIsLoading(false);
        }, remainingTime);
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsLoading(false);
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
            {/* Рендерим контент сразу, но скрываем его */}
            <div
              ref={contentRef}
              style={{
                visibility: isLoading ? "hidden" : "visible",
                position: isLoading ? "fixed" : "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <AppRoutes movies={movies} />
            </div>

            {/* Показываем splash поверх контента */}
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
