"use strict";
const serialize = require("./serialize");

const ok = (res, data = null, status = 200, meta) => {
  const body = { success: true, data: serialize(data) };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};
const created = (res, data) => ok(res, data, 201);
const paginated = (res, items, meta) => ok(res, items, 200, meta);
const message = (res, msg, status = 200) => ok(res, { message: msg }, status);

module.exports = { ok, created, paginated, message };
