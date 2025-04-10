const mongoose = require("mongoose");

const CropSchema = new mongoose.Schema({
    cropId: { type: String, unique: true },
    cropName: { type: String, required: true },
    cropDescription: { type: String, required: true },
    cropCategory: { type: String, required: true },
    cropSellingPrice: { type: String, required: true },
    cropUnit: { type: String, required: true },
    cropQuantity: { type: String, required: true },
    grownOrganically: { type: String, enum: ["Yes", "No"], required: true },
    cropImages: [{ type: String, required: true }], // Array of image URLs
    cropStatus: { type: String, enum: ["Available", "Sold"], default: "Available" },
    sellingDate: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.String, ref: "Agro_user", required: true } // Linking user
});

// Generate cropId before saving
CropSchema.pre("save", async function (next) {
    if (!this.cropId) {
        const count = await mongoose.model("Crop").countDocuments();
        this.cropId = `agroCrop${count + 1}`;
    }
    next();
});

module.exports = mongoose.model("Crop", CropSchema);
