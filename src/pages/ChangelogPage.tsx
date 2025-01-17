import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: "added" | "fixed" | "improved" | "removed";
    description: string;
  }[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "1.0.4",
    date: "2024-03-20",
    changes: [
      {
        type: "added",
        description: "Добавлен рейтинг фильмов по количеству голосов",
      },
      {
        type: "improved",
        description: "Улучшена производительность загрузки данных",
      },
      {
        type: "fixed",
        description: "Исправлено отображение дат релиза",
      },
    ],
  },
  {
    version: "1.0.3",
    date: "2024-03-15",
    changes: [
      {
        type: "added",
        description: "Добавлена страница с информацией об актерах",
      },
      {
        type: "added",
        description: "Добавлен просмотр трейлеров фильмов",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "2024-03-01",
    changes: [
      {
        type: "added",
        description: "Запуск приложения с основным функционалом",
      },
      {
        type: "added",
        description: "Главная страница с подборками популярных фильмов",
      },
      {
        type: "added",
        description: "Умный поиск фильмов с автодополнением",
      },
      {
        type: "added",
        description:
          "Детальная информация о фильмах (рейтинг, описание, жанры)",
      },
      {
        type: "added",
        description: "Система избранного с локальным сохранением",
      },
      {
        type: "added",
        description: "Отслеживание просмотренных фильмов",
      },
      {
        type: "added",
        description: "Категории фильмов (популярное, в тренде, по жанрам)",
      },
      {
        type: "added",
        description: "Информация о съемочной группе и актерском составе",
      },
      {
        type: "added",
        description: "Адаптивный дизайн для мобильных устройств",
      },
      {
        type: "added",
        description: "Анимации переходов между страницами",
      },
      {
        type: "added",
        description: "Темная тема оформления",
      },
      {
        type: "added",
        description: "Возрастные рейтинги и информация о релизах",
      },
      {
        type: "added",
        description: "Интеграция с TMDB API",
      },
    ],
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "added":
      return "#4CAF50";
    case "fixed":
      return "#2196F3";
    case "improved":
      return "#FF9800";
    case "removed":
      return "#F44336";
    default:
      return "#757575";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "added":
      return "Добавлено";
    case "fixed":
      return "Исправлено";
    case "improved":
      return "Улучшено";
    case "removed":
      return "Удалено";
    default:
      return type;
  }
};

const VersionCard = ({
  entry,
  index,
}: {
  entry: ChangelogEntry;
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.5,
        delay: index * 0.2,
        ease: "easeOut",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "rgba(255, 255, 255, 0.05)",
          borderRadius: 2,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "bold",
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              Версия {entry.version}
            </Typography>
            {entry.version === "1.0.0" && (
              <Chip
                label="Релиз"
                size="small"
                sx={{
                  bgcolor: "#0686ee",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            )}
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            {new Date(entry.date).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }} />

        <List>
          {entry.changes.map((change, changeIndex) => (
            <ListItem
              key={changeIndex}
              sx={{
                px: 0,
                py: 1,
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={getTypeLabel(change.type)}
                      size="small"
                      sx={{
                        bgcolor: getTypeColor(change.type),
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "90px",
                      }}
                    />
                    <Typography
                      sx={{
                        color: "white",
                        fontSize: { xs: "0.9rem", sm: "0.95rem" },
                        lineHeight: 1.5,
                      }}
                    >
                      {change.description}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </motion.div>
  );
};

export const ChangelogPage = () => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        p: 3,
        maxWidth: 800,
        mx: "auto",
        mb: { xs: 7, sm: 0 },
        pt: { xs: "calc(env(safe-area-inset-top) + 16px)", sm: 3 },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: "white",
            fontWeight: "bold",
            textAlign: { xs: "center", sm: "left" },
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
          }}
        >
          История изменений
        </Typography>
      </motion.div>

      {changelog.map((entry, index) => (
        <VersionCard key={entry.version} entry={entry} index={index} />
      ))}
    </Box>
  );
};
