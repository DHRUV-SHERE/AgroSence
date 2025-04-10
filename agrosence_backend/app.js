const express = require("express");
const connectDB = require("./src/config/db");
const contactFormRoutes = require('./src/routes/contactFormRoutes');
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./src/routes/authRoutes");
const agricultureRoutes = require("./src/routes/agricultureRoutes");
const schemeRoutes = require("./src/routes/govSchemeRoutes");
const resourceRoutes = require("./src/routes/resourceCategoryRoutes");
const getGeminiResponse = require("./src/services/GeminiAPI");
const cropSellRoutes = require("./src/routes/cropSellRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const orderRoutes = require("./src/routes/orderRoutes"); 
const supportRoutes = require("./src/routes/supportRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes
app.use("/uploads", express.static("uploads")); 
app.use("/api/resources", resourceRoutes);
app.use("/api/contact", contactFormRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/crops", cropSellRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/agriculture", agricultureRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/support", supportRoutes);

app.get("/api/resources/all", async (req, res) => {
    try {
        const resources = await ResourceModel.find();

        res.json({
            success: true,
            data: resources.map(resource => ({
                ...resource._doc,
                image: resource.image ? `${req.protocol}://${req.get("host")}${resource.image}` : null
            }))
        });
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ success: false, message: "Error fetching resources" });
    }
});

app.post("/api/chatbot", async (req, res) => {
    const { message } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
  
    const botResponse = await getGeminiResponse(message);
    res.json({ answer: botResponse });
  });
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
