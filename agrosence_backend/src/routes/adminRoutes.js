"use strict";
const router = require("express").Router();
const Crop = require("../models/Crop");
const admin = require("../controllers/adminController");
const content = require("../controllers/contentController");
const crops = require("../controllers/cropController");
const orders = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");
const { authorize, ownerOrRole } = require("../middleware/rbac");
const { validate, idParams } = require("../middleware/validate");
const upload = require("../middleware/upload");
const s = require("../validators/schemas");

const staff = authorize("admin", "moderator");
const adminOnly = authorize("admin");

router.use(authenticate);

router.get("/stats", staff, admin.stats);

// users: moderators read-only
router.get("/users", staff, validate({ query: s.admin.userList }), admin.listUsers);
router.get("/users/:id", staff, validate({ params: idParams }), admin.getUser);
router.put("/users/:id", adminOnly, validate({ params: idParams, body: s.admin.userUpdate }), admin.updateUser);
router.patch("/users/:id/role", adminOnly, validate({ params: idParams, body: s.admin.role }), admin.setRole);
router.patch("/users/:id/status", adminOnly, validate({ params: idParams, body: s.admin.status }), admin.setStatus);
router.delete("/users/:id", adminOnly, validate({ params: idParams }), admin.deleteUser);

router.get("/contacts", staff, validate({ query: s.listQuery }), content.listContacts);
router.delete("/contacts/:id", staff, validate({ params: idParams }), content.deleteContact);

router.post("/schemes", staff, validate({ body: s.scheme.create }), content.createScheme);
router.put("/schemes/:id", staff, validate({ params: idParams, body: s.scheme.update }), content.updateScheme);
router.delete("/schemes/:id", staff, validate({ params: idParams }), content.deleteScheme);

router.post("/resources", staff, upload.image("image"), validate({ body: s.resource.create }), content.createResource);
router.put("/resources/:id", staff, upload.image("image"), validate({ params: idParams, body: s.resource.update }), content.updateResource);
router.delete("/resources/:id", staff, validate({ params: idParams }), content.deleteResource);

router.get("/orders", staff, validate({ query: s.admin.ordersList }), orders.listAdmin);
router.get("/crops", staff, validate({ query: s.admin.cropsList }), crops.listAdmin);
router.delete(
  "/crops/:id",
  staff,
  validate({ params: idParams }),
  ownerOrRole((req) => Crop.findById(req.params.id).select("userId cropName").lean(), (r) => r.userId, "admin", "moderator"),
  crops.remove
);

router.get("/audit-logs", adminOnly, validate({ query: s.admin.auditList }), admin.listAuditLogs);

module.exports = router;
