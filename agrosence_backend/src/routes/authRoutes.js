"use strict";
const router = require("express").Router();
const c = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const limits = require("../middleware/rateLimit");
const s = require("../validators/schemas").auth;

router.post("/signup", limits.signup, validate({ body: s.signup }), c.signup);
router.post("/login", limits.login, validate({ body: s.login }), c.login);
router.post("/refresh", limits.refresh, validate({ body: s.refresh }), c.refresh);
router.post("/logout", authenticate, validate({ body: s.logout }), c.logout);
router.get("/me", authenticate, c.me);
router.put("/me", authenticate, limits.login, validate({ body: s.updateMe }), c.updateMe);
router.put("/me/password", authenticate, limits.login, validate({ body: s.changePassword }), c.changePassword);
router.post("/send-otp", limits.otp, validate({ body: s.sendOtp }), c.sendOtp);
router.post("/reset-password", limits.otp, validate({ body: s.resetPassword }), c.resetPassword);

module.exports = router;
