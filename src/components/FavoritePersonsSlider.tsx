import { Box, Typography, IconButton } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { imageUrl } from "../api/tmdb";
import DeleteIcon from "@mui/icons-material/Delete";

interface FavoritePersonsSliderProps {
  persons: Array<{
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string;
  }>;
  onPersonSelect?: (personId: number) => void;
  onRemoveFromFavorites?: (personId: number) => void;
  showRemoveButtons?: boolean;
  showTitle?: boolean;
}

export const FavoritePersonsSlider = ({
  persons,
  onPersonSelect,
  onRemoveFromFavorites,
  showRemoveButtons = false,
  showTitle = false,
}: FavoritePersonsSliderProps) => {
  return (
    <Box sx={{ mb: 4 }}>
      {showTitle && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "white",
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            mb: 2,
            mx: 2,
          }}
        >
          Избранные персоны
        </Typography>
      )}
      <Swiper
        modules={[FreeMode]}
        slidesPerView="auto"
        spaceBetween={16}
        freeMode
        style={{ padding: "0 16px" }}
      >
        {persons.map((person) => (
          <SwiperSlide
            key={person.id}
            style={{ width: "150px", position: "relative" }}
          >
            <Box
              onClick={() => onPersonSelect?.(person.id)}
              sx={{
                cursor: "pointer",
                position: "relative",
                "&:hover": {
                  "& .MuiTypography-root": {
                    color: "#0686ee",
                  },
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "2/3",
                  borderRadius: 2,
                  overflow: "hidden",
                  mb: 1,
                }}
              >
                <Box
                  component="img"
                  src={imageUrl(person.profile_path, "w342")}
                  alt={person.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  color: "white",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  transition: "color 0.2s",
                }}
              >
                {person.name}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "0.8rem",
                  textAlign: "center",
                }}
              >
                {person.known_for_department}
              </Typography>
            </Box>
            {showRemoveButtons && onRemoveFromFavorites && (
              <IconButton
                onClick={() => onRemoveFromFavorites(person.id)}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <DeleteIcon sx={{ color: "white", fontSize: "1.2rem" }} />
              </IconButton>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
