require("dotenv").config(); 
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
// const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Crop = require("../models/CropModel");
const User = require("../models/User");

const router = express.Router();

// 🔹 Configure Cloudinary securely

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Config:", cloudinary.config()); // Debugging line

// 🔹 Setup Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crop_images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

// ✅ Upload Crop with Cloudinary Images
router.post("/add", upload.array("cropImages", 4), async (req, res) => {
  try {
    console.log("✅ Received Files:", req.files);
    console.log("✅ Request Body:", req.body);

    const {
      cropName,
      cropDescription,
      cropCategory,
      cropSellingPrice,
      cropUnit,
      cropQuantity,
      grownOrganically,
      userId,
    } = req.body;

    if (!userId) {
      console.error("❌ Error: userId is missing");
      return res.status(400).json({ message: "User ID is required" });
    }

    const seller = await User.findById(userId);
    if (!seller) {
      console.error("❌ Error: Seller not found for userId:", userId);
      return res.status(404).json({ message: "Seller not found" });
    }

    if (!req.files || req.files.length === 0) {
      console.error("❌ Error: No files uploaded");
      return res.status(400).json({ message: "At least one image is required" });
    }

    const cropImages = req.files.map((file) => file.path);

    const newCrop = new Crop({
      cropName,
      cropDescription,
      cropCategory,
      cropSellingPrice,
      cropUnit,
      cropQuantity,
      grownOrganically: grownOrganically === "true" ? "Yes" : "No",
      cropImages,
      userId,
    });

    await newCrop.save();
    res.status(201).json({ message: "✅ Crop added successfully", crop: newCrop });
  } catch (error) {
    console.error("❌ Error uploading crop:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Fetch user details
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fetch all available crops
router.get("/", async (req, res) => {
  try {
    const crops = await Crop.find({ cropStatus: "Available" }).populate("userId", "name mobile state address");
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Fetch a specific crop by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findById(id).populate("userId", "name mobile state address");
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.status(200).json(crop);
  } catch (error) {
    console.error("Error fetching crop:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Mark crop as sold
router.put("/sell/:id", async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    crop.cropStatus = "Sold";
    await crop.save();
    res.json({ message: "Crop marked as sold", crop });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router; // ✅ Single export
