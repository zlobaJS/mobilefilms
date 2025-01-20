import {
  Box,
  Container,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { toggleAutoplayTrailer } from "../store/settingsSlice";

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const autoplayTrailer = useSelector(
    (state: RootState) => state.settings.autoplayTrailer
  );

  return (
    <Box
      sx={{
        bgcolor: "#141414",
        minHeight: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        pt: {
          xs: "calc(env(safe-area-inset-top) + 16px)",
          sm: 2,
        },
        pb: {
          xs: "calc(56px + env(safe-area-inset-bottom))",
          sm: 2,
        },
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flex: 1,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: "white",
              fontSize: { xs: "1.75rem", sm: "2.125rem" },
              fontWeight: 600,
              mb: 2,
            }}
          >
            Настройки
          </Typography>

          <Paper
            elevation={0}
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  fontWeight: 500,
                  mb: 2,
                }}
              >
                Трейлеры
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={autoplayTrailer}
                    onChange={() => dispatch(toggleAutoplayTrailer())}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#0686ee",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#0686ee",
                        },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography
                      sx={{
                        color: "white",
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        fontWeight: 500,
                      }}
                    >
                      Автовоспроизведение трейлеров
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        mt: 0.5,
                      }}
                    >
                      Автоматически воспроизводить трейлеры при открытии
                      информации о фильме
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
