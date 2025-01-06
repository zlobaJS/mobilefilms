import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Container,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { MovieCard } from "../components/MovieCard";
import { getMovies } from "../api/tmdb";
import { motion } from "framer-motion";

const CATEGORY_TITLES: { [key: string]: string } = {
  "now-playing": "Сейчас смотрят",
  "trending-today": "Сегодня в тренде",
  "trending-week": "За неделю в тренде",
  popular: "Популярное",
  horror: "Ужасы",
  action: "Боевики",
  comedy: "Комедии",
  scifi: "Фантастика",
  thriller: "Триллеры",
  western: "Вестерны",
  drama: "Драмы",
  war: "Военные",
};

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

export const CategoryPage = () => {
  const { categoryId } = useParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, [categoryId]);

  const fetchCategoryMovies = async (pageNumber: number) => {
    try {
      if (pageNumber > 1) {
        setIsLoadingMore(true);
      }
      setLoading(true);
      const data = await getMovies.byCategory(categoryId || "", pageNumber);
      const newMovies = Array.isArray(data.results) ? data.results : [];

      if (pageNumber === 1) {
        setMovies(newMovies);
      } else {
        setMovies((prev) => [...prev, ...newMovies]);
      }

      setHasMore(newMovies.length === 20);
    } catch (error) {
      console.error(error);
      setMovies([]);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const lastMovieRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchCategoryMovies(page);
  }, [page, categoryId]);

  useEffect(() => {
    return () => {
      setMovies([]);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
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
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: "bold",
              color: "white",
            }}
          >
            {CATEGORY_TITLES[categoryId || ""]}
          </Typography>
          <Box sx={{ position: "relative" }}>
            <Grid container spacing={2}>
              {loading && page === 1
                ? [...Array(12)].map((_, index) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                      <Box
                        sx={{
                          aspectRatio: "2/3",
                          bgcolor: "rgba(255,255,255,0.1)",
                          borderRadius: 1,
                        }}
                      >
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height="100%"
                          animation="wave"
                          sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                        />
                      </Box>
                    </Grid>
                  ))
                : movies.map((movie, index) => (
                    <Grid
                      item
                      xs={6}
                      sm={4}
                      md={3}
                      lg={2}
                      key={`${movie.id}-${index}`}
                      ref={
                        index === movies.length - 1 ? lastMovieRef : undefined
                      }
                    >
                      <MovieCard movie={movie} />
                    </Grid>
                  ))}
            </Grid>

            {isLoadingMore && (
              <Box
                sx={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
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
                  <CircularProgress size={60} sx={{ color: "white" }} />
                  <Typography variant="h6" sx={{ color: "white" }}>
                    Загрузка фильмов...
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
};
