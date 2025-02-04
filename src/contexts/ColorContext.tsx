import { createContext, useContext } from "react";

interface ColorScheme {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
}

export const ColorContext = createContext<ColorScheme | null>(null);

export const useColors = () => {
  const colors = useContext(ColorContext);
  if (!colors) {
    throw new Error("useColors must be used within a ColorProvider");
  }
  return colors;
};
