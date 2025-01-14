import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";
import { MovieCard } from "../components/MovieCard";
import { getMoviesByStudio } from "../api/tmdb";
import { MovieDetails } from "../components/MovieDetails";

export const StudioMoviesPage = () => {
  const { studioName } = useParams<{ studioName: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setInitialLoading(true);
    setContentVisible(false);
  }, [studioName]);

  const fetchStudioMovies = async (pageNumber: number) => {
    const startTime = Date.now();

    try {
      setIsLoadingMore(pageNumber > 1);
      setLoading(true);

      if (!studioName) return;
      const decodedStudioName = decodeURIComponent(studioName);
      const data = await getMoviesByStudio(decodedStudioName, pageNumber);
      const newMovies = data.results || [];

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
      fetchStudioMovies(page);
    }
  }, [page, studioName]);

  useEffect(() => {
    return () => {
      setMovies([]);
    };
  }, []);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
  };

  const handlePersonSelect = useCallback(
    (personId: number) => {
      navigate(`/person/${personId}`);
    },
    [navigate]
  );

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
              Загрузка фильмов...
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
              paddingTop: "max(1rem, env(safe-area-inset-top))",
            }}
          >
            <Container maxWidth="xl">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <IconButton
                  onClick={() => navigate(-1)}
                  sx={{
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    fontWeight: "500",
                  }}
                >
                  Фильмы студии {decodeURIComponent(studioName || "")}
                </Typography>
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
                            showTitle={true}
                            onClick={() => handleMovieClick(movie)}
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
        onClose={() => setSelectedMovie(null)}
        isPage={false}
        onPersonSelect={handlePersonSelect}
      />
    </>
  );
};
