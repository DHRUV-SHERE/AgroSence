"use strict";
const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  purpose: { type: String, required: true },
  advantages: { type: String, required: true },
  popularbrand: { type: String, required: true },
  howtouse: { type: String, required: true },
  image: { type: String, required: true }, // absolute Cloudinary URL
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
ResourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Resource", ResourceSchema);
