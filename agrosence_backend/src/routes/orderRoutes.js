"use strict";
const router = require("express").Router();
const c = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");
const { validate, idParams } = require("../middleware/validate");
const limits = require("../middleware/rateLimit");
const s = require("../validators/schemas").order;

router.use(authenticate);
router.post("/", limits.orders, validate({ body: s.create }), c.create);
router.get("/mine", validate({ query: s.list }), c.listMine);
router.put("/:id/status", validate({ params: idParams, body: s.status }), c.updateStatus);

module.exports = router;
