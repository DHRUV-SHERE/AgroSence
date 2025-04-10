const mongoose = require("mongoose");

const SchemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    benefits: { type: String, required: true },
    state: { type: String, default: "All States" }, // If applicable to all states
    applyLink: { type: String, required: true }, // ✅ Added Apply Link
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Scheme", SchemeSchema);
