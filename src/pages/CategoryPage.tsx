import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
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
  title: propsTitle,
}: CategoryPageProps) => {
  const params = useParams();
  const routeCategoryId = params.categoryId;

  const finalCategoryId = propsCategoryId || routeCategoryId;
  const finalTitle = propsTitle || CATEGORY_TITLES[finalCategoryId || ""];

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [sortBy, setSortBy] = useState<string>("popularity.desc");

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setInitialLoading(true);
    setContentVisible(false);
  }, [finalCategoryId, sortBy]);

  const fetchCategoryMovies = async (pageNumber: number) => {
    const startTime = Date.now();

    try {
      setIsLoadingMore(pageNumber > 1);
      setLoading(true);

      let data;
      if (categoryType === "keyword" && finalCategoryId) {
        data = await getMoviesByKeyword(Number(finalCategoryId), pageNumber);
      } else {
        data = await getMovies.byCategory(
          finalCategoryId || "",
          pageNumber,
          sortBy
        );
      }

      const newMovies = Array.isArray(data.results) ? data.results : [];

      if (pageNumber === 1) {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1000 - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        setMovies(newMovies);
      } else {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        setMovies((prev) => [...prev, ...newMovies]);
      }

      setHasMore(newMovies.length === 20);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setInitialLoading(false);
      setTimeout(() => {
        setContentVisible(true);
      }, 300);
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
    if (page > 0) {
      fetchCategoryMovies(page);
    }
  }, [page, finalCategoryId, categoryType, sortBy]);

  useEffect(() => {
    return () => {
      setMovies([]);
    };
  }, []);

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
    setPage(1);
    setMovies([]);
    setHasMore(true);
  };

  return (
    <>
      {initialLoading ? (
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
                  {finalTitle}
                </Typography>

                {finalCategoryId === "ru-movies" && (
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
      )}
    </>
  );
};
