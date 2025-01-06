import { StrictMode, useEffect, useState, useRef } from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  BottomNavigation,
  BottomNavigationAction,
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
        setValue(0);
        break;
      case "/search":
        setValue(1);
        break;
      case "/favorites":
        setValue(2);
        break;
      case "/settings":
        setValue(3);
        break;
      case "/about":
        setValue(4);
        break;
      default:
        if (location.pathname.includes("/category")) {
          setValue(0);
        }
    }
  }, [location]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: "env(safe-area-inset-bottom)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "95%",
        maxWidth: "400px",
        zIndex: 1300,
        display: { xs: "block", sm: "none" },
        mb: 2,
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue);
          switch (newValue) {
            case 0:
              navigate("/");
              break;
            case 1:
              navigate("/search");
              break;
            case 2:
              navigate("/favorites");
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
          bgcolor: "rgba(20, 20, 20, 0.7)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          height: "56px",
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            padding: "6px 0",
            color: "rgba(255, 255, 255, 0.5)",
            "&.Mui-selected": {
              color: "white",
            },
            "& .MuiSvgIcon-root": {
              fontSize: "24px",
              transition: "transform 0.2s",
            },
            "&.Mui-selected .MuiSvgIcon-root": {
              transform: "scale(1.1)",
            },
          },
        }}
      >
        <BottomNavigationAction icon={<HomeIcon />} />
        <BottomNavigationAction icon={<SearchIcon />} />
        <BottomNavigationAction icon={<FavoriteIcon />} />
        <BottomNavigationAction icon={<SettingsIcon />} />
        <BottomNavigationAction icon={<InfoIcon />} />
      </BottomNavigation>
    </Box>
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
    setSelectedMovie(movie);
  };

  return (
    <>
      <AnimatePresence mode="sync">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                key="home"
                style={{ minHeight: "100dvh" }}
              >
                <Box
                  sx={{
                    minHeight: "100dvh",
                    backgroundColor: "#141414",
                    paddingTop: "env(safe-area-inset-top)",
                    paddingBottom: "env(safe-area-inset-bottom)",
                    paddingLeft: "env(safe-area-inset-left)",
                    paddingRight: "env(safe-area-inset-right)",
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
        </Routes>
      </AnimatePresence>
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
