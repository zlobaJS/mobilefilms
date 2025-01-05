import { StrictMode, useEffect, useState, useRef } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { MovieSlider } from "./components/MovieSlider";
import { BackdropSlider } from "./components/BackdropSlider";
import { getMovies, GENRES } from "./api/tmdb";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CategoryPage } from "./pages/CategoryPage";
import CastProvider from "react-chromecast";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#141414",
    },
  },
});

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
            >
              <Box sx={{ minHeight: "100vh", backgroundColor: "#141414" }}>
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
  );
}

function App() {
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
