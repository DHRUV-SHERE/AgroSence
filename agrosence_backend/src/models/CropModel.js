const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const CropSchema = new mongoose.Schema({
  cropId: { type: String, unique: true },
  cropName: { type: String, required: true },
  cropDescription: { type: String, required: true },
  cropCategory: { type: String, required: true },
  cropSellingPrice: { type: Number, required: true }, // Changed to Number
  cropUnit: { type: String, required: true },
  cropQuantity: { type: Number, required: true }, // Changed to Number
  grownOrganically: { type: String, enum: ["Yes", "No"], required: true },
  cropImages: {
    type: [String],
    validate: [arr => arr.length > 0, "At least one image is required"],
    required: true
  },
  cropStatus: { type: String, enum: ["Available", "Sold"], default: "Available" },
  sellingDate: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Agro_user", required: true } // Changed to ObjectId
});

// Generate cropId before saving
CropSchema.pre("save", function (next) {
  if (!this.cropId) {
    this.cropId = `agroCrop-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model("Crop", CropSchema);
