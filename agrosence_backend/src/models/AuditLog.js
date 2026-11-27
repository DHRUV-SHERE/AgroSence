"use strict";
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user" },
  actorEmail: String,
  actorRole: String,
  action: { type: String, required: true, index: true }, // e.g. user.role_change
  targetType: String,
  targetId: String,
  meta: mongoose.Schema.Types.Mixed,
  ip: String,
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("AuditLog", schema);
