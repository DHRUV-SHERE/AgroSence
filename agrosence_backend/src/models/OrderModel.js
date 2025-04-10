const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", required: true },
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "Pending" }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
