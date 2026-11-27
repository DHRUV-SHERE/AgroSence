"use strict";
const bcrypt = require("bcryptjs");
const env = require("../config/env");
const User = require("../models/User");
const { escapeRegex } = require("../utils/pagination");

const hashPassword = (pw) => bcrypt.hash(pw, env.bcryptRounds);
const comparePassword = (pw, hash) => bcrypt.compare(pw, hash);

/** Public/own user shape (contract). */
function userDTO(u) {
  if (!u) return u;
  const o = typeof u.toObject === "function" ? u.toObject() : u;
  const createdAt = o.createdAt || (o._id && o._id.getTimestamp ? o._id.getTimestamp() : undefined);
  return {
    id: String(o._id || o.id),
    userId: o.userId,
    name: o.name,
    mobile: o.mobile,
    email: o.email,
    state: o.state,
    address: o.address,
    language: o.language,
    role: o.role || "user",
    avatar: o.avatar,
    active: o.active !== false,
    createdAt,
    lastLoginAt: o.lastLoginAt,
  };
}

/** identifier = 10-digit mobile or email. Includes password hash for login. */
async function findByIdentifier(identifier, { withPassword = false } = {}) {
  const id = String(identifier).trim();
  const isMobile = /^\d{10}$/.test(id);
  const sel = withPassword ? "+password" : "";
  if (isMobile) return User.findOne({ mobile: id }).select(sel);
  const email = id.toLowerCase();
  let user = await User.findOne({ email }).select(sel);
  // legacy accounts may have been stored with mixed-case emails
  if (!user) user = await User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, "i") }).select(sel);
  return user;
}

/**
 * Idempotent: when ADMIN_EMAIL/ADMIN_PASSWORD are set and no admin exists, create a fresh admin.
 * An existing account is never promoted automatically (an attacker who registered the owner's email first would
 * become admin); the owner promotes explicitly with `npm run make-admin -- <email>`.
 */
async function ensureAdmin({ email, password, name, mobile } = env.admin) {
  if (!email || !password) return null;
  if (await User.exists({ role: "admin" })) return null;
  const lower = email.toLowerCase();
  if (await User.exists({ email: lower })) {
    console.warn("[bootstrap] ADMIN_EMAIL " + lower + " already belongs to a regular account and was NOT promoted. If it is yours, run: npm run make-admin -- " + lower);
    return null;
  }
  let m = mobile;
  if (await User.exists({ mobile: m })) m = String(Math.floor(9000000000 + Math.random() * 999999999));
  const admin = await User.create({
    name,
    mobile: m,
    email: lower,
    password: await hashPassword(password),
    state: "Gujarat",
    address: "Admin",
    language: "English",
    role: "admin",
  });
  console.log(`[bootstrap] created admin ${lower}`);
  return admin;
}

module.exports = { hashPassword, comparePassword, userDTO, findByIdentifier, ensureAdmin };
