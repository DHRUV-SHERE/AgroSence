"use strict";
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Otp", schema);
