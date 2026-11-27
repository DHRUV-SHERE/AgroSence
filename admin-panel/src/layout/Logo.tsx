import { Box } from "@mui/material";

export const Logo = ({ size = 32 }: { size?: number }) => (
  <Box
    component="svg"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    role="img"
    aria-label="AgroSence"
    sx={{ flexShrink: 0 }}
  >
    <rect width="32" height="32" rx="9" fill="#2f6b3a" />
    <path d="M16 25V13" stroke="#f6f3ea" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 15c0-4 2.5-6.5 7-6.5 0 4-2.5 6.5-7 6.5Z" fill="#e0a548" />
    <path d="M16 19c0-3.2-2-5.2-6-5.2 0 3.2 2 5.2 6 5.2Z" fill="#f6f3ea" />
  </Box>
);
