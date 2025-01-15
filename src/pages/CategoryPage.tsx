import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Container,
  CircularProgress,
  Skeleton,
  Button,
} from "@mui/material";
import { MovieCard } from "../components/MovieCard";
import { getMovies, getMoviesByKeyword } from "../api/tmdb";
import { motion } from "framer-motion";
import { MovieDetails } from "../components/MovieDetails";

const CATEGORY_TITLES: { [key: string]: string } = {
  "now-playing": "Сейчас смотрят",
  "trending-today": "Сегодня в тренде",
  "trending-week": "За неделю в тренде",
  popular: "Популярное",
  horror: "Ужасы",
  action: "Боевики",
  comedy: "Комедии",
  scifi: "Фантастика",
  fantasy: "Фэнтези",
  thriller: "Триллеры",
  western: "Вестерны",
  drama: "Драмы",
  war: "Военные",
  "ru-movies": "Российские фильмы",
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

interface CategoryPageProps {
  categoryType?: "regular" | "keyword";
  categoryId?: string;
  title?: string;
}

export const CategoryPage = ({
  categoryType = "regular",
  categoryId: propsCategoryId,
  title,
}: CategoryPageProps) => {
  const { categoryId: paramsCategoryId } = useParams();
  const navigate = useNavigate();

  // Определяем effectiveCategoryId в начале компонента
  const effectiveCategoryId = propsCategoryId || paramsCategoryId;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Сбрасываем состояние пагинации при изменении effectiveCategoryId
  useEffect(() => {
    setPage(1);
    setMovies([]);
    setHasMore(true);
  }, [effectiveCategoryId]);

  // Добавляем ref для последнего элемента
  const observer = useRef<IntersectionObserver>();
  const lastMovieRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading || isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setIsLoadingMore(true);
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, isLoadingMore, hasMore]
  );

  useEffect(() => {
    const fetchMovies = async () => {
      // Устанавливаем loading только для первой загрузки
      if (page === 1) {
        setLoading(true);
      }

      try {
        let response;
        if (effectiveCategoryId) {
          if (categoryType === "keyword") {
            console.log("Fetching keyword movies:", effectiveCategoryId);
            response = await getMoviesByKeyword(
              Number(effectiveCategoryId),
              page
            );
          } else {
            response = await getMovies.byCategory(
              effectiveCategoryId,
              page,
              sortBy
            );
          }
        }
        if (response?.results) {
          if (page === 1) {
            setMovies(response.results);
          } else {
            setMovies((prev) => [...prev, ...response.results]);
          }
          setHasMore(response.results.length === 20);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        navigate("/");
      } finally {
        setLoading(false);
        setIsLoadingMore(false); // Сбрасываем флаг загрузки
        if (page === 1) {
          setTimeout(() => setContentVisible(true), 100);
        }
      }
    };

    if (effectiveCategoryId) {
      fetchMovies();
    }
  }, [effectiveCategoryId, page, categoryType, sortBy, navigate]);

  const handleMovieSelect = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
  }, []);

  const handleDialogClose = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  const handlePersonSelect = useCallback(
    (personId: number) => {
      navigate(`/person/${personId}`);
    },
    [navigate]
  );

  const handleSortChange = useCallback(
    (event: { target: { value: string } }) => {
      setSortBy(event.target.value);
    },
    []
  );

  // Используем title из пропсов если он есть
  const categoryTitle = title || CATEGORY_TITLES[effectiveCategoryId || ""];

  return (
    <>
      {loading ? (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#141414",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
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
              Загрузка категории...
            </Typography>
          </Box>
        </Box>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: contentVisible ? 1 : 0 }}
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
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  mb: 4,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: "1.75rem", sm: "2.125rem" },
                  }}
                >
                  {categoryTitle}
                </Typography>

                {effectiveCategoryId === "ru-movies" && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 1,
                      mx: -1,
                      px: 1,
                      pb: 1,
                      mt: -1,
                      pt: 1,
                      "& .MuiButton-root": {
                        mb: 1,
                        flex: { xs: "1 1 auto", sm: "0 1 auto" },
                        minWidth: { xs: "calc(50% - 8px)", sm: "auto" },
                        maxWidth: { xs: "calc(50% - 8px)", sm: "none" },
                      },
                    }}
                  >
                    <Button
                      variant={
                        sortBy === "popularity.desc" ? "contained" : "outlined"
                      }
                      onClick={() =>
                        handleSortChange({
                          target: { value: "popularity.desc" },
                        })
                      }
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        minWidth: "auto",
                        whiteSpace: "nowrap",
                        px: 2,
                        py: 0.75,
                        fontSize: "0.875rem",
                        backgroundColor:
                          sortBy === "popularity.desc"
                            ? "primary.main"
                            : "transparent",
                        borderColor: "rgba(255, 255, 255, 0.23)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          backgroundColor:
                            sortBy === "popularity.desc"
                              ? "primary.dark"
                              : "rgba(255, 255, 255, 0.08)",
                        },
                      }}
                    >
                      По популярности
                    </Button>
                    <Button
                      variant={
                        sortBy === "primary_release_date.desc"
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() =>
                        handleSortChange({
                          target: { value: "primary_release_date.desc" },
                        })
                      }
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        minWidth: "auto",
                        whiteSpace: "nowrap",
                        px: 2,
                        py: 0.75,
                        fontSize: "0.875rem",
                        backgroundColor:
                          sortBy === "primary_release_date.desc"
                            ? "primary.main"
                            : "transparent",
                        borderColor: "rgba(255, 255, 255, 0.23)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          backgroundColor:
                            sortBy === "primary_release_date.desc"
                              ? "primary.dark"
                              : "rgba(255, 255, 255, 0.08)",
                        },
                      }}
                    >
                      Сначала новые
                    </Button>
                    <Button
                      variant={
                        sortBy === "primary_release_date.asc"
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() =>
                        handleSortChange({
                          target: { value: "primary_release_date.asc" },
                        })
                      }
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        minWidth: "auto",
                        whiteSpace: "nowrap",
                        px: 2,
                        py: 0.75,
                        fontSize: "0.875rem",
                        backgroundColor:
                          sortBy === "primary_release_date.asc"
                            ? "primary.main"
                            : "transparent",
                        borderColor: "rgba(255, 255, 255, 0.23)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          backgroundColor:
                            sortBy === "primary_release_date.asc"
                              ? "primary.dark"
                              : "rgba(255, 255, 255, 0.08)",
                        },
                      }}
                    >
                      Сначала старые
                    </Button>
                  </Box>
                )}
              </Box>
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
                            index === movies.length - 1
                              ? lastMovieRef
                              : undefined
                          }
                        >
                          <MovieCard
                            movie={movie}
                            onClick={() => handleMovieSelect(movie)}
                            showTitle={true}
                          />
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
      )}
      <MovieDetails
        movie={selectedMovie}
        open={!!selectedMovie}
        onClose={handleDialogClose}
        isPage={false}
        onPersonSelect={handlePersonSelect}
        onMovieSelect={(movieId: number) => navigate(`/movie/${movieId}`)}
      />
    </>
  );
};
