"use strict";
const mongoose = require("mongoose");

// One document per counter key: `ip:<userId>:<ip>` (hard lock bucket) or `acct:<userId>` (soft cooldown bucket).
const schema = new mongoose.Schema({
  _id: { type: String },
  count: { type: Number, default: 0 },
  windowEnd: { type: Date },
  lockUntil: { type: Date },
  expireAt: { type: Date, index: { expireAfterSeconds: 0 } }, // TTL cleanup
});

module.exports = mongoose.model("LoginAttempt", schema);
