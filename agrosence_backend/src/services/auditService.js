"use strict";
const AuditLog = require("../models/AuditLog");

/** Best-effort audit trail; failures never break the request. */
async function audit(req, action, targetType, targetId, meta) {
  try {
    await AuditLog.create({
      actorId: req.user?.id,
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action,
      targetType,
      targetId: targetId ? String(targetId) : undefined,
      meta,
      ip: req.ip,
    });
  } catch (err) {
    console.error("[audit] failed:", err.message);
  }
}
module.exports = { audit };
