"use strict";
class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.expose = true;
  }
  static badRequest(msg = "Bad request", errors) { return new ApiError(400, msg, errors); }
  static unauthorized(msg = "Authentication required") { return new ApiError(401, msg); }
  static forbidden(msg = "You do not have permission to do that") { return new ApiError(403, msg); }
  static notFound(msg = "Not found") { return new ApiError(404, msg); }
  static conflict(msg = "Conflict") { return new ApiError(409, msg); }
  static tooMany(msg = "Too many requests, please try again later") { return new ApiError(429, msg); }
  static unavailable(msg = "Service temporarily unavailable") { return new ApiError(503, msg); }
}
module.exports = ApiError;
