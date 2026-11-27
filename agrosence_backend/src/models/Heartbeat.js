"use strict";
const mongoose = require("mongoose");

// Single document updated by /api/health so Atlas and Render see regular activity.
const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  lastPing: { type: Date, default: Date.now },
  pings: { type: Number, default: 0 },
});

module.exports = mongoose.model("Heartbeat", schema, "heartbeats");
