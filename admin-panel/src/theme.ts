import { defaultTheme } from "react-admin";
import type { RaThemeOptions } from "react-admin";

const fontBody = '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const fontDisplay = '"Fraunces", Georgia, "Times New Roman", serif';

const shared: Pick<RaThemeOptions, "typography" | "shape" | "components"> = {
  typography: {
    fontFamily: fontBody,
    h4: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-0.01em" },
    h6: { fontFamily: fontDisplay, fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    ...defaultTheme.components,
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.02em" } },
    },
    MuiAppBar: { styleOverrides: { root: { boxShadow: "none" } } },
  },
};

export const lightTheme: RaThemeOptions = {
  ...defaultTheme,
  ...shared,
  palette: {
    mode: "light",
    primary: { main: "#2f6b3a", light: "#5b9a63", dark: "#1f4a28", contrastText: "#fff" },
    secondary: { main: "#b7791f", light: "#e0a548", dark: "#8a5714", contrastText: "#fff" },
    background: { default: "#f6f3ea", paper: "#fffdf8" },
    text: { primary: "#1f2a1f", secondary: "#5a665a" },
    divider: "#e4dfd0",
    error: { main: "#b3392f" },
    success: { main: "#3a7d44" },
    warning: { main: "#c9892b" },
    info: { main: "#2d6e86" },
  },
};

export const darkTheme: RaThemeOptions = {
  ...defaultTheme,
  ...shared,
  palette: {
    mode: "dark",
    primary: { main: "#7fc088", light: "#a6d6ac", dark: "#4f8f59", contrastText: "#0f1a10" },
    secondary: { main: "#e0a548", light: "#f0c27a", dark: "#b7791f", contrastText: "#1c1304" },
    background: { default: "#121a14", paper: "#1a251c" },
    text: { primary: "#e8efe6", secondary: "#a2b0a1" },
    divider: "#2c3a2e",
    error: { main: "#ef7b70" },
    success: { main: "#7fc088" },
    warning: { main: "#e0a548" },
    info: { main: "#6fb6cf" },
  },
};

/** Categorical chart colours that work on both themes. */
export const chartColors = ["#3a7d44", "#c9892b", "#2d6e86", "#b3392f", "#7a6aa8", "#8a8f3a"];
