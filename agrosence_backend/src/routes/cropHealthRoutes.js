require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const axios = require("axios");

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crop_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

// POST /api/crop-health
router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image file is required." });
  }

  try {
    const imageUrl = req.file.path;

    const healthResponse = await axios.post("https://crop.kindwise.com/api/v1/identification", {
      api_key: process.env.PLANT_ID_HEALTH_API_KEY,
      images: [imageUrl],
      plant_language: "en",
      disease_details: ["description"],
    });

    const suggestions = healthResponse.data?.health_assessment?.diseases;
    const isHealthy = healthResponse.data?.is_healthy;

    const status = isHealthy ? "Healthy ✅" : "Diseased ❌";
    const notes = isHealthy
      ? "No visible disease detected."
      : suggestions?.map((d) => `${d.name}: ${d.disease_details?.description}`).join("\n") ||
        "Possible disease detected, but no description found.";

    res.status(200).json({
      image: imageUrl,
      status,
      notes,
    });

  } catch (err) {
    console.error("Health API Error:", err.response?.data || err.message, err.response?.status);
    res.status(500).json({
      error: "Health detection failed.",
      debug: err.response?.data || err.message,
    });
  }
});

module.exports = router;
