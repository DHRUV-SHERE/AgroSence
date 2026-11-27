"use strict";
/**
 * Scheme states were stored inconsistently ("gujarat", "andhra-pradesh", "All States", "Bihar").
 * Canonical form: Title Case with spaces.
 */
const ALL = "All States";

function normalizeState(value) {
  const v = String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!v) return ALL;
  return v.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

const escapeRegex = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Case-insensitive regex that treats spaces, hyphens and underscores as the same separator. */
function stateRegex(value) {
  const words = normalizeState(value).split(" ").map(escapeRegex);
  return new RegExp(`^${words.join("[\\s_-]+")}$`, "i");
}

module.exports = { normalizeState, stateRegex, ALL };
