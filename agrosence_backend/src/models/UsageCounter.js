"use strict";
const mongoose = require("mongoose");

// Per-user daily quota counters, `_id` = `<bucket>:<userId>:<yyyy-mm-dd>`.
const schema = new mongoose.Schema({
  _id: { type: String },
  count: { type: Number, default: 0 },
  expireAt: { type: Date, index: { expireAfterSeconds: 0 } },
});

module.exports = mongoose.model("UsageCounter", schema);
