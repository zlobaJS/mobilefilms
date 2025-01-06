import { useRef, useEffect } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface KinoboxPlayerProps {
  tmdbId: number;
  title?: string;
  onMediaUrl?: (url: string) => void;
  onClose?: () => void;
}

export const KinoboxPlayer = ({
  tmdbId,
  title,
  onMediaUrl,
  onClose,
}: KinoboxPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://kinobox.tv/kinobox.min.js";
    script.async = true;

    script.onload = () => {
      if (containerRef.current && window.kbox) {
        window.kbox(containerRef.current, {
          search: {
            tmdb: tmdbId,
            title: title,
          },
          menu: {
            enabled: false,
          },
          players: {
            alloha: { enable: true, position: 1 },
            kodik: { enable: false },
            videocdn: { enable: false },
          },
          events: {
            playerLoaded: (status: boolean) => {
              if (!status && title) {
                window.kbox(containerRef.current!, {
                  search: { query: title },
                  menu: { enabled: false },
                  players: {
                    alloha: { enable: true, position: 1 },
                    kodik: { enable: false },
                    videocdn: { enable: false },
                  },
                });
              }
            },
          },
          options: {
            loader: true,
            theme: "dark",
            priority: ["alloha"],
            autoplay: true,
          },
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [tmdbId, title, onMediaUrl]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100dvh",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "#000",
          zIndex: 1300,
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      />
      <IconButton
        onClick={onClose}
        sx={{
          position: "fixed",
          top: "env(safe-area-inset-top, 16px)",
          right: "env(safe-area-inset-right, 16px)",
          zIndex: 1400,
          color: "white",
          bgcolor: "rgba(0,0,0,0.5)",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.7)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>
    </>
  );
};
