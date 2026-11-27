"use strict";
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // recipientId is who sees it. Legacy documents only have sellerId (the recipient back then).
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", required: true },
    cropId: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    type: { type: String, default: "order" },
    message: { type: String, required: true, maxlength: 500 },
    status: { type: String, enum: ["unread", "read"], default: "unread" },
  },
  { timestamps: true }
);
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ sellerId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
