"use strict";
// Image storage on Cloudinary. Uploads are streamed from memory (nothing touches local disk).
const cloudinary = require("cloudinary").v2;
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

let configured = false;
function ensureConfigured() {
  if (!env.cloudinaryConfigured) throw ApiError.unavailable("Image uploads are not configured on the server");
  if (!configured) {
    if (!env.cloudinary.url) {
      cloudinary.config({
        cloud_name: env.cloudinary.cloudName,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
        secure: true,
      });
    } else {
      cloudinary.config({ secure: true }); // CLOUDINARY_URL is read by the SDK itself
    }
    configured = true;
  }
}

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

/** Uploads multer memory files, returns absolute URLs. Exposed on the module so tests can stub it. */
async function uploadImages(files, folder) {
  ensureConfigured();
  try {
    return await Promise.all(files.map((f) => module.exports.uploadBuffer(f.buffer, folder)));
  } catch (err) {
    console.error("[storage] upload failed:", err.message);
    throw ApiError.unavailable("Image upload failed, please try again");
  }
}

module.exports = { uploadImages, uploadBuffer, ensureConfigured };
