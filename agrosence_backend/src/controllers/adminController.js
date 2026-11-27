"use strict";
const mongoose = require("mongoose");
const User = require("../models/User");
const Crop = require("../models/Crop");
const Order = require("../models/Order");
const Contact = require("../models/Contact");
const Scheme = require("../models/Scheme");
const Resource = require("../models/Resource");
const Notification = require("../models/Notification");
const RefreshToken = require("../models/RefreshToken");
const AuditLog = require("../models/AuditLog");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, paginated, message } = require("../utils/response");
const { parsePage, paginate, escapeRegex } = require("../utils/pagination");
const { userDTO } = require("../services/userService");
const tokens = require("../services/tokenService");
const { audit } = require("../services/auditService");

exports.stats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [users, crops, orders, contacts, schemes, resources, byStatus, signups, revenue] = await Promise.all([
    User.estimatedDocumentCount(),
    Crop.estimatedDocumentCount(),
    Order.estimatedDocumentCount(),
    Contact.estimatedDocumentCount(),
    Scheme.estimatedDocumentCount(),
    Resource.estimatedDocumentCount(),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    // signup date derived from the ObjectId so legacy users without createdAt are included
    User.aggregate([
      { $match: { _id: { $gte: mongoose.Types.ObjectId.createFromTime(Math.floor(since.getTime() / 1000)) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$_id" } } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $match: { status: "Accepted" } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
  ]);
  ok(res, {
    users,
    crops,
    orders,
    contacts,
    schemes,
    resources,
    ordersByStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
    signupsByDay: signups.map((s) => ({ date: s._id, count: s.count })),
    revenue: revenue[0]?.total || 0,
  });
});

// ---------- users ----------
exports.listUsers = asyncHandler(async (req, res) => {
  const q = req.valid.query;
  const filter = {};
  if (q.role) filter.role = q.role === "user" ? { $in: ["user", null] } : q.role;
  if (q.active !== undefined) filter.active = q.active ? { $ne: false } : false;
  if (q.q) {
    const r = new RegExp(escapeRegex(q.q), "i");
    filter.$or = [{ name: r }, { email: r }, { mobile: r }, { userId: r }];
  }
  const p = parsePage(q, { allowedSort: ["createdAt", "name", "email", "role"], defaultSort: "-_id" });
  const { items, meta } = await paginate(User, filter, p, { map: userDTO });
  paginated(res, items, meta);
});

exports.getUser = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id).lean();
  if (!u) throw ApiError.notFound("User not found");
  ok(res, userDTO(u));
});

exports.updateUser = asyncHandler(async (req, res) => {
  const u = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).lean();
  if (!u) throw ApiError.notFound("User not found");
  await audit(req, "user.update", "User", u._id, { fields: Object.keys(req.body) });
  ok(res, userDTO(u));
});

const otherActiveAdmins = (excludeId) => User.countDocuments({ role: "admin", active: { $ne: false }, _id: { $ne: excludeId } });

exports.setRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const target = await User.findById(req.params.id).select("role email");
  if (!target) throw ApiError.notFound("User not found");
  if (String(target._id) === req.user.id) throw ApiError.badRequest("You cannot change your own role");
  if (target.role === "admin" && role !== "admin" && (await otherActiveAdmins(target._id)) === 0) {
    throw ApiError.conflict("Cannot demote the last admin");
  }
  const from = target.role || "user";
  target.role = role;
  await target.save();
  await audit(req, "user.role_change", "User", target._id, { email: target.email, from, to: role });
  ok(res, userDTO(target));
});

exports.setStatus = asyncHandler(async (req, res) => {
  const { active } = req.body;
  const target = await User.findById(req.params.id).select("role email active");
  if (!target) throw ApiError.notFound("User not found");
  if (String(target._id) === req.user.id) throw ApiError.badRequest("You cannot suspend your own account");
  if (!active && target.role === "admin" && (await otherActiveAdmins(target._id)) === 0) throw ApiError.conflict("Cannot suspend the last admin");
  target.active = active;
  await target.save();
  if (!active) await tokens.revokeAllForUser(target._id);
  await audit(req, active ? "user.restore" : "user.suspend", "User", target._id, { email: target.email });
  ok(res, userDTO(target));
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id).select("role email name");
  if (!target) throw ApiError.notFound("User not found");
  if (String(target._id) === req.user.id) throw ApiError.badRequest("You cannot delete your own account");
  if (target.role === "admin" && (await otherActiveAdmins(target._id)) === 0) throw ApiError.conflict("Cannot delete the last admin");
  await Promise.all([
    User.deleteOne({ _id: target._id }),
    Crop.deleteMany({ userId: target._id }),
    RefreshToken.deleteMany({ userId: target._id }),
    Notification.deleteMany({ $or: [{ recipientId: target._id }, { sellerId: target._id }, { buyerId: target._id }] }),
  ]);
  await audit(req, "user.delete", "User", target._id, { email: target.email, name: target.name });
  message(res, "User deleted");
});

exports.listAuditLogs = asyncHandler(async (req, res) => {
  const q = req.valid.query;
  const filter = q.action ? { action: q.action } : {};
  const { items, meta } = await paginate(AuditLog, filter, parsePage(q, { allowedSort: ["createdAt"] }));
  paginated(res, items, meta);
});
