"use strict";
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const RefreshToken = require("../models/RefreshToken");
const ApiError = require("../utils/ApiError");

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const GRACE_MS = 10 * 1000; // tolerate a duplicate refresh from racing tabs/retries

function signAccessToken(user) {
  return jwt.sign({ sub: String(user._id || user.id), role: user.role || "user", typ: "access" }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: env.accessTokenTtl,
  });
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  if (payload.typ !== "access") throw new Error("wrong token type");
  return payload;
}

async function issueRefreshToken(userId, userAgent) {
  const raw = crypto.randomBytes(48).toString("hex");
  await RefreshToken.create({
    userId,
    tokenHash: sha256(raw),
    expiresAt: new Date(Date.now() + env.refreshTokenDays * 24 * 3600 * 1000),
    userAgent: userAgent ? String(userAgent).slice(0, 200) : undefined,
  });
  return raw;
}

async function issueTokens(user, userAgent) {
  return { accessToken: signAccessToken(user), refreshToken: await issueRefreshToken(user._id || user.id, userAgent) };
}

/** Validates + rotates a refresh token. Reuse of an old (revoked) token revokes every session of that user. */
async function rotate(rawToken, userAgent) {
  const hash = sha256(String(rawToken));
  const rec = await RefreshToken.findOne({ tokenHash: hash });
  if (!rec || rec.expiresAt < new Date()) throw ApiError.unauthorized("Invalid or expired refresh token");
  if (rec.revokedAt) {
    if (Date.now() - rec.revokedAt.getTime() > GRACE_MS) {
      await RefreshToken.updateMany({ userId: rec.userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
    }
    throw ApiError.unauthorized("Refresh token has been revoked");
  }
  // atomically claim it so concurrent requests cannot both succeed
  const claimed = await RefreshToken.findOneAndUpdate({ _id: rec._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  if (!claimed) throw ApiError.unauthorized("Refresh token has been revoked");
  return rec.userId;
}

async function revoke(rawToken, userId) {
  const filter = { tokenHash: sha256(String(rawToken)), revokedAt: null };
  if (userId) filter.userId = userId;
  await RefreshToken.updateOne(filter, { $set: { revokedAt: new Date() } });
}

async function revokeAllForUser(userId, exceptRawToken) {
  const filter = { userId, revokedAt: null };
  if (exceptRawToken) filter.tokenHash = { $ne: sha256(String(exceptRawToken)) };
  await RefreshToken.updateMany(filter, { $set: { revokedAt: new Date() } });
}

module.exports = { signAccessToken, verifyAccessToken, issueTokens, rotate, revoke, revokeAllForUser, sha256 };
