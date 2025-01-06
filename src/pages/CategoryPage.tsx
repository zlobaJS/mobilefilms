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
import { getMovies, GENRES } from "../api/tmdb";
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
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, [categoryId]);

  const fetchCategoryMovies = async (pageNumber: number) => {
    console.log(`Fetching category: ${categoryId}, page: ${pageNumber}`);
    try {
      let data;
      switch (categoryId) {
        case "now-playing":
          data = await getMovies.nowPlaying(pageNumber);
          break;
        case "trending-today":
          data = await getMovies.trendingToday(pageNumber);
          break;
        case "trending-week":
          data = await getMovies.trendingWeek(pageNumber);
          break;
        case "popular":
          data = await getMovies.popular(pageNumber);
          break;
        case "horror":
          data = await getMovies.byGenre(GENRES.HORROR, pageNumber);
          console.log("Horror movies data:", data);
          break;
        case "action":
          data = await getMovies.byGenre(GENRES.ACTION, pageNumber);
          console.log("Action movies data:", data);
          break;
        case "comedy":
          data = await getMovies.byGenre(GENRES.COMEDY, pageNumber);
          console.log("Comedy movies data:", data);
          break;
        case "scifi":
          data = await getMovies.byGenre(GENRES.SCIFI, pageNumber);
          console.log("Sci-Fi movies data:", data);
          break;
        case "thriller":
          data = await getMovies.byGenre(GENRES.THRILLER, pageNumber);
          console.log("Thriller movies data:", data);
          break;
        case "western":
          data = await getMovies.byGenre(GENRES.WESTERN, pageNumber);
          console.log("Western movies data:", data);
          break;
        case "drama":
          data = await getMovies.byGenre(GENRES.DRAMA, pageNumber);
          console.log("Drama movies data:", data);
          break;
        case "war":
          data = await getMovies.byGenre(GENRES.WAR, pageNumber);
          console.log("War movies data:", data);
          break;
        default:
          console.error("Unknown category:", categoryId);
          return;
      }

      if (data) {
        console.log(`Category ${categoryId}, Page ${pageNumber} results:`, {
          totalPages: data.total_pages,
          totalResults: data.total_results,
          currentResults: data.results?.length,
          firstMovie: data.results?.[0]?.title,
        });
      }

      if (pageNumber === 1) {
        setMovies(data.results);
      } else {
        setMovies((prev) => [...prev, ...data.results]);
      }

      setHasMore(pageNumber < data.total_pages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching category movies:", error);
      setLoading(false);
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
                    ref={index === movies.length - 1 ? lastMovieRef : undefined}
                  >
                    <MovieCard movie={movie} />
                  </Grid>
                ))}
          </Grid>
          {loading && page > 1 && (
            <Box
              ref={loadingRef}
              sx={{
                display: "flex",
                justifyContent: "center",
                my: 4,
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Container>
      </Box>
    </motion.div>
  );
};
