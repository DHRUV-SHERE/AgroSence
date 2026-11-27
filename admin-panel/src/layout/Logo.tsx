import { Box } from "@mui/material";
import logo from "../assets/logo-96.webp";

/** Same mark + wordmark as the website (Brand.jsx): "Agro" in ink, "Sense" in primary green. */
export const Logo = ({ size = 32, light = false, showText = true }: { size?: number; light?: boolean; showText?: boolean }) => (
  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, flexShrink: 0 }} aria-label="AgroSense">
    <Box
      component="img"
      src={logo}
      alt=""
      width={size}
      height={size}
      sx={{ width: size, height: size, borderRadius: "10px", display: "block" }}
    />
    {showText && (
      <Box
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: size * 0.6,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: light ? "#ffffff" : "text.primary",
          "& b": { color: light ? "#d99a0b" : "primary.main", fontWeight: 700 },
        }}
      >
        Agro<b>Sense</b>
      </Box>
    )}
  </Box>
);
