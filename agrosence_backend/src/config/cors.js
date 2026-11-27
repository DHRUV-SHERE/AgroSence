"use strict";
const env = require("./env");

const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function toMatcher(pattern) {
  if (!pattern.includes("*")) return (o) => o === pattern.replace(/\/$/, "");
  const re = new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^.]+") + "$");
  return (o) => re.test(o);
}
const matchers = env.corsOrigins.map(toMatcher);

function isAllowed(origin) {
  if (!origin) return true; // curl, server-to-server, cron pings
  if (env.corsAllowLocalhost && LOCAL.test(origin)) return true;
  return matchers.some((m) => m(origin));
}

module.exports = {
  origin(origin, cb) {
    cb(null, isAllowed(origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["ETag"],
  maxAge: 600,
};
module.exports.isAllowed = isAllowed;
