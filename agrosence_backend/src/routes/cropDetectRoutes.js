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

// Get fallback description from Wikipedia
async function getWikiDescription(title) {
  try {
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await axios.get(wikiUrl);
    return res.data.extract || "No description available.";
  } catch (err) {
    console.error("Wikipedia Error:", err.message);
    return "No description available.";
  }
}

// POST /api/crop-detect
router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image file is required." });
  }

  try {
    const imageUrl = req.file.path;

    const plantResponse = await axios.post("https://api.plant.id/v2/identify", {
      api_key: process.env.PLANT_ID_IDENTIFICATION_API_KEY,
      images: [imageUrl],
      modifiers: ["crops_fast", "similar_images"],
      plant_language: "en",
      plant_details: ["common_names", "url", "wiki_description", "taxonomy"],
    });

    const plant = plantResponse.data?.suggestions?.[0];
    if (!plant) {
      return res.status(404).json({ error: "Crop not identified" });
    }

    const scientificName = plant.plant_name;
    const commonNames = plant.plant_details?.common_names || [];
    const description = plant.plant_details?.wiki_description?.value
      || await getWikiDescription(scientificName);

    res.status(200).json({
      scientificName,
      commonNames,
      description,
      image: imageUrl,
    });

  } catch (err) {
    console.error("Plant ID Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Crop detection failed." });
  }
});

module.exports = router;
