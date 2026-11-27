"use strict";
const router = require("express").Router();
const c = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");
const { validate, idParams } = require("../middleware/validate");

router.use(authenticate);
router.get("/", c.list);
router.put("/:id/read", validate({ params: idParams }), c.markRead);
router.delete("/:id", validate({ params: idParams }), c.remove);

module.exports = router;
