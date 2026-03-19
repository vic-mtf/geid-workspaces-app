import { useCallback, useEffect, useState } from "react";

const darkThemeMediaquery = window.matchMedia("(prefers-color-scheme: dark)");

export default function useAutoMode(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">(
    darkThemeMediaquery.matches ? "dark" : "light"
  );

  const handleChange = useCallback(
    (event: MediaQueryListEvent) => setMode(event.matches ? "dark" : "light"),
    []
  );

  useEffect(() => {
    darkThemeMediaquery.addEventListener("change", handleChange);
    return () => darkThemeMediaquery.removeEventListener("change", handleChange);
  }, [handleChange]);

  return mode;
}
