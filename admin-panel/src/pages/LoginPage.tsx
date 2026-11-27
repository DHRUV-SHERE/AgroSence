import { useState } from "react";
import type { FormEvent } from "react";
import { useLogin, useNotify } from "react-admin";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Logo } from "../layout/Logo";
import art from "../assets/auth-login.webp";

const LoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const idInvalid = touched && identifier.trim().length < 3;
  const pwInvalid = touched && password.length < 1;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (identifier.trim().length < 3 || !password) return;
    setBusy(true);
    setError(null);
    try {
      await login({ identifier, password });
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : "Sign in failed. Please try again.";
      setError(msg);
      notify(msg, { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 0.9fr) minmax(0, 1.1fr)" },
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          p: 6,
          color: "#f4faf6",
          bgcolor: "#0f2419",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${art})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.7,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgb(15 36 25 / 0.92), rgb(15 36 25 / 0.2) 60%)",
          },
          "& > *": { position: "relative", zIndex: 1 },
        }}
      >
        <Logo size={40} light />
        <Box>
          <Typography variant="h3" component="p" sx={{ color: "#f4faf6", maxWidth: "16ch", lineHeight: 1.15, mb: 2, fontSize: "2.4rem" }}>
            Run the platform behind every farm.
          </Typography>
          <Typography sx={{ color: "#dbe8e0", maxWidth: 420 }}>
            Manage schemes, resources, marketplace listings and the community from one place.
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "#c6d6cc" }}>
          Staff access only
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Box
          component="form"
          onSubmit={submit}
          noValidate
          sx={{ width: "100%", maxWidth: 448, p: { xs: 0, sm: 2 } }}
        >
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4 }}>
            <Logo size={36} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin sign in
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Use your administrator or moderator account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {error}
            </Alert>
          )}

          <TextField
            label="Email or mobile"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={idInvalid}
            helperText={idInvalid ? "Enter your email or 10-digit mobile number" : " "}
            autoComplete="username"
            autoFocus
            fullWidth
            disabled={busy}
          />
          <TextField
            label="Password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={pwInvalid}
            helperText={pwInvalid ? "Password is required" : " "}
            autoComplete="current-password"
            fullWidth
            disabled={busy}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={show ? "Hide password" : "Show password"}
                      onClick={() => setShow((s) => !s)}
                      edge="end"
                    >
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={busy}
            sx={{ mt: 1 }}
          >
            {busy ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
