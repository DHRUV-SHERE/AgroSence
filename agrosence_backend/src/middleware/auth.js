"use strict";
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../services/tokenService");

function extractToken(req) {
  const h = req.headers.authorization || "";
  const [scheme, token] = h.split(" ");
  return scheme && scheme.toLowerCase() === "bearer" && token ? token : null;
}

async function loadUser(token) {
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized(err.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token");
  }
  // Always re-check the DB: role changes and suspensions take effect immediately.
  const u = await User.findById(payload.sub).select("name email role active").lean();
  if (!u) throw ApiError.unauthorized("Account no longer exists");
  if (u.active === false) throw ApiError.forbidden("Your account has been suspended");
  return { id: String(u._id), _id: u._id, name: u.name, email: u.email, role: u.role || "user" };
}

const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();
  req.user = await loadUser(token);
  next();
});

/** Attaches req.user when a valid token is sent, silently continues otherwise. */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = await loadUser(token);
    } catch {
      /* treat as anonymous */
    }
  }
  next();
});

module.exports = { authenticate, optionalAuth };
