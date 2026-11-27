"use strict";
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const CropSchema = new mongoose.Schema(
  {
    cropId: { type: String, unique: true },
    cropName: { type: String, required: true, trim: true, maxlength: 100 },
    cropDescription: { type: String, required: true, trim: true, maxlength: 2000 },
    cropCategory: { type: String, required: true, trim: true, index: true },
    cropSellingPrice: { type: Number, required: true, min: 0 },
    cropUnit: { type: String, required: true, trim: true },
    cropQuantity: { type: Number, required: true, min: 0 },
    grownOrganically: { type: String, enum: ["Yes", "No"], required: true },
    cropImages: {
      type: [String],
      validate: [(arr) => arr.length > 0, "At least one image is required"],
      required: true,
    },
    cropStatus: { type: String, enum: ["Available", "Sold"], default: "Available" },
    sellingDate: { type: Date, default: Date.now },
    state: { type: String, trim: true }, // seller state at listing time (for filtering)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", required: true, index: true },
  },
  { timestamps: true }
);

CropSchema.index({ cropStatus: 1, createdAt: -1 });
CropSchema.index({ cropStatus: 1, cropCategory: 1 });

CropSchema.pre("validate", function (next) {
  if (!this.cropId) this.cropId = `agroCrop-${uuidv4()}`;
  next();
});

module.exports = mongoose.model("Crop", CropSchema);
