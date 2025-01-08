import { useState, useEffect, useCallback } from "react";

export const useScrollBrightness = () => {
  const [brightness, setBrightness] = useState(0);

  const handleScroll = useCallback((event: Event) => {
    const container = event.target as Element;
    const scrollTop = container.scrollTop;

    // Уменьшаем порог до половины для более быстрого затемнения
    const threshold = 300; // Уменьшили порог

    // Используем более агрессивную степень для быстрого достижения максимума
    const ratio = scrollTop / threshold;
    const newBrightness = Math.min(Math.pow(ratio, 2), 0.98); // Увеличили степень для более быстрого затемнения

    setBrightness(newBrightness);
  }, []);

  useEffect(() => {
    const scrollContainer = document.querySelector(".MuiBox-root");

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      const initialScrollTop = scrollContainer.scrollTop;
      const ratio = initialScrollTop / 300;
      const initialBrightness = Math.min(Math.pow(ratio, 2), 0.98);
      setBrightness(initialBrightness);

      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  return brightness;
};
