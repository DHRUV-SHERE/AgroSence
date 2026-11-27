"use strict";
const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, paginated, message } = require("../utils/response");
const { parsePage, paginate } = require("../utils/pagination");

// legacy notifications (before recipientId existed) belonged to the seller
const mineFilter = (id) => ({ $or: [{ recipientId: id }, { recipientId: { $exists: false }, sellerId: id }] });

exports.list = asyncHandler(async (req, res) => {
  const p = parsePage(req.query, { allowedSort: ["createdAt"] });
  const filter = mineFilter(req.user._id);
  const [{ items, meta }, unread] = await Promise.all([
    paginate(Notification, filter, p),
    Notification.countDocuments({ $and: [filter, { status: "unread" }] }),
  ]);
  paginated(res, items, { ...meta, unread });
});

exports.markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ $and: [{ _id: req.params.id }, mineFilter(req.user._id)] }, { $set: { status: "read" } }, { new: true }).lean();
  if (!n) throw ApiError.notFound("Notification not found");
  ok(res, n);
});

exports.remove = asyncHandler(async (req, res) => {
  const r = await Notification.deleteOne({ $and: [{ _id: req.params.id }, mineFilter(req.user._id)] });
  if (!r.deletedCount) throw ApiError.notFound("Notification not found");
  message(res, "Notification removed");
});
