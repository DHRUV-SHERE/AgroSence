"use strict";
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL cleanup
  revokedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  userAgent: { type: String, maxlength: 200 },
});

module.exports = mongoose.model("RefreshToken", schema);
