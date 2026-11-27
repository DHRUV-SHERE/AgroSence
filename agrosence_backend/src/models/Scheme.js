"use strict";
const mongoose = require("mongoose");

const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  eligibility: { type: String, required: true },
  benefits: { type: String, required: true },
  state: { type: String, default: "All States", index: true },
  applyLink: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
SchemeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Scheme", SchemeSchema);
