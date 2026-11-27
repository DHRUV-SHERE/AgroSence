"use strict";
const crypto = require("crypto");
const env = require("../config/env");
const User = require("../models/User");
const Otp = require("../models/Otp");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created, message } = require("../utils/response");
const tokens = require("../services/tokenService");
const { hashPassword, comparePassword, userDTO, findByIdentifier } = require("../services/userService");
const mail = require("../services/mailService");
const guard = require("../services/loginGuard");

// A valid bcrypt hash compared against when the account does not exist, to keep timing uniform.
let dummyHash;
const getDummyHash = async () => (dummyHash ||= await hashPassword("dummy-password-1"));

const INVALID = "Invalid credentials";
const LOCKED = "Too many failed attempts. This login is temporarily locked, please try again later.";

exports.signup = asyncHandler(async (req, res) => {
  const { confirmPassword, password, ...rest } = req.body; // role is never read from the body
  const dup = await User.findOne({ $or: [{ email: rest.email }, { mobile: rest.mobile }] }).select("email mobile").lean();
  if (dup) {
    const field = dup.email === rest.email ? "email" : "mobile";
    throw ApiError.conflict(`An account with this ${field} already exists`);
  }
  const user = await User.create({ ...rest, password: await hashPassword(password), role: "user" });
  const t = await tokens.issueTokens(user, req.get("user-agent"));
  created(res, { user: userDTO(user), ...t });
});

exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const user = await findByIdentifier(identifier, { withPassword: true });
  if (!user) {
    await comparePassword(password, await getDummyHash());
    throw ApiError.unauthorized(INVALID);
  }
  if (await guard.isBlocked(user._id, req.ip)) {
    await guard.recordFailure(user._id, req.ip); // attempts during a lock are still counted (no bcrypt work, no lock extension)
    throw ApiError.tooMany(LOCKED);
  }
  const match = await comparePassword(password, user.password);
  if (!match) {
    if (await guard.recordFailure(user._id, req.ip)) throw ApiError.tooMany(LOCKED);
    throw ApiError.unauthorized(INVALID);
  }
  if (user.active === false) throw ApiError.forbidden("Your account has been suspended. Contact support.");

  await Promise.all([User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } }), guard.reset(user._id, req.ip)]);
  const t = await tokens.issueTokens(user, req.get("user-agent"));
  ok(res, { user: userDTO(user), ...t });
});

exports.refresh = asyncHandler(async (req, res) => {
  const userId = await tokens.rotate(req.body.refreshToken, req.get("user-agent"));
  const user = await User.findById(userId).select("role active").lean();
  if (!user || user.active === false) throw ApiError.unauthorized("Account unavailable");
  ok(res, await tokens.issueTokens(user, req.get("user-agent")));
});

exports.logout = asyncHandler(async (req, res) => {
  if (req.body.refreshToken) await tokens.revoke(req.body.refreshToken, req.user._id);
  message(res, "Logged out");
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) throw ApiError.unauthorized();
  ok(res, userDTO(user));
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { currentPassword, refreshToken, ...update } = req.body; // zod whitelist: name,email,mobile,state,address,language,avatar
  const current = await User.findById(req.user.id).select("+password email mobile");
  if (!current) throw ApiError.unauthorized();
  const emailChanged = update.email !== undefined && update.email !== current.email;
  const mobileChanged = update.mobile !== undefined && update.mobile !== current.mobile;
  if (!emailChanged) delete update.email;
  if (!mobileChanged) delete update.mobile;

  // Changing a login identifier needs proof of the current password (a stolen access token is not enough).
  if (emailChanged || mobileChanged) {
    if (!currentPassword) {
      throw ApiError.badRequest("Current password is required to change your email or mobile number", [{ field: "currentPassword", message: "Required" }]);
    }
    if (!(await comparePassword(currentPassword, current.password))) {
      throw ApiError.badRequest("Current password is incorrect", [{ field: "currentPassword", message: "Incorrect" }]);
    }
  }

  const op = { $set: update };
  if (update.avatar === "") {
    delete update.avatar;
    op.$unset = { avatar: 1 };
  }
  const u = await User.findByIdAndUpdate(req.user.id, op, { new: true, runValidators: true }).lean();
  if (!emailChanged) return ok(res, userDTO(u));

  // The e-mail is the account-recovery channel: end every other session (the caller's own stays valid if its token is sent).
  await tokens.revokeAllForUser(u._id, refreshToken);
  if (refreshToken) return ok(res, userDTO(u));
  ok(res, { ...userDTO(u), ...(await tokens.issueTokens(u, req.get("user-agent"))) });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, refreshToken } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (!(await comparePassword(currentPassword, user.password))) throw ApiError.badRequest("Current password is incorrect");
  user.password = await hashPassword(newPassword);
  await user.save();
  await tokens.revokeAllForUser(user._id, refreshToken);
  if (refreshToken) return message(res, "Password updated");
  ok(res, { message: "Password updated", ...(await tokens.issueTokens(user, req.get("user-agent"))) });
});

// ---- password reset via emailed OTP ----
const otpHash = (email, code) => crypto.createHmac("sha256", env.jwtSecret).update(`${email}:${code}`).digest("hex");
const GENERIC_OTP = "If an account exists for this email, a verification code has been sent.";

exports.sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select("active").lean();
  if (user && user.active !== false) {
    const existing = await Otp.findOne({ email }).select("createdAt").lean();
    // 60s cooldown per email: silently skip to avoid email bombing
    if (!existing || Date.now() - existing.createdAt.getTime() > 60 * 1000) {
      const code = String(crypto.randomInt(100000, 1000000));
      await Otp.findOneAndUpdate(
        { email },
        { $set: { codeHash: otpHash(email, code), attempts: 0, createdAt: new Date(), expiresAt: new Date(Date.now() + env.otpTtlMinutes * 60 * 1000) } },
        { upsert: true }
      );
      // Fire-and-forget: awaiting the mail provider would make "account exists" measurably slower than "unknown email".
      Promise.resolve()
        .then(() => mail.sendOtpEmail(email, code))
        .catch((err) => console.error("[otp] email failed:", err.message)); // never reveal to the caller
    }
  }
  message(res, GENERIC_OTP);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const bad = ApiError.badRequest("Invalid or expired verification code");
  const rec = await Otp.findOne({ email });
  if (!rec || rec.expiresAt < new Date() || rec.attempts >= env.otpMaxAttempts) throw bad;

  const expected = Buffer.from(rec.codeHash, "hex");
  const given = Buffer.from(otpHash(email, otp), "hex");
  if (!crypto.timingSafeEqual(expected, given)) {
    await Otp.updateOne({ _id: rec._id }, { $inc: { attempts: 1 } });
    throw bad;
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw bad;
  user.password = await hashPassword(newPassword);
  await user.save();
  await Promise.all([Otp.deleteOne({ _id: rec._id }), tokens.revokeAllForUser(user._id), guard.resetAll(user._id)]);
  message(res, "Password reset successful. Please log in.");
});
