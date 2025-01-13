import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Grid,
  Button,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import {
  imageUrl,
  getPersonDetails,
  getPersonMovieCredits,
  getPersonImages,
} from "../api/tmdb";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import { MovieCard } from "./MovieCard";
import * as Flags from "country-flag-icons/react/3x2";

interface PersonDetailsProps {
  personId: number;
  open: boolean;
  onClose: () => void;
  onMovieSelect?: (movieId: number) => void;
}

const countryTranslations: { [key: string]: string } = {
  "United States of America": "США",
  "United States": "США",
  "United Kingdom": "Великобритания",
  Russia: "Россия",
  France: "Франция",
  Germany: "Германия",
  Italy: "Италия",
  Spain: "Испания",
  Australia: "Австралия",
  // ... добавьте другие страны по необходимости
};

const translateCountry = (englishName: string): string => {
  return countryTranslations[englishName] || englishName;
};

const getCountryCode = (placeName: string): string | null => {
  const countryMapping: { [key: string]: string } = {
    "United States": "US",
    USA: "US",
    "United Kingdom": "GB",
    Russia: "RU",
    France: "FR",
    Germany: "DE",
    Italy: "IT",
    Spain: "ES",
    Australia: "AU",
    // ... добавьте другие страны
  };

  for (const [country, code] of Object.entries(countryMapping)) {
    if (placeName.includes(country)) {
      return code;
    }
  }
  return null;
};

export const PersonDetails = ({
  personId,
  open,
  onClose,
  onMovieSelect,
}: PersonDetailsProps) => {
  const [details, setDetails] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpandedBiography, setIsExpandedBiography] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (open && personId) {
        setLoading(true);
        const [personDetails, movieCredits, personImages] = await Promise.all([
          getPersonDetails(personId),
          getPersonMovieCredits(personId),
          getPersonImages(personId),
        ]);
        setDetails(personDetails);
        setCredits(movieCredits);
        setImages(personImages);
        setLoading(false);
      }
    };

    fetchData();
  }, [personId, open]);

  if (!open) return null;

  if (loading) {
    return (
      <Dialog
        open={open}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: "#141414",
            backgroundImage: "none",
          },
        }}
      >
        <Backdrop
          open={true}
          sx={{
            backgroundColor: "#141414",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: "#21CBF3",
            }}
          />
          <Typography
            sx={{
              color: "white",
              fontSize: "1.2rem",
            }}
          >
            Загрузка персоны...
          </Typography>
        </Backdrop>
      </Dialog>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleMovieClick = (movieId: number) => {
    onClose();
    onMovieSelect?.(movieId);
  };

  const getPersonRole = (details: any, credits: any) => {
    if (!details || !credits) return "";

    const roles = new Set<string>();

    credits.crew?.forEach((work: any) => {
      if (work.job === "Director") roles.add("Режиссер");
      if (work.job === "Screenplay" || work.job === "Writer")
        roles.add("Сценарист");
      if (work.job === "Producer" && work.department === "Production")
        roles.add("Продюсер");
    });

    if (credits.cast?.length > 0) roles.add("Актер");

    return Array.from(roles).join(", ");
  };

  const getZodiacSign = (date: string) => {
    const day = new Date(date).getDate();
    const month = new Date(date).getMonth() + 1;

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Овен";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
      return "Телец";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
      return "Близнецы";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Рак";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Лев";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Дева";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
      return "Весы";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
      return "Скорпион";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
      return "Стрелец";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
      return "Козерог";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
      return "Водолей";
    return "Рыбы";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: "#141414",
          backgroundImage: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", minHeight: "100vh" }}>
        {/* Header */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            background: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            pt: 0,
            px: { xs: 2, sm: 4 },
            pb: 4,
          }}
        >
          <Grid container spacing={3}>
            {/* Фото */}
            <Grid
              item
              xs={12}
              sm={4}
              md={3}
              sx={{
                mt: 0,
                pt: "0 !important",
              }}
            >
              <Box
                sx={{
                  borderRadius: { xs: 0, sm: 2 },
                  overflow: "hidden",
                  aspectRatio: {
                    xs: "16/18",
                    sm: "2/3",
                  },
                  position: "relative",
                  width: { xs: "100vw", sm: "100%" },
                  ml: { xs: -2, sm: 0 },
                  mr: { xs: -2, sm: 0 },
                  mb: { xs: 2, sm: 0 },
                  mt: { xs: "-64px", sm: 0 },
                }}
              >
                <Box
                  component="img"
                  src={imageUrl(details.profile_path, "w780")}
                  alt={details.name}
                  sx={{
                    width: "100%",
                    height: "130%",
                    objectFit: "cover",
                    objectPosition: "center 12%",
                    transform: "translateY(-15%)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "70%",
                    background:
                      "linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(20,20,20,1) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </Box>
            </Grid>

            {/* Информация */}
            <Grid item xs={12} sm={8} md={9}>
              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                  color: "white",
                  textAlign: { xs: "center", sm: "left" },
                  fontSize: { xs: "2rem", sm: "2.125rem" },
                  mt: { xs: -8, sm: 0 },
                  position: { xs: "relative", sm: "static" },
                  zIndex: { xs: 1, sm: "auto" },
                }}
              >
                {details.name}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  flexWrap: "wrap",
                  gap: "8px",
                  mb: 2,
                  color: "#888",
                  fontSize: "1rem",
                }}
              >
                <Typography component="span">
                  {getPersonRole(details, credits)}
                </Typography>
                <Typography component="span">•</Typography>
                <Typography component="span">
                  {details.gender === 1 ? "женский" : "мужской"}
                </Typography>
                {details.birthday && (
                  <>
                    <Typography component="span">•</Typography>
                    <Typography component="span">
                      {formatDate(details.birthday)} •{" "}
                      {getZodiacSign(details.birthday)}
                    </Typography>
                  </>
                )}
                {details.place_of_birth && (
                  <>
                    <Typography component="span">•</Typography>
                    <Typography
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {(() => {
                        const countryCode = getCountryCode(
                          details.place_of_birth
                        );
                        const CountryFlag =
                          countryCode && (Flags as any)[countryCode];
                        return CountryFlag ? (
                          <Box
                            component="span"
                            sx={{
                              width: "16px",
                              display: "inline-block",
                              verticalAlign: "middle",
                            }}
                          >
                            <CountryFlag />
                          </Box>
                        ) : null;
                      })()}
                      {details.place_of_birth
                        .split(",")
                        .map((part: string, index: number, array: string[]) => {
                          const translatedPart = translateCountry(part.trim());
                          return index === array.length - 1
                            ? translatedPart
                            : `${translatedPart}, `;
                        })}
                    </Typography>
                  </>
                )}
              </Box>

              {details.biography && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      color: "#fff",
                      opacity: 0.7,
                      lineHeight: 1.6,
                      textAlign: "left",
                    }}
                  >
                    {isExpandedBiography
                      ? details.biography
                      : details.biography.slice(0, 200)}
                    {details.biography.length > 200 && (
                      <Button
                        onClick={() =>
                          setIsExpandedBiography(!isExpandedBiography)
                        }
                        sx={{
                          color: "#21CBF3",
                          textTransform: "none",
                          minWidth: "auto",
                          padding: "0 0 0 8px",
                          fontSize: "inherit",
                          fontWeight: "normal",
                          "&:hover": {
                            background: "transparent",
                            color: "#2196F3",
                          },
                          textDecoration: "none",
                          verticalAlign: "baseline",
                        }}
                      >
                        {isExpandedBiography ? " Свернуть" : " Подробнее"}
                      </Button>
                    )}
                  </Typography>
                </Box>
              )}

              {/* Известные работы */}
              {(credits?.cast?.length > 0 || credits?.crew?.length > 0) && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: "#888", mb: 2 }}>
                    Известные работы
                  </Typography>
                  <Swiper
                    modules={[FreeMode]}
                    slidesPerView="auto"
                    spaceBetween={16}
                    freeMode
                  >
                    {[...(credits.cast || []), ...(credits.crew || [])]
                      .reduce((unique: any[], movie: any) => {
                        // Убираем дубликаты фильмов
                        const exists = unique.find((m) => m.id === movie.id);
                        if (!exists) {
                          unique.push(movie);
                        }
                        return unique;
                      }, [])
                      .sort((a: any, b: any) => b.popularity - a.popularity)
                      .slice(0, 20)
                      .map((movie: any) => (
                        <SwiperSlide key={movie.id} style={{ width: "150px" }}>
                          <MovieCard
                            movie={movie}
                            showTitle={true}
                            onClick={() => handleMovieClick(movie.id)}
                          />
                        </SwiperSlide>
                      ))}
                  </Swiper>
                </Box>
              )}

              {(credits?.cast?.length > 0 || credits?.crew?.length > 0) && (
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#888" }}>
                      Полная фильмография
                    </Typography>
                    <Typography
                      sx={{
                        color: "#666",
                        fontSize: "0.9rem",
                      }}
                    >
                      {(() => {
                        const uniqueMovies = [
                          ...(credits.cast || []),
                          ...(credits.crew || []),
                        ]
                          .filter((movie: any) => movie && movie.id) // Проверяем наличие id
                          .reduce((unique: any[], movie: any) => {
                            if (!unique.some((m) => m.id === movie.id)) {
                              unique.push(movie);
                            }
                            return unique;
                          }, []);
                        return `${uniqueMovies.length} фильмов`;
                      })()}
                    </Typography>
                  </Box>
                  <Swiper
                    modules={[FreeMode]}
                    slidesPerView="auto"
                    spaceBetween={16}
                    freeMode
                    watchSlidesProgress={true}
                    observer={true}
                    observeParents={true}
                  >
                    {[...(credits.cast || []), ...(credits.crew || [])]
                      .filter(
                        (movie: any) => movie && movie.id && movie.release_date
                      )
                      .reduce((unique: any[], movie: any) => {
                        if (!unique.some((m) => m.id === movie.id)) {
                          unique.push(movie);
                        }
                        return unique;
                      }, [])
                      .sort((a: any, b: any) => {
                        const dateA = new Date(a.release_date || 0).getTime();
                        const dateB = new Date(b.release_date || 0).getTime();
                        return dateB - dateA;
                      })
                      .map((movie: any) => (
                        <SwiperSlide key={movie.id} style={{ width: "150px" }}>
                          <Box sx={{ mb: 2 }}>
                            <MovieCard
                              movie={movie}
                              showTitle={true}
                              onClick={() => handleMovieClick(movie.id)}
                            />
                            {(movie.character || movie.job) && (
                              <Typography
                                sx={{
                                  color: "#888",
                                  fontSize: "0.8rem",
                                  mt: 1,
                                  textAlign: "center",
                                }}
                              >
                                {movie.character || movie.job}
                              </Typography>
                            )}
                            {movie.release_date && (
                              <Typography
                                sx={{
                                  color: "#666",
                                  fontSize: "0.8rem",
                                  textAlign: "center",
                                }}
                              >
                                {new Date(movie.release_date).getFullYear()}
                              </Typography>
                            )}
                          </Box>
                        </SwiperSlide>
                      ))}
                  </Swiper>
                </Box>
              )}

              {/* Галерея */}
              {images.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: "#888", mb: 2 }}>
                    Фотографии
                  </Typography>
                  <Swiper
                    modules={[FreeMode]}
                    slidesPerView="auto"
                    spaceBetween={16}
                    freeMode
                  >
                    {images.map((image, index) => (
                      <SwiperSlide key={index} style={{ width: "200px" }}>
                        <Box
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            aspectRatio: "2/3",
                          }}
                        >
                          <Box
                            component="img"
                            src={imageUrl(image.file_path, "w342")}
                            alt={`${details.name} photo ${index + 1}`}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
};
