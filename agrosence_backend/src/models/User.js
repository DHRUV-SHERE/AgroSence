"use strict";
const mongoose = require("mongoose");
const crypto = require("crypto");

const ROLES = ["user", "moderator", "admin"];

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    state: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    language: { type: String, required: true, enum: ["English", "Hindi", "Gujarati"] },
    avatar: { type: String, trim: true },
    // Existing documents without these fields behave as role "user" / active.
    role: { type: String, enum: ROLES, default: "user", index: true },
    active: { type: Boolean, default: true },
    failedLogins: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Robust unique public id (no countDocuments race / duplicates after deletes).
userSchema.pre("validate", function (next) {
  if (!this.userId) this.userId = `agroUser${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`;
  next();
});

const User = mongoose.model("Agro_user", userSchema);
User.ROLES = ROLES;
module.exports = User;
