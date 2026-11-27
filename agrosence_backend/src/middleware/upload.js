"use strict";
const multer = require("multer");
const ApiError = require("../utils/ApiError");

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

const base = multer({
  storage: multer.memoryStorage(), // no local disk (ephemeral on Render)
  limits: { fileSize: MAX_BYTES, files: 4, fields: 30, fieldSize: 20 * 1024 },
  fileFilter: (req, file, cb) =>
    ALLOWED.has(file.mimetype) ? cb(null, true) : cb(ApiError.badRequest("Only JPG, PNG or WebP images are allowed")),
});

// magic-byte check so a renamed .exe/.html cannot pass off as an image
function sniff(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}

function verifyFiles(req, res, next) {
  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : req.file ? [req.file] : [];
  for (const f of files) {
    const real = sniff(f.buffer);
    if (!real) return next(ApiError.badRequest("Uploaded file is not a valid JPG, PNG or WebP image"));
    f.mimetype = real;
  }
  next();
}

const images = (field, max) => [base.array(field, max), verifyFiles];
const image = (field) => [base.single(field), verifyFiles];

module.exports = { images, image, MAX_BYTES };
