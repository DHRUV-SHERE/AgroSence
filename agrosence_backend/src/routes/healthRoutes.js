"use strict";
const router = require("express").Router();
const mongoose = require("mongoose");
const Heartbeat = require("../models/Heartbeat");
const asyncHandler = require("../utils/asyncHandler");
const limits = require("../middleware/rateLimit");

const HEARTBEAT_WRITE_AFTER_MS = 4 * 60 * 1000; // cron runs ~every 10 min, so every run still produces a write

// Called every ~10 minutes by an external cron (and optionally self-ping): does a real DB write so both
// Render (HTTP traffic) and Atlas (cluster activity) see regular usage.
router.get(
  "/health",
  limits.health,
  asyncHandler(async (req, res) => {
    res.set("Cache-Control", "no-store");
    const base = { uptime: Math.round(process.uptime()), time: new Date().toISOString() };
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: "Database not connected", status: "degraded", db: "disconnected", ...base });
    }
    try {
      // a real DB read on every call; the write only when the last heartbeat is older than 4 minutes
      const hb = await Heartbeat.findOne({ key: "main" }).select("lastPing").lean();
      if (!hb || !hb.lastPing || Date.now() - hb.lastPing.getTime() > HEARTBEAT_WRITE_AFTER_MS) {
        await Heartbeat.findOneAndUpdate({ key: "main" }, { $set: { lastPing: new Date() }, $inc: { pings: 1 } }, { upsert: true });
      }
    } catch (err) {
      return res.status(503).json({ success: false, message: "Database ping failed", status: "degraded", db: "error", ...base });
    }
    const data = { status: "ok", db: "connected", ...base };
    // contract shape at top level + standard envelope
    res.json({ success: true, data, ...data });
  })
);

module.exports = router;
