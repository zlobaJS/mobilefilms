import { useState, useEffect, useCallback } from "react";

export const useScrollBrightness = () => {
  const [brightness, setBrightness] = useState(0);

  const handleScroll = useCallback((event: Event) => {
    const container = event.target as Element;
    const scrollTop = container.scrollTop;
    const threshold = 300; // Порог прокрутки

    // Используем более агрессивную формулу для достижения полного затемнения
    const ratio = Math.min(scrollTop / threshold, 1);
    const newBrightness = Math.min(Math.pow(ratio, 1.5), 1); // Изменили максимум на 1 (полное затемнение)

    setBrightness(newBrightness);
  }, []);

  useEffect(() => {
    const scrollContainer = document.querySelector(".MuiBox-root");

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      // Устанавливаем начальное значение
      const initialScrollTop = scrollContainer.scrollTop;
      const ratio = Math.min(initialScrollTop / 300, 1);
      const initialBrightness = Math.min(Math.pow(ratio, 1.5), 1);
      setBrightness(initialBrightness);

      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  return brightness;
};
