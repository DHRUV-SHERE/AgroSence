"use strict";
// Public content (schemes, resources, FAQ) + contact/support/chatbot/crop-detect + shared admin CRUD helpers.
const Scheme = require("../models/Scheme");
const Resource = require("../models/Resource");
const Contact = require("../models/Contact");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated, message } = require("../utils/response");
const { parsePage, paginate, escapeRegex } = require("../utils/pagination");
const storage = require("../services/storage");
const { audit } = require("../services/auditService");
const { sendTeamMail } = require("../services/mailService");
const ai = require("../services/aiService");
const faq = require("../data/agricultureFAQ");

const cache = (res, seconds = 60) => res.set("Cache-Control", `public, max-age=${seconds}, stale-while-revalidate=300`);
const searchOr = (q, fields) => {
  const r = new RegExp(escapeRegex(q), "i");
  return fields.map((f) => ({ [f]: r }));
};

// ---------- schemes ----------
exports.listSchemes = asyncHandler(async (req, res) => {
  const q = req.valid.query;
  const filter = {};
  if (q.state) filter.state = { $in: [q.state, "All States"] };
  if (q.q) filter.$or = searchOr(q.q, ["name", "description", "benefits"]);
  const { items, meta } = await paginate(Scheme, filter, parsePage(q, { allowedSort: ["createdAt", "name"] }));
  cache(res);
  paginated(res, items, meta);
});
exports.getScheme = asyncHandler(async (req, res) => {
  const s = await Scheme.findById(req.params.id).lean();
  if (!s) throw ApiError.notFound("Scheme not found");
  cache(res);
  ok(res, s);
});
exports.createScheme = asyncHandler(async (req, res) => {
  const s = await Scheme.create(req.body);
  await audit(req, "scheme.create", "Scheme", s._id, { name: s.name });
  created(res, s);
});
exports.updateScheme = asyncHandler(async (req, res) => {
  const s = await Scheme.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).lean();
  if (!s) throw ApiError.notFound("Scheme not found");
  await audit(req, "scheme.update", "Scheme", s._id, { fields: Object.keys(req.body) });
  ok(res, s);
});
exports.deleteScheme = asyncHandler(async (req, res) => {
  const s = await Scheme.findByIdAndDelete(req.params.id).lean();
  if (!s) throw ApiError.notFound("Scheme not found");
  await audit(req, "scheme.delete", "Scheme", s._id, { name: s.name });
  message(res, "Scheme deleted");
});

// ---------- resources ----------
exports.listResources = asyncHandler(async (req, res) => {
  const q = req.valid.query;
  const filter = q.q ? { $or: searchOr(q.q, ["name", "description", "purpose", "popularbrand"]) } : {};
  const { items, meta } = await paginate(Resource, filter, parsePage(q, { allowedSort: ["createdAt", "name"] }));
  cache(res);
  paginated(res, items, meta);
});
exports.getResource = asyncHandler(async (req, res) => {
  const r = await Resource.findById(req.params.id).lean();
  if (!r) throw ApiError.notFound("Resource not found");
  cache(res);
  ok(res, r);
});
exports.createResource = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Image is required (field: image)", [{ field: "image", message: "Required" }]);
  const [image] = await storage.uploadImages([req.file], "resource_images");
  const r = await Resource.create({ ...req.body, image });
  await audit(req, "resource.create", "Resource", r._id, { name: r.name });
  created(res, r);
});
exports.updateResource = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (req.file) [update.image] = await storage.uploadImages([req.file], "resource_images");
  const r = await Resource.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true }).lean();
  if (!r) throw ApiError.notFound("Resource not found");
  await audit(req, "resource.update", "Resource", r._id, { fields: Object.keys(update) });
  ok(res, r);
});
exports.deleteResource = asyncHandler(async (req, res) => {
  const r = await Resource.findByIdAndDelete(req.params.id).lean();
  if (!r) throw ApiError.notFound("Resource not found");
  await audit(req, "resource.delete", "Resource", r._id, { name: r.name });
  message(res, "Resource deleted");
});

// ---------- FAQ ----------
exports.faq = (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase().slice(0, 200) : "";
  cache(res, 300);
  if (!q) return ok(res, faq);
  const hit = faq.find((f) => f.question.toLowerCase().includes(q));
  ok(res, { answer: hit ? hit.answer : "Sorry, I couldn't find an answer to your question." });
};

// ---------- contact (public) + admin ----------
exports.submitContact = asyncHandler(async (req, res) => {
  const c = await Contact.create(req.body);
  // DB save is the source of truth; email is best-effort.
  const emailed = await sendTeamMail(
    { subject: "New AgroSence contact form", name: c.name, email: c.email, message: c.message, extra: `Mobile: ${c.mobile || "-"}  Address: ${c.address || "-"}` },
    { soft: true }
  );
  created(res, { message: "Thanks! Your message has been received.", emailed });
});
exports.listContacts = asyncHandler(async (req, res) => {
  const q = req.valid.query;
  const filter = q.q ? { $or: searchOr(q.q, ["name", "email", "message", "mobile"]) } : {};
  const { items, meta } = await paginate(Contact, filter, parsePage(q, { allowedSort: ["createdAt", "name"] }), {
    map: (c) => ({ ...c, createdAt: c.createdAt || c.dateSubmitted }),
  });
  paginated(res, items, meta);
});
exports.deleteContact = asyncHandler(async (req, res) => {
  const c = await Contact.findByIdAndDelete(req.params.id).lean();
  if (!c) throw ApiError.notFound("Contact not found");
  await audit(req, "contact.delete", "Contact", c._id, { email: c.email });
  message(res, "Contact deleted");
});

// ---------- support / chatbot / crop-detect ----------
exports.support = asyncHandler(async (req, res) => {
  const { name, email, message: text } = req.body;
  await sendTeamMail({ subject: "New AgroSence support request", name, email, message: text, extra: req.user ? `User id: ${req.user.id}` : "" });
  message(res, "Message sent successfully!");
});
exports.chatbot = asyncHandler(async (req, res) => {
  ok(res, { answer: await ai.getChatAnswer(req.body.message) });
});
exports.cropDetect = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Image is required (field: image)", [{ field: "image", message: "Required" }]);
  // The photo goes to Plant.id as base64 straight from memory and is never stored (no Cloudinary copy, no disk).
  const result = await ai.identifyCrop(req.file.buffer, req.file.mimetype);
  ok(res, { ...result, image: null });
});
