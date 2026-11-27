"use strict";
const Order = require("../models/Order");
const Crop = require("../models/Crop");
const Notification = require("../models/Notification");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated } = require("../utils/response");
const { parsePage, paginate } = require("../utils/pagination");

const POPULATE = [
  { path: "cropId", select: "cropName cropUnit cropImages cropSellingPrice cropCategory cropStatus" },
  { path: "buyerId", select: "name mobile state" },
  { path: "sellerId", select: "name mobile state" },
];
const isObj = (v) => v && typeof v === "object" && v.name !== undefined;
const idOf = (v) => String(v && v._id ? v._id : v);

function orderDTO(o, meId) {
  const crop = o.cropId && o.cropId.cropName !== undefined ? o.cropId : undefined;
  const dto = {
    ...o,
    cropId: idOf(o.cropId),
    buyerId: idOf(o.buyerId),
    sellerId: idOf(o.sellerId),
    crop: crop && { id: idOf(crop), cropName: crop.cropName, cropUnit: crop.cropUnit, cropImages: crop.cropImages, cropSellingPrice: crop.cropSellingPrice, cropCategory: crop.cropCategory },
    buyer: isObj(o.buyerId) ? { id: idOf(o.buyerId), name: o.buyerId.name, mobile: o.buyerId.mobile, state: o.buyerId.state } : undefined,
    seller: isObj(o.sellerId) ? { id: idOf(o.sellerId), name: o.sellerId.name, mobile: o.sellerId.mobile, state: o.sellerId.state } : undefined,
  };
  if (meId) dto.role = idOf(o.buyerId) === String(meId) ? "buyer" : "seller";
  return dto;
}

const round2 = (n) => Math.round(n * 100) / 100;

const notify = (order, recipientId, type, msg) =>
  Notification.create({
    recipientId,
    sellerId: order.sellerId,
    buyerId: order.buyerId,
    cropId: order.cropId,
    orderId: order._id,
    type,
    message: msg,
  }).catch((e) => console.error("[notify] failed:", e.message));

exports.create = asyncHandler(async (req, res) => {
  const { cropId, quantity } = req.body;
  const crop = await Crop.findById(cropId).lean();
  if (!crop) throw ApiError.notFound("Crop not found");
  if (String(crop.userId) === req.user.id) throw ApiError.badRequest("You cannot buy your own crop");
  if (crop.cropStatus !== "Available") throw ApiError.conflict("This crop is no longer available");
  const seller = await User.findById(crop.userId).select("active").lean();
  if (!seller || seller.active === false) throw ApiError.conflict("This crop is no longer available");
  if (quantity > crop.cropQuantity) {
    throw ApiError.badRequest(`Only ${crop.cropQuantity} ${crop.cropUnit} available`, [{ field: "quantity", message: `Maximum ${crop.cropQuantity}` }]);
  }
  const totalPrice = round2(quantity * crop.cropSellingPrice);
  if (!(totalPrice >= 1)) {
    throw ApiError.badRequest("Order total must be at least Rs 1", [{ field: "quantity", message: "Quantity is too small for this price" }]);
  }
  const dupMsg = "You already have a pending order for this crop. Wait for the seller or cancel it first.";
  if (await Order.exists({ buyerId: req.user._id, cropId: crop._id, status: "Pending" })) throw ApiError.conflict(dupMsg);
  let order;
  try {
    order = await Order.create({
      sellerId: crop.userId, // derived from DB, never from the client
      buyerId: req.user._id,
      cropId: crop._id,
      quantity,
      totalPrice,
    });
  } catch (err) {
    if (err && err.code === 11000) throw ApiError.conflict(dupMsg); // parallel request won the partial unique index
    throw err;
  }
  await notify(order, crop.userId, "order_placed", `${req.user.name} wants to buy ${quantity} ${crop.cropUnit} of ${crop.cropName}`);
  created(res, orderDTO(order.toObject(), req.user.id));
});

exports.listMine = asyncHandler(async (req, res) => {
  const q = req.valid.query;
  const me = req.user._id;
  const filter = q.role === "buyer" ? { buyerId: me } : q.role === "seller" ? { sellerId: me } : { $or: [{ buyerId: me }, { sellerId: me }] };
  if (q.status) filter.status = q.status;
  const p = parsePage(q, { allowedSort: ["createdAt", "totalPrice", "status"] });
  const { items, meta } = await paginate(Order, filter, p, { populate: POPULATE, map: (o) => orderDTO(o, me) });
  paginated(res, items, meta);
});

exports.listAdmin = asyncHandler(async (req, res) => {
  const q = req.valid.query;
  const filter = q.status ? { status: q.status } : {};
  const p = parsePage(q, { allowedSort: ["createdAt", "totalPrice", "status"] });
  const { items, meta } = await paginate(Order, filter, p, { populate: POPULATE, map: (o) => orderDTO(o) });
  paginated(res, items, meta);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).lean();
  if (!order) throw ApiError.notFound("Order not found");
  const me = req.user.id;
  const isSeller = String(order.sellerId) === me;
  const isBuyer = String(order.buyerId) === me;

  if (status === "Cancelled") {
    if (!isBuyer) throw ApiError.forbidden("Only the buyer can cancel an order");
  } else if (!isSeller) {
    throw ApiError.forbidden("Only the seller can accept or reject an order");
  }
  if (order.status !== "Pending") throw ApiError.conflict(`Order is already ${order.status}`);

  // Atomic Pending -> new status so concurrent requests cannot both win.
  const updated = await Order.findOneAndUpdate({ _id: order._id, status: "Pending" }, { $set: { status } }, { new: true }).lean();
  if (!updated) throw ApiError.conflict("Order was already processed");

  if (status === "Accepted") {
    // Atomic stock decrement; fails if stock changed since the order was placed.
    const crop = await Crop.findOneAndUpdate(
      { _id: order.cropId, cropStatus: "Available", cropQuantity: { $gte: order.quantity } },
      { $inc: { cropQuantity: -order.quantity } },
      { new: true }
    ).lean();
    if (!crop) {
      // roll back to Pending; if the buyer meanwhile opened a new Pending order for this crop, reject this one instead
      await Order.updateOne({ _id: order._id }, { $set: { status: "Pending" } }).catch(() => Order.updateOne({ _id: order._id }, { $set: { status: "Rejected" } }));
      throw ApiError.conflict("Not enough stock left to accept this order");
    }
    if (crop.cropQuantity <= 0) await Crop.updateOne({ _id: crop._id }, { $set: { cropStatus: "Sold" } });
    await notify(updated, order.buyerId, "order_accepted", `Your order for ${order.quantity} was accepted`);
  } else if (status === "Rejected") {
    await notify(updated, order.buyerId, "order_rejected", "Your order was rejected by the seller");
  } else {
    await notify(updated, order.sellerId, "order_cancelled", `${req.user.name} cancelled an order`);
  }
  const full = await Order.findById(order._id).populate(POPULATE).lean();
  ok(res, orderDTO(full, me));
});

exports.orderDTO = orderDTO;
