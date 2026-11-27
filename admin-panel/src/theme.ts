import { defaultTheme } from "react-admin";
import type { RaThemeOptions } from "react-admin";

/**
 * Design tokens mirror agrosence/src/styles/tokens.css (the website is the source of truth).
 * Keep values in sync with it; do not invent new colours here.
 */
export const tokens = {
  light: {
    paper: "#f5f8f6",
    paper2: "#ebf0ed",
    surface: "#ffffff",
    surface2: "#f9fbfa",
    ink: "#0f1f17",
    ink2: "#43544a",
    ink3: "#5c6d63",
    line: "#d9e2dc",
    lineStrong: "#b9c6bd",
    primary: "#1b6b3a",
    primaryHover: "#14552d",
    primarySoft: "#dcefe3",
    onPrimary: "#ffffff",
    amber: "#d99a0b",
    amberSoft: "#fcefc9",
    leaf: "#2d7a3e",
    leafSoft: "#dff1e3",
    info: "#2456a4",
    infoSoft: "#e0eaf7",
    danger: "#b42318",
    dangerSoft: "#fadedb",
    focus: "#2456a4",
    shadow1: "0 1px 2px rgb(15 31 23 / 0.07), 0 1px 1px rgb(15 31 23 / 0.04)",
    shadow2: "0 4px 12px -2px rgb(15 31 23 / 0.10), 0 2px 4px rgb(15 31 23 / 0.05)",
    shadow3: "0 18px 40px -12px rgb(15 31 23 / 0.22), 0 6px 12px -4px rgb(15 31 23 / 0.08)",
  },
  dark: {
    paper: "#0c1511",
    paper2: "#14211b",
    surface: "#111c16",
    surface2: "#172620",
    ink: "#e8f1ec",
    ink2: "#b4c4ba",
    ink3: "#8fa197",
    line: "#243229",
    lineStrong: "#355044",
    primary: "#4cc27a",
    primaryHover: "#66d08e",
    primarySoft: "#14301f",
    onPrimary: "#06180e",
    amber: "#f0b93a",
    amberSoft: "#33290c",
    leaf: "#7fd39a",
    leafSoft: "#14301f",
    info: "#8db4ee",
    infoSoft: "#162842",
    danger: "#ff8f84",
    dangerSoft: "#3d1a17",
    focus: "#8db4ee",
    shadow1: "0 1px 2px rgb(0 0 0 / 0.4)",
    shadow2: "0 4px 12px -2px rgb(0 0 0 / 0.5)",
    shadow3: "0 18px 40px -12px rgb(0 0 0 / 0.65)",
  },
} as const;

const fontStack =
  '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const APPBAR_H = 56;
export const ROW_H = 52;

export const R = { sm: 6, md: 10, lg: 14 } as const;

type Tok = { [K in keyof (typeof tokens)["light"]]: string };

const build = (mode: "light" | "dark"): RaThemeOptions => {
  const t: Tok = tokens[mode];
  const dark = mode === "dark";
  const heading = { fontFamily: fontStack, fontWeight: 700, letterSpacing: "-0.015em", color: t.ink };
  const ring = { outline: `2px solid ${t.focus}`, outlineOffset: 2 };

  return {
    ...defaultTheme,
    palette: {
      mode,
      primary: { main: t.primary, dark: t.primaryHover, light: dark ? t.primaryHover : "#3f8d5b", contrastText: t.onPrimary },
      secondary: { main: t.amber, contrastText: "#0f1f17" },
      background: { default: t.paper, paper: t.surface },
      text: { primary: t.ink, secondary: t.ink2, disabled: t.ink3 },
      divider: t.line,
      error: { main: t.danger, contrastText: dark ? "#2a0a07" : "#ffffff" },
      warning: { main: t.amber, contrastText: "#0f1f17" },
      info: { main: t.info, contrastText: dark ? "#07162d" : "#ffffff" },
      success: { main: t.leaf, contrastText: dark ? "#06180e" : "#ffffff" },
      action: { hover: t.paper2, selected: t.primarySoft, focus: t.primarySoft },
    },
    typography: {
      fontFamily: fontStack,
      h1: heading,
      h2: heading,
      h3: heading,
      h4: { ...heading, fontSize: "1.75rem" },
      h5: { ...heading, fontSize: "1.375rem" },
      h6: { ...heading, fontSize: "1.0625rem" },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
    },
    shape: { borderRadius: R.md },
    sidebar: { width: 256, closedWidth: 72 },
    components: {
      ...defaultTheme.components,
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: t.paper, color: t.ink, fontFamily: fontStack, WebkitFontSmoothing: "antialiased" },
          "::selection": { background: t.primarySoft },
          ":focus-visible": ring,
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: R.md, fontWeight: 600, textTransform: "none", "&.Mui-focusVisible": ring },
          sizeMedium: { minHeight: 40, paddingInline: 18 },
          sizeSmall: { minHeight: 32, paddingInline: 12 },
          sizeLarge: { minHeight: 46, paddingInline: 24 },
          contained: { boxShadow: t.shadow1, "&:hover": { boxShadow: t.shadow2 } },
          containedPrimary: { "&:hover": { backgroundColor: t.primaryHover } },
          outlined: { borderColor: t.lineStrong, "&:hover": { backgroundColor: t.paper2, borderColor: t.lineStrong } },
          text: { "&:hover": { backgroundColor: t.paper2 } },
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: R.md, "&.Mui-focusVisible": ring } } },
      MuiLink: { styleOverrides: { root: { color: t.primary, fontWeight: 500, textUnderlineOffset: 3 } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { borderRadius: R.lg, border: `1px solid ${t.line}`, boxShadow: t.shadow1, backgroundColor: t.surface },
        },
      },
      MuiCardHeader: { styleOverrides: { title: { fontWeight: 700 } } },
      MuiAppBar: {
        defaultProps: { color: "inherit", elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            color: t.ink,
            boxShadow: "none",
            borderBottom: `1px solid ${t.line}`,
            backgroundImage: "none",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: R.md,
            backgroundColor: t.surface,
            "& fieldset": { borderColor: t.lineStrong },
            "&:hover fieldset": { borderColor: t.ink3 },
            "&.Mui-focused fieldset": { borderColor: t.focus, borderWidth: 2 },
            "&.Mui-error fieldset": { borderColor: t.danger },
          },
          input: { "&::placeholder": { color: t.ink3, opacity: 1 } },
        },
      },
      MuiFilledInput: {
        styleOverrides: { root: { borderRadius: R.md, backgroundColor: t.paper2, "&:before,&:after": { display: "none" } } },
      },
      MuiInputLabel: { styleOverrides: { root: { color: t.ink2, "&.Mui-focused": { color: t.focus } } } },
      MuiFormHelperText: { styleOverrides: { root: { color: t.ink2 } } },
      MuiTextField: { defaultProps: { variant: "outlined" } },
      MuiCheckbox: { styleOverrides: { root: { color: t.ink3, "&.Mui-checked": { color: t.primary } } } },
      MuiSwitch: {
        styleOverrides: { switchBase: { "&.Mui-checked + .MuiSwitch-track": { backgroundColor: t.primary, opacity: 0.9 } } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottomColor: t.line, paddingBlock: 10 },
          head: {
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: t.ink2,
            backgroundColor: t.surface2,
            borderBottom: `1px solid ${t.lineStrong}`,
            whiteSpace: "nowrap",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&.RaDatagrid-row:nth-of-type(even)": { backgroundColor: t.surface2 },
            "&.RaDatagrid-clickableRow:hover, &.MuiTableRow-hover:hover": { backgroundColor: t.primarySoft },
            "&.Mui-selected": { backgroundColor: t.primarySoft },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: R.sm, fontWeight: 600, fontSize: "0.78rem" },
          filledSuccess: { backgroundColor: t.leafSoft, color: dark ? t.leaf : "#1e5a2b" },
          filledWarning: { backgroundColor: t.amberSoft, color: dark ? t.amber : "#6b4a00" },
          filledError: { backgroundColor: t.dangerSoft, color: dark ? t.danger : "#8a1a10" },
          filledInfo: { backgroundColor: t.infoSoft, color: dark ? t.info : "#1b4285" },
          filledPrimary: { backgroundColor: t.primarySoft, color: dark ? t.primary : "#14552d" },
          outlined: { borderColor: t.lineStrong },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: R.md, alignItems: "center" },
          standardSuccess: { backgroundColor: t.leafSoft, color: dark ? t.leaf : "#1e5a2b" },
          standardWarning: { backgroundColor: t.amberSoft, color: dark ? t.amber : "#6b4a00" },
          standardError: { backgroundColor: t.dangerSoft, color: dark ? t.danger : "#8a1a10" },
          standardInfo: { backgroundColor: t.infoSoft, color: dark ? t.info : "#1b4285" },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            borderRadius: R.md,
            backgroundColor: dark ? t.surface2 : "#0f2419",
            color: dark ? t.ink : "#f4faf6",
            boxShadow: t.shadow3,
          },
        },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: R.lg, boxShadow: t.shadow3, border: `1px solid ${t.line}` } } },
      MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700, fontSize: "1.125rem" } } },
      MuiBackdrop: { styleOverrides: { root: { backgroundColor: dark ? "rgb(0 0 0 / 0.65)" : "rgb(15 31 23 / 0.55)" } } },
      MuiMenu: { styleOverrides: { paper: { borderRadius: R.md, border: `1px solid ${t.line}`, boxShadow: t.shadow2 } } },
      MuiMenuItem: { styleOverrides: { root: { borderRadius: R.sm, marginInline: 4, "&.Mui-selected": { backgroundColor: t.primarySoft } } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: dark ? t.surface2 : "#0f2419",
            color: dark ? t.ink : "#f4faf6",
            borderRadius: R.sm,
            fontSize: "0.78rem",
          },
        },
      },
      MuiTabs: { styleOverrides: { indicator: { backgroundColor: t.primary, height: 3, borderRadius: 3 } } },
      MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
      MuiDivider: { styleOverrides: { root: { borderColor: t.line } } },
      MuiTablePagination: { styleOverrides: { root: { color: t.ink2 } } },
      // react-admin components
      // ---- App shell: AppBar + sidebar fixed, only the content region (and list tables) scroll ----
      RaLayout: {
        styleOverrides: {
          root: {
            height: "100dvh",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
            "& .RaLayout-appFrame": {
              flexGrow: 0,
              marginTop: APPBAR_H,
              height: `calc(100dvh - ${APPBAR_H}px)`,
              minHeight: 0,
              minWidth: 0,
            },
            "& .RaLayout-contentWithSidebar": { minHeight: 0, minWidth: 0, overflow: "hidden", flex: "1 1 0" },
            "& .RaLayout-content": {
              padding: 0,
              backgroundColor: t.paper,
              minWidth: 0,
              minHeight: 0,
              overflowX: "hidden",
              overflowY: "auto",
              paddingInline: 12,
              paddingBottom: 12,
            },
          },
        },
      },
      RaAppBar: {
        styleOverrides: {
          root: { height: APPBAR_H, "& .RaAppBar-toolbar": { minHeight: APPBAR_H, height: APPBAR_H } },
        },
      },
      RaSidebar: {
        styleOverrides: {
          root: {
            height: "100%",
            flexShrink: 0,
            "& .MuiDrawer-paper": { backgroundColor: t.surface2, borderRight: `1px solid ${t.line}`, color: t.ink2, height: "100%" },
            "& .RaSidebar-fixed": {
              position: "relative",
              height: "100%",
              width: "100%",
              overflowX: "hidden",
              overflowY: "auto",
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": { display: "block", width: 6 },
            },
            "& .MuiDrawer-docked, & .MuiDrawer-paperAnchorDockedLeft": { height: "100%" },
          },
        },
      },
      RaList: {
        styleOverrides: {
          root: {
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            "& .RaList-main": { minHeight: 0, minWidth: 0 },
            "& .RaList-actions": { flexShrink: 0 },
            "& .RaList-content": {
              flex: "1 1 auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "visible",
            },
            "& .MuiTablePagination-root": { flexShrink: 0 },
          },
        },
      },
      RaMenuItemLink: {
        styleOverrides: {
          root: {
            borderRadius: R.md,
            margin: "1px 12px",
            paddingBlock: 8,
            color: t.ink2,
            fontWeight: 500,
            borderLeft: "none",
            "& .RaMenuItemLink-icon": { color: "inherit", minWidth: 36 },
            "&:hover": { backgroundColor: t.paper2, color: t.ink },
            "&.RaMenuItemLink-active": {
              backgroundColor: dark ? t.primarySoft : t.ink,
              color: dark ? t.primary : t.paper,
              fontWeight: 600,
              borderLeft: "none",
              "& .RaMenuItemLink-icon": { color: "inherit" },
              "&:hover": { backgroundColor: dark ? t.primarySoft : t.ink, color: dark ? t.primary : t.paper },
            },
          },
        },
      },
      RaDatagrid: {
        styleOverrides: {
          root: {
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            "& .RaDatagrid-tableWrapper": {
              flex: "1 1 auto",
              minHeight: 0,
              overflow: "auto",
              overscrollBehavior: "contain",
              borderRadius: `${R.lg}px`,
            },
            "& .RaDatagrid-table": { width: "100%" },
            "& .RaDatagrid-headerCell": {
              backgroundColor: t.surface2,
              color: t.ink2,
              position: "sticky",
              top: 0,
              zIndex: 2,
              boxShadow: `inset 0 -1px 0 ${t.lineStrong}`,
            },
            "& .RaDatagrid-clickableRow": { cursor: "pointer" },
            // compact fixed-height rows; text never wraps, long text is cut with an ellipsis
            "& .RaDatagrid-rowCell": {
              height: ROW_H,
              maxWidth: 320,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              paddingBlock: 6,
            },
            "& .RaDatagrid-headerCell, & .RaDatagrid-rowCell.RaDatagrid-checkbox, & .RaDatagrid-checkbox": { whiteSpace: "nowrap" },
            "& .RaDatagrid-rowCell.RaDatagrid-checkbox, & .RaDatagrid-headerCell.RaDatagrid-checkbox": { width: 48, maxWidth: 48, padding: "0 0 0 4px" },
            "& .RaDatagrid-rowCell .MuiButton-root": { whiteSpace: "nowrap" },
          },
        },
      },
      RaTopToolbar: { styleOverrides: { root: { gap: 4 } } },
      RaToolbar: { styleOverrides: { root: { backgroundColor: "transparent" } } },
    },
  };
};

export const lightTheme: RaThemeOptions = build("light");
export const darkTheme: RaThemeOptions = build("dark");

/** Categorical chart colours from the site's tokens (green, amber, blue, danger, violet, leaf). */
export const chartPalette = (mode: "light" | "dark") => {
  const t = tokens[mode];
  return [t.primary, t.amber, t.info, t.danger, mode === "dark" ? "#b9a6f0" : "#6a4fb3", t.leaf];
};
