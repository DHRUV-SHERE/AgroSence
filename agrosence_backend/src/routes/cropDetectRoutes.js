require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const axios = require("axios");

const router = express.Router();

// 🔹 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crop_images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

// 🔹 Fallback: Get description from Wikipedia
async function getWikiDescription(title) {
  try {
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const wikiRes = await axios.get(wikiUrl);
    return wikiRes.data.extract || "No description available.";
  } catch (err) {
    console.error("Wikipedia Error:", err.message);
    return "No description available.";
  }
}

// 🔹 Crop Detection Route
router.post("/crop-detect", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file.path;

    const plantResponse = await axios.post("https://api.plant.id/v2/identify", {
      api_key: process.env.PLANT_ID_API_KEY,
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

    res.json({
      scientificName,
      commonNames,  // array
      description,
      image: imageUrl,
    });

  } catch (err) {
    console.error("Plant ID Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Crop detection failed." });
  }
});

router.post("/crop-health", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file.path;

    const healthResponse = await axios.post("https://api.plant.id/v2/health_assessment", {
      api_key: process.env.PLANT_ID_HEALTH_API_KEY,
      images: [imageUrl],
      plant_language: "en",
      disease_details: ["description"],
    });

    const suggestions = healthResponse.data?.health_assessment?.diseases;
    const isHealthy = healthResponse.data?.is_healthy;

    let status = isHealthy ? "Healthy ✅" : "Diseased ❌";
    let notes = isHealthy
      ? "No visible disease detected."
      : suggestions?.map((d) => `${d.name}: ${d.disease_details?.description}`).join("\n") ||
      "Possible disease detected, but no description found.";

    res.json({
      image: imageUrl,
      status,
      notes,
    });
  } catch (err) {
  console.error("Health API Error:", err.response?.data || err.message, err.response?.status);
 res.status(500).json({ 
  error: "Health detection failed.", 
  debug: err.response?.data || err.message 
});
}
});

module.exports = router;
