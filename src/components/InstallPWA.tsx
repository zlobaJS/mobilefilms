import { useState, useEffect } from "react";
import { Box, Button, Snackbar, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GetAppIcon from "@mui/icons-material/GetApp";

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Проверяем, установлено ли уже приложение
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isInstallDeclined = localStorage.getItem("pwa-install-declined");

    if (!isStandalone && !isInstallDeclined) {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallBanner(true);
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
      } else {
        localStorage.setItem("pwa-install-declined", "true");
      }
      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa-install-declined", "true");
  };

  return (
    <Snackbar
      open={showInstallBanner}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        mb: "calc(56px + env(safe-area-inset-bottom))",
        "& .MuiPaper-root": {
          bgcolor: "rgba(6, 134, 238, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          maxWidth: "90%",
        },
      }}
      message={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GetAppIcon />
          Установить приложение
        </Box>
      }
      action={
        <>
          <Button
            color="inherit"
            size="small"
            onClick={handleInstall}
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            Установить
          </Button>
          <IconButton size="small" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      }
    />
  );
};
