const express = require("express");
const { signup, login } = require("../controllers/authController"); // Removed getUsers since it's defined here
const authController = require("../controllers/authController");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { sendOTPEmail } = require("../services/OTPMailService");
let otpStore = {};

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  // Check if user exists with this email
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    // Send OTP by email
    await sendOTPEmail(email, otp);

    // Store OTP with expiry, here simple store (for production use Redis or DB)
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // expires in 10 mins

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "Email, OTP and new password required" });

  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "OTP not found or expired" });

  if (record.otp.toString() !== otp.toString())
    return res.status(400).json({ message: "Invalid OTP" });

  if (Date.now() > record.expiresAt)
    return res.status(400).json({ message: "OTP expired" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    // Delete OTP after successful reset
    delete otpStore[email];

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// ✅ GET all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find();

        // Map users to include `id` instead of `_id`
        const mappedUsers = users.map(user => ({
            id: user._id.toString(), // Convert MongoDB _id to id
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            state: user.state,
            address: user.address,
            language: user.language,
        }));

        res.status(200).json({ data: mappedUsers, total: mappedUsers.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/users/:id", async (req, res) => {
    try {
        const { id } = req.params; // ✅ Get user ID from request params
        const user = await User.findById(id).select("-password"); // ✅ Exclude password

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});


router.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully", data: { id } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true }).select("-password");

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});
  
router.get("/user", authController.getUserProfile);  
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
