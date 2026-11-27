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
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Logo } from "../layout/Logo";

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
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          color: "#f6f3ea",
          background:
            "radial-gradient(1200px 600px at 10% 110%, rgba(224,165,72,.35), transparent 60%), linear-gradient(160deg,#1f4a28 0%,#2f6b3a 60%,#3f7a47 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Logo size={40} />
          <Typography variant="h6" sx={{ color: "inherit" }}>
            AgroSence
          </Typography>
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: "inherit", maxWidth: 420, lineHeight: 1.2, mb: 2 }}>
            Tend the platform that tends the farms.
          </Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 420 }}>
            Manage schemes, resources, marketplace listings and the community from one place.
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Staff access only
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Paper
          component="form"
          onSubmit={submit}
          noValidate
          elevation={0}
          sx={{ width: "100%", maxWidth: 400, p: { xs: 3, sm: 4 }, border: 1, borderColor: "divider" }}
        >
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1, mb: 2 }}>
            <Logo size={32} />
            <Typography variant="h6">AgroSence</Typography>
          </Box>
          <Typography variant="h5" gutterBottom>
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
            sx={{ mt: 1, py: 1.2 }}
          >
            {busy ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
