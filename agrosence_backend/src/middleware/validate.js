"use strict";
const { z } = require("zod");
const ApiError = require("../utils/ApiError");

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");
const idParams = z.object({ id: objectId });

function formatIssues(error) {
  return error.issues.map((i) => ({ field: i.path.join(".") || "body", message: i.message }));
}

/**
 * validate({ body, query, params }) - parsed (and stripped of unknown keys = mass-assignment whitelist) values
 * replace req.body / req.params. Parsed query is exposed as req.valid.query.
 */
const validate = (schemas) => (req, res, next) => {
  const errors = [];
  req.valid = {};
  for (const part of ["params", "query", "body"]) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part] ?? {});
    if (!result.success) errors.push(...formatIssues(result.error));
    else if (part === "query") req.valid.query = result.data;
    else req[part] = result.data;
  }
  if (errors.length) return next(new ApiError(400, errors[0].message ? `Validation failed: ${errors[0].message}` : "Validation failed", errors));
  next();
};

// shared field schemas
const str = (max = 200, min = 1) => z.string().trim().min(min, "Required").max(max);
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/\d/, "Password must contain a number");

module.exports = { validate, z, objectId, idParams, str, password };
