"use strict";
const mongoose = require("mongoose");

const ORDER_STATUSES = ["Pending", "Accepted", "Rejected", "Cancelled"];

const orderSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", required: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", required: true, index: true },
    cropId: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: "Pending", index: true },
  },
  { timestamps: true }
);
orderSchema.index({ createdAt: -1 });
// At most one open (Pending) order per buyer per crop; enforced by the database so parallel requests cannot bypass it.
orderSchema.index({ buyerId: 1, cropId: 1 }, { unique: true, partialFilterExpression: { status: "Pending" } });

const Order = mongoose.model("Order", orderSchema);
Order.STATUSES = ORDER_STATUSES;
module.exports = Order;
