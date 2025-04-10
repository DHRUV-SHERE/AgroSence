const express = require("express");
const router = express.Router();
const Scheme = require("../models/GovSchemeModel");

// Create a new scheme
router.post("/add", async (req, res) => {
    try {
        const { name, description, eligibility, benefits, state, applyLink } = req.body;

        const newScheme = new Scheme({
            name,
            description,
            eligibility,
            benefits,
            state,
            applyLink, // ✅ Include applyLink
        });

        await newScheme.save();
        res.status(201).json({ message: "Scheme added successfully", scheme: newScheme });
    } catch (error) {
        console.error("Error adding scheme:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

// ✅ Get All Schemes

router.get("/all", async (req, res) => {
    try {
        const schemes = await Scheme.find();
        res.json({ data: schemes, total: schemes.length }); // ✅ Ensure applyLink is included
    } catch (error) {
        console.error("Error fetching schemes:", error);
        res.status(500).json({ error: "Server error" });
    }
});  

// ✅ Update Scheme
router.put("/update/:id", async (req, res) => {
    try {
        const { name, description, eligibility, benefits, state, applyLink } = req.body;

        const updatedScheme = await Scheme.findByIdAndUpdate(
            req.params.id,
            { name, description, eligibility, benefits, state, applyLink }, // ✅ Include applyLink
            { new: true }
        );

        if (!updatedScheme) {
            return res.status(404).json({ error: "Scheme not found" });
        }

        res.json({ message: "Scheme updated successfully", scheme: updatedScheme });
    } catch (error) {
        console.error("Error updating scheme:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ Delete Scheme
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Scheme.findByIdAndDelete(id);
        res.status(200).json({ message: "Scheme deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
