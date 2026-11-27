"use strict";
// Recursively turns Mongo documents (lean or hydrated) into client JSON:
// _id -> id, ObjectId -> string, and strips fields that must never leave the server.
const HIDDEN = new Set(["password", "__v", "failedLogins", "lockUntil", "tokenHash", "codeHash"]);

function serialize(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(serialize);
  if (value instanceof Date) return value;
  if (typeof value !== "object") return value;
  if (value._bsontype === "ObjectId" || value._bsontype === "ObjectID") return value.toString();
  if (typeof value.toObject === "function") return serialize(value.toObject());
  if (Buffer.isBuffer(value)) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (HIDDEN.has(k)) continue;
    if (k === "_id") {
      out.id = serialize(v);
      continue;
    }
    out[k] = serialize(v);
  }
  return out;
}
module.exports = serialize;
