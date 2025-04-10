const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Resource = require("../models/ResourceCategory");

// Fix storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure 'uploads/' exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const upload = multer({ storage });

// Fix route definition (change `app.post` to `router.post`)
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);

    const { name, description, link, purpose, advantages, howtouse, popularbrand } = req.body;

    if (!name || !description || !link || !purpose || !advantages || !howtouse || !popularbrand || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const newResource = new Resource({
      name,
      description,
      link,
      purpose,
      advantages,
      howtouse,
      popularbrand,
      image: imagePath,
    });

    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error adding resource:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all resources
router.get("/all", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.status(200).json({ data: resources });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/:_id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params._id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.status(200).json(resource); // Return directly, no need to wrap in `{ data: resource }`
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update a resource
router.put("/update/:id", async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Resource updated successfully", resource: updatedResource });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete a resource
router.delete("/delete/:id", async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
