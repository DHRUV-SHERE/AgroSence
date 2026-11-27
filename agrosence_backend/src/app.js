"use strict";
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const env = require("./config/env");
const corsOptions = require("./config/cors");
const limits = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();
  app.set("trust proxy", env.trustProxy); // Render sits behind one proxy: needed for correct client IPs / rate limits
  app.disable("x-powered-by");

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors(corsOptions));
  app.use(compression());
  if (!env.isTest) app.use(morgan(env.isProd ? "combined" : "dev", { skip: (req) => req.path === "/api/health" }));

  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(mongoSanitize()); // strips $ and . keys (NoSQL injection)
  app.use(hpp()); // HTTP parameter pollution

  app.get("/", (req, res) => res.json({ success: true, data: { name: "AgroSence API", status: "ok", docs: "/api/health" } }));

  app.use("/api", require("./routes/healthRoutes")); // before the global limiter: cron pings must never be throttled
  app.use("/api", limits.global);
  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/crops", require("./routes/cropRoutes"));
  app.use("/api/orders", require("./routes/orderRoutes"));
  app.use("/api/notifications", require("./routes/notificationRoutes"));
  app.use("/api/admin", require("./routes/adminRoutes"));
  app.use("/api", require("./routes/publicRoutes"));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
