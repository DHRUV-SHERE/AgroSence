"use strict";
const env = require("./src/config/env"); // validates required env (fails fast in production)
const { createApp } = require("./src/app");
const db = require("./src/config/db");
const { ensureAdmin } = require("./src/services/userService");
const { startSelfPing } = require("./src/services/keepAlive");

async function start({ mongoUri = env.mongoUri, port = env.port, onShutdown } = {}) {
  if (!mongoUri) {
    console.error("MONGO_URI is not set. Copy .env.example to .env, or run `npm run dev:memory` for an in-memory database.");
    process.exit(1);
  }
  const app = createApp();
  console.log("[config] trust proxy = " + env.trustProxy + " hop(s), production = " + env.isProd + ", CORS localhost allowed = " + env.corsAllowLocalhost);
  const server = app.listen(port, () => console.log(`[server] listening on ${port} (${env.nodeEnv})`));

  // Connect in the background (with retry) so the process is up and /api/health can report DB state.
  db.connectWithRetry(mongoUri, async () => {
    try {
      await ensureAdmin();
    } catch (err) {
      console.error("[bootstrap] admin creation failed:", err.message);
    }
  });
  const pingTimer = startSelfPing();

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[server] ${signal} received, shutting down`);
    clearInterval(pingTimer);
    const force = setTimeout(() => process.exit(1), 10000);
    force.unref();
    server.close(async () => {
      await db.disconnect().catch(() => {});
      if (onShutdown) await Promise.resolve(onShutdown()).catch(() => {});
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (err) => console.error("[unhandledRejection]", err && err.message));

  return { app, server, shutdown };
}

module.exports = { start };
if (require.main === module) start();
