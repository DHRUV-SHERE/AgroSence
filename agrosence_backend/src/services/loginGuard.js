"use strict";
// Login throttling that is atomic (single findOneAndUpdate with an aggregation-pipeline update, so parallel guesses
// are all counted) and hard to abuse for victim lock-outs:
//  - hard lock (env.maxLoginAttempts failures, env.lockMinutes) is keyed per (account, client IP): an attacker only
//    locks out their own IP; the real owner on another IP keeps working.
//  - a higher per-account threshold across all IPs (env.maxLoginAttemptsAccount) only triggers a short cooldown.
const env = require("../config/env");
const LoginAttempt = require("../models/LoginAttempt");

const MIN = 60 * 1000;
const keys = (userId, ip) => ({ ip: `ip:${userId}:${ip || "unknown"}`, acct: `acct:${userId}` });

/** Records one failed attempt atomically; the lock decision is made from the returned document. */
async function bump(key, { max, lockMs, windowMs }) {
  const now = new Date();
  const expired = { $lte: [{ $ifNull: ["$windowEnd", new Date(0)] }, now] };
  const locked = { $gt: [{ $ifNull: ["$lockUntil", new Date(0)] }, now] };
  return LoginAttempt.findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          count: { $cond: [expired, 1, { $add: [{ $ifNull: ["$count", 0] }, 1] }] },
          windowEnd: { $cond: [expired, new Date(now.getTime() + windowMs), "$windowEnd"] },
          lockUntil: { $cond: [expired, null, "$lockUntil"] },
        },
      },
      {
        // a lock is never extended by further attempts, so one IP cannot keep it alive forever
        $set: {
          lockUntil: { $cond: [{ $and: [{ $gte: ["$count", max] }, { $not: [locked] }] }, new Date(now.getTime() + lockMs), "$lockUntil"] },
          expireAt: { $add: [{ $max: ["$windowEnd", { $ifNull: ["$lockUntil", "$windowEnd"] }] }, 5 * MIN] },
        },
      },
    ],
    { upsert: true, new: true }
  ).lean();
}

const isLocked = (doc) => Boolean(doc && doc.lockUntil && doc.lockUntil > new Date());

async function isBlocked(userId, ip) {
  const k = keys(userId, ip);
  const docs = await LoginAttempt.find({ _id: { $in: [k.ip, k.acct] } }).select("lockUntil").lean();
  return docs.some(isLocked);
}

/** Counts a failed attempt in both buckets. Returns true when either bucket is (now) locked. */
async function recordFailure(userId, ip) {
  const k = keys(userId, ip);
  const [a, b] = await Promise.all([
    bump(k.ip, { max: env.maxLoginAttempts, lockMs: env.lockMinutes * MIN, windowMs: env.lockMinutes * MIN }),
    bump(k.acct, { max: env.maxLoginAttemptsAccount, lockMs: env.accountCooldownMinutes * MIN, windowMs: env.lockMinutes * MIN }),
  ]);
  return isLocked(a) || isLocked(b);
}

/** Correct password: clear this IP's bucket and the per-account bucket. */
async function reset(userId, ip) {
  const k = keys(userId, ip);
  await LoginAttempt.deleteMany({ _id: { $in: [k.ip, k.acct] } });
}

/** Password reset by e-mail proof: clear every bucket of the account. */
async function resetAll(userId) {
  await LoginAttempt.deleteMany({ _id: { $regex: `^(ip:${userId}:|acct:${userId}$)` } });
}

/** Password reset by e-mail proof: clear every bucket of the account. */
async function resetAll(userId) {
  await LoginAttempt.deleteMany({ _id: { $regex: `^(ip:${userId}:|acct:${userId}$)` } });
}

module.exports = { isBlocked, recordFailure, reset, resetAll, keys };
