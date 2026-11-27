"use strict";
const Crop = require("../models/Crop");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated, message } = require("../utils/response");
const { parsePage, paginate, escapeRegex } = require("../utils/pagination");
const storage = require("../services/storage");
const { audit } = require("../services/auditService");

const SELLER_FIELDS = "name mobile state address active";
const SORTS = ["createdAt", "cropSellingPrice", "cropName", "cropQuantity"];

/** Crop shape: legacy field names + id, organic boolean, seller object. */
function cropDTO(c) {
  if (!c) return c;
  const o = typeof c.toObject === "function" ? c.toObject() : { ...c };
  const populated = o.userId && typeof o.userId === "object" && o.userId.name !== undefined;
  const seller = populated ? o.userId : undefined;
  return {
    ...o,
    userId: populated ? String(o.userId._id) : String(o.userId),
    seller: seller && { id: String(seller._id), name: seller.name, mobile: seller.mobile, state: seller.state, address: seller.address },
    organic: o.grownOrganically === "Yes",
    createdAt: o.createdAt || o.sellingDate,
  };
}

function buildFilter(q, { forceAvailable }) {
  const f = {};
  if (forceAvailable) f.cropStatus = "Available";
  else if (q.status) f.cropStatus = q.status;
  if (q.category) f.cropCategory = new RegExp(`^${escapeRegex(q.category)}$`, "i");
  if (q.organic !== undefined) f.grownOrganically = q.organic ? "Yes" : "No";
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    f.cropSellingPrice = {};
    if (q.minPrice !== undefined) f.cropSellingPrice.$gte = q.minPrice;
    if (q.maxPrice !== undefined) f.cropSellingPrice.$lte = q.maxPrice;
  }
  if (q.state) f.state = new RegExp(`^${escapeRegex(q.state)}$`, "i");
  if (q.q) {
    const r = new RegExp(escapeRegex(q.q), "i");
    f.$or = [{ cropName: r }, { cropDescription: r }, { cropCategory: r }];
  }
  return f;
}

async function list(req, res, { forceAvailable, mine }) {
  const q = req.valid.query;
  const filter = buildFilter(q, { forceAvailable });
  if (mine) filter.userId = req.user._id;
  // the public marketplace never shows listings of suspended sellers
  if (forceAvailable) filter.userId = { $nin: await User.find({ active: false }).distinct("_id") };
  const p = parsePage(q, { allowedSort: SORTS });
  const { items, meta } = await paginate(Crop, filter, p, { populate: { path: "userId", select: SELLER_FIELDS }, map: cropDTO });
  paginated(res, items, meta);
}

exports.listPublic = asyncHandler((req, res) => list(req, res, { forceAvailable: true }));
exports.listMine = asyncHandler((req, res) => list(req, res, { mine: true }));
exports.listAdmin = asyncHandler((req, res) => list(req, res, {}));

exports.getOne = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id).populate("userId", SELLER_FIELDS).lean();
  if (!crop) throw ApiError.notFound("Crop not found");
  const sellerSuspended = crop.userId && crop.userId.active === false;
  const privileged = req.user.role === "admin" || req.user.role === "moderator" || String(crop.userId && crop.userId._id) === req.user.id;
  if (sellerSuspended && !privileged) throw ApiError.notFound("Crop not found");
  ok(res, cropDTO(crop));
});

exports.create = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length) throw ApiError.badRequest("At least one image is required (field: cropImages)", [{ field: "cropImages", message: "Required" }]);
  const seller = await User.findById(req.user.id).select("state").lean();
  const images = await storage.uploadImages(files, "crop_images");
  const { grownOrganically, ...rest } = req.body;
  const crop = await Crop.create({
    ...rest,
    grownOrganically: grownOrganically ? "Yes" : "No",
    cropImages: images,
    userId: req.user._id, // never trusted from the body
    state: seller?.state,
  });
  created(res, cropDTO(crop));
});

exports.update = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.resource._id);
  const { grownOrganically, ...rest } = req.body;
  Object.assign(crop, rest);
  if (grownOrganically !== undefined) crop.grownOrganically = grownOrganically ? "Yes" : "No";
  if (req.files && req.files.length) crop.cropImages = await storage.uploadImages(req.files, "crop_images");
  if (rest.cropQuantity !== undefined && rest.cropQuantity > 0 && crop.cropStatus === "Sold" && rest.cropStatus === undefined) {
    crop.cropStatus = "Available"; // restocked
  }
  await crop.save();
  ok(res, cropDTO(crop));
});

exports.remove = asyncHandler(async (req, res) => {
  await Crop.deleteOne({ _id: req.resource._id });
  if (!req.isOwner) await audit(req, "crop.delete", "Crop", req.resource._id, { cropName: req.resource.cropName, owner: String(req.resource.userId) });
  message(res, "Crop deleted");
});

exports.cropDTO = cropDTO;
