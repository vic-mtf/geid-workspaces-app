import { alpha, createTheme, Theme } from "@mui/material";
import appConfig from "@/configs/app-config.json";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import useAutoMode from "@/utils/useAutoMode";
import MuiDialogTransition from "@/components/MuiDialogTransition";
import { RootState } from "@/types";

declare module "@mui/material/styles" {
  interface Theme {
    customOptions: { opacity: string; blur: string };
  }
  interface ThemeOptions {
    customOptions?: { opacity?: string; blur?: string };
  }
}

const MuiBase = createTheme();

const useTheme = (): Theme => {
  const autoMode = useAutoMode();
  const { mode: themeMode, opacity, blur } = useSelector((store: RootState) => store.app);

  const mode = useMemo<"light" | "dark">(
    () => (themeMode === "auto" ? autoMode : (themeMode as "light" | "dark")),
    [themeMode, autoMode]
  );

  const { main, paper, ...otherKey } = useMemo(
    () => (appConfig.colors.primary as any)[mode] ?? (appConfig.colors.primary as any)["dark"],
    [mode]
  );

  const opacityHex = useMemo(
    () => Math.round(255 * opacity).toString(16).padStart(2, "0"),
    [opacity]
  );

  return useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main },
          background: { ...otherKey, paper },
        },
        customOptions: {
          opacity: opacityHex,
          blur: `${blur}px`,
        },
        components: {
          MuiButton: {
            defaultProps: { size: "small", disableElevation: true },
            styleOverrides: {
              root: { textTransform: "none" },
            },
          },
          MuiTypography: {
            defaultProps: { variant: "body2", color: "text.primary", component: "div" },
          },
          MuiChip: {
            styleOverrides: {
              root: { borderRadius: MuiBase.shape.borderRadius },
            },
          },
          MuiAvatar: {
            defaultProps: { variant: "rounded" },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: MuiBase.shape.borderRadius,
                "& .MuiTouchRipple-root span": { borderRadius: MuiBase.shape.borderRadius },
              },
            },
          },
          MuiMenu: {
            defaultProps: {
              transformOrigin: { horizontal: "left", vertical: "top" },
              anchorOrigin: { horizontal: "right", vertical: "bottom" },
              onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
            },
            styleOverrides: {
              paper: { border: "1px solid", borderColor: "divider" },
              root: {
                "& .MuiBackdrop-root": { backdropFilter: "none" },
              },
            },
          },
          MuiPopover: {
            styleOverrides: {
              paper: { border: "1px solid", borderColor: "divider" },
            },
          },
          MuiAutocomplete: {
            styleOverrides: {
              paper: { border: "1px solid", borderColor: "divider" },
            },
          },
          MuiDialog: {
            defaultProps: {
              TransitionComponent: MuiDialogTransition,
              PaperProps: {
                sx: {
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                },
              },
            },
            styleOverrides: {
              root: ({ theme: t }) => ({
                "& .MuiBackdrop-root": {
                  backgroundColor: (t as Theme).palette.background.paper + opacityHex,
                  backdropFilter: `blur(${blur}px)`,
                },
              }),
            },
          },
          MuiModal: {
            styleOverrides: {
              root: {
                "& .MuiBackdrop-root": {
                  backdropFilter: `blur(${blur}px)`,
                  backgroundColor: alpha(paper, 0.2),
                },
              },
            },
          },
          MuiBackdrop: {
            styleOverrides: {
              root: { userSelect: "none", "& *": { userSelect: "none" } },
            },
          },
          MuiTextField: {
            defaultProps: { variant: "outlined", size: "small" },
          },
          MuiSelect: {
            defaultProps: { size: "small" },
          },
          MuiFormControl: {
            defaultProps: { size: "small" },
          },
          MuiPaper: {
            styleOverrides: {
              root: { backgroundImage: "none" },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: { borderRadius: MuiBase.shape.borderRadius },
            },
          },
          MuiTooltip: {
            defaultProps: { arrow: true },
          },
          MuiSwitch: {
            defaultProps: { size: "small" },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              },
            },
          },
        },
      }),
    [mode, main, paper, opacity, blur, otherKey, opacityHex]
  );
};

export default useTheme;
