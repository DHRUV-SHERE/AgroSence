import { useState } from "react";
import type { FormEvent } from "react";
import { Title, useNotify, useGetIdentity } from "react-admin";
import { Alert, Box, Button, Card, CardContent, CardHeader, Chip, TextField, Typography } from "@mui/material";
import { ApiError, request, session } from "../api/http";
import type { ApiUser } from "../api/types";
import { fmtDate } from "../format";

const pwRule = (p: string) => (p.length < 8 ? "At least 8 characters" : !/[A-Za-z]/.test(p) || !/\d/.test(p) ? "Use letters and numbers" : "");

const AccountCard = () => {
  const notify = useNotify();
  const { refetch } = useGetIdentity();
  const [user, setUser] = useState<ApiUser | null>(session.getUser());
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    mobile: user?.mobile ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const errors = {
    name: form.name.trim().length < 2 ? "Name is required" : "",
    email: !/^\S+@\S+\.\S+$/.test(form.email) ? "Enter a valid email" : "",
    mobile: !/^\d{10}$/.test(form.mobile) ? "Enter a 10-digit mobile number" : "",
  };
  const valid = !errors.name && !errors.email && !errors.mobile;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setErr(null);
    try {
      const { data } = await request<ApiUser>("/auth/me", { method: "PUT", json: form });
      // Role never comes from the form; keep the server's value.
      session.setUser(data);
      setUser(data);
      await refetch();
      notify("Profile updated", { type: "success" });
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Could not update profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" component="form" onSubmit={submit} noValidate>
      <CardHeader
        title="My account"
        subheader={user ? `Member since ${fmtDate(user.createdAt)}` : undefined}
        action={user && <Chip label={user.role} color="primary" variant="outlined" sx={{ textTransform: "capitalize" }} />}
      />
      <CardContent sx={{ display: "grid", gap: 2 }}>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} helperText={errors.name || " "} />
        <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={!!errors.email} helperText={errors.email || " "} />
        <TextField label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} error={!!errors.mobile} helperText={errors.mobile || " "} />
        <Box>
          <Button type="submit" variant="contained" disabled={busy || !valid}>
            {busy ? "Saving..." : "Save changes"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const PasswordCard = () => {
  const notify = useNotify();
  const [f, setF] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const errors = {
    currentPassword: f.currentPassword ? "" : "Required",
    newPassword: f.newPassword ? pwRule(f.newPassword) : "",
    confirm: f.confirm && f.confirm !== f.newPassword ? "Passwords do not match" : "",
  };
  const valid = f.currentPassword && f.newPassword && f.confirm && !errors.newPassword && !errors.confirm;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setErr(null);
    try {
      await request("/auth/me/password", {
        method: "PUT",
        json: { currentPassword: f.currentPassword, newPassword: f.newPassword },
      });
      setF({ currentPassword: "", newPassword: "", confirm: "" });
      notify("Password changed", { type: "success" });
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Could not change password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" component="form" onSubmit={submit} noValidate>
      <CardHeader title="Change password" />
      <CardContent sx={{ display: "grid", gap: 2 }}>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField label="Current password" type="password" autoComplete="current-password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} helperText=" " />
        <TextField label="New password" type="password" autoComplete="new-password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} error={!!errors.newPassword} helperText={errors.newPassword || "8+ characters with letters and numbers"} />
        <TextField label="Confirm new password" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} error={!!errors.confirm} helperText={errors.confirm || " "} />
        <Box>
          <Button type="submit" variant="contained" disabled={busy || !valid}>
            {busy ? "Updating..." : "Update password"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const Profile = () => (
  <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1000 }}>
    <Title title="My account" />
    <Typography variant="h5" sx={{ mb: 2 }}>
      My account
    </Typography>
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "start" }}>
      <AccountCard />
      <PasswordCard />
    </Box>
  </Box>
);

export default Profile;
