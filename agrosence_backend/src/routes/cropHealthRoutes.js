require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const axios = require("axios");

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer and Cloudinary storage setup
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
    console.log("Image URL sent to Kindwise:", imageUrl);
    console.log("Using API Key:", process.env.PLANT_ID_HEALTH_API_KEY);

    const response = await axios.post(
      "https://crop.kindwise.com/api/v1/identification",
      {
        images: [imageUrl],
        language: "en",
        details: ["description", "treatment", "cause"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Api-Key": process.env.PLANT_ID_HEALTH_API_KEY,
        },
      }
    );
    const diseases = response.data?.result?.diseases || [];
    const isHealthy = diseases.length === 0;

    const status = isHealthy ? "Healthy ✅" : "Diseased ❌";
    const notes = isHealthy
      ? "No visible disease detected."
      : diseases
        .map(
          (d) =>
            `${d.name}: ${d.details?.description || "No description available."}`
        )
        .join("\n");

    res.status(200).json({
      image: imageUrl,
      status,
      notes,
    });
  } catch (err) {
    console.error("Health API Error:");
    if (err.response) {
      console.error("Response Data:", err.response.data);
      console.error("Status Code:", err.response.status);
    } else {
      console.error("Message:", err.message);
    }
    res.status(500).json({
      error: "Health detection failed.",
      debug: err.response?.data || err.message,
    });
  }
});

module.exports = router;
