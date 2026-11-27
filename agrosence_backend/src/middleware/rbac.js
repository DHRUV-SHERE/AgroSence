"use strict";
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/** Allow only the listed roles. Must run after authenticate. */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};

/**
 * Resource owner OR one of `roles`. `loader(req)` returns the resource (or null -> 404) and an owner id via `ownerOf`.
 * The loaded resource is exposed as req.resource so handlers do not fetch it twice.
 */
const ownerOrRole = (loader, ownerOf, ...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    const resource = await loader(req);
    if (!resource) throw ApiError.notFound();
    const isOwner = String(ownerOf(resource)) === req.user.id;
    if (!isOwner && !roles.includes(req.user.role)) throw ApiError.forbidden();
    req.resource = resource;
    req.isOwner = isOwner;
    next();
  });

module.exports = { authorize, ownerOrRole };
