import { createTheme } from "@mui/material";
import appConfig from "../configs/app-config.json";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import useAutoMode from "./useAutoMode";
import { RootState } from "../types";

const useTheme = () => {
  const autoMode = useAutoMode();
  const { mode: themeMode, opacity, blur } = useSelector((store: RootState) => store.app);

  const mode = useMemo(
    () => (themeMode === "auto" ? autoMode : themeMode),
    [themeMode, autoMode]
  );

  const { main, paper, ...otherKey } = useMemo(
    () => appConfig.colors.primary[mode as keyof typeof appConfig.colors.primary] as any,
    [mode]
  );

  return createTheme({
    palette: {
      mode: mode as "light" | "dark",
      primary: {
        main: main || appConfig.colors.main,
      },
      background: { ...otherKey, paper },
    },
    customOptions: {
      opacity: Math.round(255 * opacity).toString(16),
      blur: `${blur}px`,
    },
  });
};

export default useTheme;
