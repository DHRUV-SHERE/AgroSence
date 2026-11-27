"use strict";
const UsageCounter = require("../models/UsageCounter");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");

const DAY = 24 * 3600 * 1000;

/** Atomically counts one use; returns the new count. */
async function consume(bucket, userId, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  const doc = await UsageCounter.findOneAndUpdate(
    { _id: `${bucket}:${userId}:${day}` },
    { $inc: { count: 1 }, $setOnInsert: { expireAt: new Date(now.getTime() + 2 * DAY) } },
    { upsert: true, new: true }
  ).lean();
  return doc.count;
}

/** Express middleware: at most `limit` calls per user per UTC day. `when` can skip counting (e.g. non-multipart PUT). */
const dailyQuota = (bucket, limit, { when } = {}) =>
  asyncHandler(async (req, res, next) => {
    if (env.isTest && !process.env.TEST_RATE_LIMIT && !process.env.TEST_QUOTA) return next();
    if (when && !when(req)) return next();
    const used = await consume(bucket, req.user.id);
    if (used > limit) throw ApiError.tooMany("Daily limit reached for this action, please try again tomorrow");
    next();
  });

module.exports = { consume, dailyQuota };
