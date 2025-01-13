import { useParams } from "react-router-dom";
import { PersonDetails } from "../components/PersonDetails";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const PersonPage = () => {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleMovieSelect = useCallback(
    (movieId: number) => {
      navigate(`/movie/${movieId}`);
    },
    [navigate]
  );

  return (
    <PersonDetails
      personId={Number(personId)}
      open={true}
      onClose={handleClose}
      onMovieSelect={handleMovieSelect}
    />
  );
};
