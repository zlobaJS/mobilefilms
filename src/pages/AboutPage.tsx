import { Box, Typography, Paper, Divider, Button } from "@mui/material";
import { motion } from "framer-motion";
import { changelog } from "./ChangelogPage";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";

export const AboutPage = () => {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      sx={{
        p: 3,
        maxWidth: 800,
        mx: "auto",
        mb: { xs: 7, sm: 0 },
        pt: { xs: "calc(env(safe-area-inset-top) + 16px)", sm: 3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "center", sm: "flex-start" },
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 1,
          }}
        >
          <MovieFilterIcon
            sx={{
              fontSize: { xs: 40, sm: 48 },
              color: "#0686ee",
            }}
          />
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2.125rem" },
              letterSpacing: "-0.5px",
            }}
          >
            Movie App
          </Typography>
        </Box>
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: { xs: "1rem", sm: "1.1rem" },
            textAlign: { xs: "center", sm: "left" },
            maxWidth: "600px",
            lineHeight: 1.6,
            mt: 2,
          }}
        >
          Современное приложение для просмотра информации о фильмах, сериалах и
          актерах. Используется база данных TMDB для предоставления актуальной
          информации о кино.
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "rgba(0, 0, 0, 0.4)",
          borderRadius: 2,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <Typography
            sx={{
              color: "white",
              fontSize: { xs: "1.1rem", sm: "1.2rem" },
              fontWeight: 500,
              background: "linear-gradient(90deg, #fff, rgba(255,255,255,0.7))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Версия {changelog[0].version}
          </Typography>
          <Button
            onClick={() => setShowChangelog(!showChangelog)}
            endIcon={showChangelog ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{
              color: "#0686ee",
              textTransform: "none",
              fontSize: "0.95rem",
              background: "rgba(6, 134, 238, 0.1)",
              borderRadius: "8px",
              px: 2,
              "&:hover": {
                background: "rgba(6, 134, 238, 0.2)",
              },
            }}
          >
            {showChangelog ? "Скрыть изменения" : "История изменений"}
          </Button>
        </Box>

        {showChangelog && (
          <Box sx={{ mb: 3 }}>
            {changelog.map((entry) => (
              <Box
                key={entry.version}
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  Версия {entry.version}
                  <Typography
                    component="span"
                    sx={{
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "0.9rem",
                      ml: 1,
                    }}
                  >
                    •{" "}
                    {new Date(entry.date).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Typography>
                <Box component="ul" sx={{ color: "#888", pl: 2, m: 0 }}>
                  {entry.changes.map((change, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: "12px",
                        color: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.95rem",
                          lineHeight: 1.5,
                          fontWeight: 400,
                        }}
                      >
                        {change.description}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Divider
          sx={{
            mb: 3,
            bgcolor: "rgba(255, 255, 255, 0.05)",
            "&::before, &::after": {
              borderColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontSize: { xs: "1.1rem", sm: "1.2rem" },
            fontWeight: 500,
            mb: 2,
            background: "linear-gradient(90deg, #fff, rgba(255,255,255,0.7))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Основные возможности
        </Typography>
        <Box
          component="ul"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            pl: 2,
            "& li": {
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              mb: 1,
              position: "relative",
              listStyle: "none",
              pl: 2,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "#0686ee",
              },
              "&:hover": {
                color: "white",
                "&::before": {
                  backgroundColor: "#fff",
                },
              },
              transition: "all 0.2s ease",
            },
          }}
        >
          <li>Просмотр популярных фильмов</li>
          <li>Умный поиск по названию</li>
          <li>Информация об актерах</li>
          <li>Просмотр трейлеров</li>
          <li>Избранное и история просмотров</li>
          <li>Рейтинги и рекомендации</li>
        </Box>
      </Paper>
    </Box>
  );
};
