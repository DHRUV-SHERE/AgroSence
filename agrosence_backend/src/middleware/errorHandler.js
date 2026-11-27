"use strict";
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

const notFound = (req, res, next) => next(ApiError.notFound(`Route not found: ${req.method} ${req.path}`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message;
  let errors = err.errors;

  if (err instanceof ApiError) {
    /* as is */
  } else if (err.name === "ValidationError" && err.errors) {
    status = 400;
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = "Validation failed";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid value for " + err.path;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
    message = `${field} already in use`;
    errors = [{ field, message }];
  } else if (err.name === "MulterError") {
    status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File too large (max 5MB per image)" : `Upload error: ${err.message}`;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON body";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body too large";
  } else if (/buffering timed out|ECONNREFUSED|MongoServerSelectionError|MongoNetworkError/i.test(err.message || "")) {
    status = 503;
    message = "Database is not reachable, please try again shortly";
  } else if (status < 500 && err.expose !== false && err.message) {
    /* http-errors style (4xx) */
  } else {
    status = 500;
  }

  if (status >= 500) {
    if (!env.isTest) console.error(`[error] ${req.method} ${req.originalUrl} -> ${status}:`, env.isProd ? err.message : err.stack);
    if (!(err instanceof ApiError)) message = "Internal server error";
  }

  const body = { success: false, message };
  if (errors && errors.length) body.errors = errors;
  if (!env.isProd && status >= 500 && !(err instanceof ApiError) && err.stack) body.stack = err.stack.split("\n").slice(0, 5);
  res.status(status).json(body);
};

module.exports = { notFound, errorHandler };
