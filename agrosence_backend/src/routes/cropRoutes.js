"use strict";
const router = require("express").Router();
const Crop = require("../models/Crop");
const c = require("../controllers/cropController");
const { authenticate } = require("../middleware/auth");
const { ownerOrRole } = require("../middleware/rbac");
const { validate, idParams } = require("../middleware/validate");
const upload = require("../middleware/upload");
const limits = require("../middleware/rateLimit");
const { dailyQuota } = require("../services/quota");
const s = require("../validators/schemas").crop;

const loadCrop = (req) => Crop.findById(req.params.id).select("userId cropName").lean();
const canEdit = ownerOrRole(loadCrop, (r) => r.userId, "admin", "moderator");

router.use(authenticate);
router.get("/", validate({ query: s.list }), c.listPublic);
router.get("/mine", validate({ query: s.list }), c.listMine);
const uploadQuota = dailyQuota("crop-upload", 30);
router.post("/", limits.upload, uploadQuota, upload.images("cropImages", 4), validate({ body: s.create }), c.create);
router.get("/:id", validate({ params: idParams }), c.getOne);
router.put("/:id", validate({ params: idParams }), canEdit, dailyQuota("crop-upload", 30, { when: (req) => req.is("multipart/form-data") }), upload.images("cropImages", 4), validate({ body: s.update }), c.update);
router.delete("/:id", validate({ params: idParams }), canEdit, c.remove);

module.exports = router;
