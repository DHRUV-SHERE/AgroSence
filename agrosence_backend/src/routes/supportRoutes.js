const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "workwithdhruv05@gmail.com",
        pass: "kypr mujj dkol qtpb", 
    },
    });

    let mailOptions = {
      from: email,
      to: "projectagrosence2024@gmail.com",
      subject: "New Support Request",
      text: `From: ${name} (${email})\n\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
