"use strict";
// Public + semi-public content routes mounted directly under /api.
const router = require("express").Router();
const c = require("../controllers/contentController");
const { optionalAuth, authenticate } = require("../middleware/auth");
const { validate, idParams } = require("../middleware/validate");
const limits = require("../middleware/rateLimit");
const upload = require("../middleware/upload");
const { dailyQuota } = require("../services/quota");
const s = require("../validators/schemas");

router.get("/schemes", validate({ query: s.scheme.list }), c.listSchemes);
router.get("/schemes/:id", validate({ params: idParams }), c.getScheme);
router.get("/resources", validate({ query: s.listQuery }), c.listResources);
router.get("/resources/:id", validate({ params: idParams }), c.getResource);
router.get("/agriculture/faq", c.faq);

router.post("/contact", limits.contact, validate({ body: s.contact }), c.submitContact);
router.post("/support", limits.contact, optionalAuth, validate({ body: s.support }), c.support);
router.post("/chatbot", optionalAuth, limits.chatbotAnon, limits.chatbotAuthed, validate({ body: s.chatbot }), c.chatbot);
router.post("/crop-detect", authenticate, limits.upload, dailyQuota("crop-detect", 20), upload.image("image"), c.cropDetect);

module.exports = router;
