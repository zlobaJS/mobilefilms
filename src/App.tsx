import { StrictMode, useEffect, useState, useRef } from "react";
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

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#141414",
      paper: "#141414",
    },
  },
});

function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

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

  return (
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
        background:
          "linear-gradient(to top, rgba(20, 20, 20, 1) 0%, rgb(20 20 20 / 93%) 100%)",
        boxShadow: "-4px 5px 72px 16px #39393a",
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue);
          switch (newValue) {
            case 0:
              navigate("/search");
              break;
            case 1:
              navigate("/favorites");
              break;
            case 2:
              navigate("/");
              break;
            case 3:
              navigate("/settings");
              break;
            case 4:
              navigate("/about");
              break;
          }
        }}
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

function AppRoutes() {
  const location = useLocation();
  const mainPageScrollPos = useRef(0);
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
  });
  const [loading, setLoading] = useState(true);
  const [_, setSelectedMovie] = useState<any>(null);

  useEffect(() => {
    if (location.pathname !== "/") {
      mainPageScrollPos.current = window.scrollY;
    }

    if (
      location.pathname.includes("/category") &&
      !window.history.state?.usr?.isBack
    ) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  useEffect(() => {
    const handlePopState = () => {
      if (window.history.state) {
        window.history.state.usr = { isBack: true };
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const [
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
        ] = await Promise.all([
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
        ]);

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
        });
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
      setLoading(false);
    };

    fetchMovies();
  }, []);

  const handleMovieSelect = (movie: any) => {
    setSelectedMovie(null);
    setTimeout(() => {
      setSelectedMovie(movie);
    }, 0);
  };

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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  key="home"
                  style={{
                    minHeight: "100dvh",
                    position: "relative",
                  }}
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
                      loading={loading}
                      categoryId="now-playing"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Сегодня в тренде"
                      movies={movies.trendingToday}
                      loading={loading}
                      categoryId="trending-today"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="За неделю в тренде"
                      movies={movies.trendingWeek}
                      loading={loading}
                      categoryId="trending-week"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Популярное"
                      movies={movies.popular}
                      loading={loading}
                      categoryId="popular"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Ужасы"
                      movies={movies.horror}
                      loading={loading}
                      categoryId="horror"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Боевики"
                      movies={movies.action}
                      loading={loading}
                      categoryId="action"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Комедии"
                      movies={movies.comedy}
                      loading={loading}
                      categoryId="comedy"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Фантастика"
                      movies={movies.scifi}
                      loading={loading}
                      categoryId="scifi"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Триллеры"
                      movies={movies.thriller}
                      loading={loading}
                      categoryId="thriller"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Вестерны"
                      movies={movies.western}
                      loading={loading}
                      categoryId="western"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Драмы"
                      movies={movies.drama}
                      loading={loading}
                      categoryId="drama"
                      onMovieSelect={handleMovieSelect}
                    />
                    <MovieSlider
                      title="Военные"
                      movies={movies.war}
                      loading={loading}
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
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  key="search"
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
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  key="favorites"
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h4">Избранное</Typography>
                  </Box>
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
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
    document.head.appendChild(meta);

    const statusBarMeta = document.createElement("meta");
    statusBarMeta.name = "apple-mobile-web-app-status-bar-style";
    statusBarMeta.content = "black-translucent";
    document.head.appendChild(statusBarMeta);
  }, []);

  return (
    <StrictMode>
      <BrowserRouter>
        <CastProvider>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <AppRoutes />
          </ThemeProvider>
        </CastProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
