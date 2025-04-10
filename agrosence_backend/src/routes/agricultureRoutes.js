const express = require("express");
const router = express.Router();
const agricultureFAQ = require("../data/agricultureFAQ");

// Basic keyword matching function
// Inside findAnswer function, implement fuzzy search (using fuse.js or similar)
const findAnswer = (query) => {
  const queryLower = query.toLowerCase();

  // Try matching the question with fuzzy search logic or a list of common variations
  for (let faq of agricultureFAQ) {
    if (faq.question.toLowerCase().includes(queryLower)) {
      return faq.answer;
    }
  }
  return "Sorry, I couldn't find an answer to your question."; // Fallback response
};

router.get("/faq", (req, res) => {
  const query = req.query.q; // Get the query parameter 'q'
  if (query) {
    const answer = findAnswer(query); // Find the answer
    res.json({ answer: answer }); // Send the answer back
  } else {
    res.status(400).json({ error: "Please provide a question." });
  }
});

module.exports = router;
