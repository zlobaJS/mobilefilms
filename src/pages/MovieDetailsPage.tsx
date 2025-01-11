import { MovieDetails } from "../components/MovieDetails";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { getMovieDetails } from "../api/tmdb";

export const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = () => {
    navigate(-1);
  };

  // Добавим эффект для проверки существования фильма
  useEffect(() => {
    const checkMovie = async () => {
      try {
        const movieExists = await getMovieDetails(Number(id));
        if (!movieExists) {
          navigate("/");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking movie:", error);
        navigate("/");
      }
    };

    if (id) {
      checkMovie();
    }
  }, [id, navigate]);

  if (isLoading) {
    return null;
  }

  return (
    <Box sx={{ height: "100vh", overflow: "hidden" }}>
      <MovieDetails
        movieId={Number(id)}
        open={true}
        onClose={handleClose}
        isPage={true}
      />
    </Box>
  );
};
