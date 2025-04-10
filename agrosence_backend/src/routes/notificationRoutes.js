const express = require("express");
const Notification = require("../models/NotificationModel");

const router = express.Router();

// 🔹 Create a Notification (When Buyer Clicks "Buy Now")
router.post("/", async (req, res) => {
  try {
    const { sellerId, buyerId, cropId, message } = req.body;

    if (!sellerId || !buyerId || !cropId || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const notification = new Notification({
      sellerId,
      buyerId,
      cropId,
      message,
    });

    await notification.save();
    res.status(201).json({ message: "Notification sent successfully!" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🔹 Get Notifications for a Seller
router.get("/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const notifications = await Notification.find({ sellerId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🔹 Mark Notification as Read
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { status: "read" }, { new: true });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/:id/update", async (req, res) => {
  try {
    const { status } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (status === "accepted") {
      await Crop.findByIdAndUpdate(
        notification.cropId,
        { status: "Not Available" },
        { new: true }
      );
    }

    res.status(200).json({ message: `Notification marked as ${status}` });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
  
  router.put("/:id/update-status", async (req, res) => {
    try {
      const { status } = req.body;
      const crop = await Crop.findByIdAndUpdate(req.params.id, { status }, { new: true });
  
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
  
      res.status(200).json({ message: `Crop status updated to ${status}` });
    } catch (error) {
      console.error("Error updating crop status:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // 🔹 Delete Notification
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification removed successfully" });
  } catch (error) {
    console.error("Error removing notification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

  
module.exports = router;
