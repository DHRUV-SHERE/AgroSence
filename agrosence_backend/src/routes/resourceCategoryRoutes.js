require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Resource = require("../models/ResourceCategory");

// ✅ Cloudinary Setup
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crop_images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

// ✅ Add Resource (Cloudinary Upload)
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    console.log("Received body:", req.body);
    console.log("Uploaded file via Cloudinary:", req.file);

    const { name, description, link, purpose, advantages, howtouse, popularbrand } = req.body;

    if (!name || !description || !link || !purpose || !advantages || !howtouse || !popularbrand || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const imageUrl = req.file.path; // ✅ Cloudinary provides full URL

    const newResource = new Resource({
      name,
      description,
      link,
      purpose,
      advantages,
      howtouse,
      popularbrand,
      image: imageUrl, // ✅ Save Cloudinary URL
    });

    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error adding resource:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get All Resources (no need to append domain)
router.get("/all", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ success: false, message: "Error fetching resources" });
  }
});

// ✅ Get Single Resource by ID
router.get("/:_id", async (req, res) => {
  try {
    console.log("Fetching resource with ID:", req.params._id);
    const resource = await Resource.findById(req.params._id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.status(200).json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Update Resource (no image change for now)
router.put("/update/:id", async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Resource updated successfully", resource: updatedResource });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Delete Resource
router.delete("/delete/:id", async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
