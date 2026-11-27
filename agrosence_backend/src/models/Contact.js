"use strict";
const mongoose = require("mongoose");

// Keeps the legacy model/collection name ("ContactForm") so existing submissions stay visible.
const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    mobile: { type: String, trim: true, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, trim: true, default: "" },
    message: { type: String, required: true, maxlength: 3000 },
    dateSubmitted: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ dateSubmitted: -1 });

module.exports = mongoose.model("ContactForm", ContactSchema);
