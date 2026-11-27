"use strict";
const crypto = require("crypto");

// .env is only loaded outside tests and when not explicitly skipped (dev:memory skips it so a
// developer machine can never accidentally touch the production database).
if (process.env.NODE_ENV !== "test" && !process.env.AGRO_SKIP_DOTENV) {
  require("dotenv").config();
}

const bool = (v, def = false) => (v === undefined || v === "" ? def : ["1", "true", "yes", "on"].includes(String(v).toLowerCase()));
const int = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};
const list = (v) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);

const nodeEnv = process.env.NODE_ENV || "development";
// Render sets RENDER=true on every service: treat it as production even if NODE_ENV was forgotten.
const isProd = nodeEnv === "production" || String(process.env.RENDER).toLowerCase() === "true";
const isTest = nodeEnv === "test";

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProd) {
    // Fail fast: never run production with a guessable/ephemeral secret.
    throw new Error("JWT_SECRET must be set in production (use a random string of 32+ characters).");
  }
  jwtSecret = crypto.randomBytes(32).toString("hex");
  if (!isTest) console.warn("[config] JWT_SECRET not set - using an ephemeral secret (tokens reset on restart).");
} else if (isProd && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production.");
}

if (isProd && !process.env.MONGO_URI) {
  throw new Error("MONGO_URI must be set in production.");
}

const env = {
  nodeEnv,
  isProd,
  isTest,
  port: int(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI,
  mongoMaxPool: int(process.env.MONGO_MAX_POOL, 10),
  jwtSecret,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenDays: int(process.env.REFRESH_TOKEN_DAYS, 30),
  bcryptRounds: int(process.env.BCRYPT_ROUNDS, 12),
  maxLoginAttempts: int(process.env.MAX_LOGIN_ATTEMPTS, 5),
  lockMinutes: int(process.env.LOCK_MINUTES, 15),
  // per-account (all IPs) soft cooldown: slows distributed guessing without letting an attacker lock the victim out for long
  maxLoginAttemptsAccount: int(process.env.MAX_LOGIN_ATTEMPTS_ACCOUNT, 20),
  accountCooldownMinutes: 1,
  otpTtlMinutes: 10,
  otpMaxAttempts: 5,
  corsOrigins: list(process.env.CORS_ORIGINS),
  corsAllowLocalhost: bool(process.env.CORS_ALLOW_LOCALHOST, !isProd),
  trustProxy: int(process.env.TRUST_PROXY, 1),
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || "AgroSence Admin",
    mobile: process.env.ADMIN_MOBILE || "9000000000",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    url: process.env.CLOUDINARY_URL,
  },
  gemini: { apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-2.5-flash" },
  plantId: { apiKey: process.env.PLANT_ID_API_KEY },
  mail: {
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: int(process.env.SMTP_PORT, 465),
    smtpSecure: bool(process.env.SMTP_SECURE, true),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    resendKey: process.env.RESEND_API_KEY,
    brevoKey: process.env.BREVO_API_KEY,
    from:
      process.env.MAIL_FROM ||
      (process.env.SMTP_USER ? `"AgroSence" <${process.env.SMTP_USER}>` : "AgroSence <no-reply@agrosence.local>"),
    to: process.env.MAIL_TO,
  },
  selfPingUrl: process.env.SELF_PING_URL || process.env.RENDER_EXTERNAL_URL,
  selfPingMinutes: int(process.env.SELF_PING_MINUTES, 10),
};

env.cloudinaryConfigured = Boolean(
  env.cloudinary.url || (env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret)
);

module.exports = env;
