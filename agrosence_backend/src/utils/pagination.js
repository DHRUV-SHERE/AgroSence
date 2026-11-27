"use strict";
function parsePage(query, { allowedSort = ["createdAt"], defaultSort = "-createdAt", maxLimit = 100, defaultLimit = 20 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  let sort = typeof query.sort === "string" ? query.sort : defaultSort;
  if (!allowedSort.includes(sort.replace(/^-/, ""))) sort = defaultSort;
  const sortObj = { [sort.replace(/^-/, "")]: sort.startsWith("-") ? -1 : 1 };
  if (sortObj._id === undefined) sortObj._id = -1; // stable ordering
  return { page, limit, skip: (page - 1) * limit, sort: sortObj };
}
const buildMeta = (page, limit, total) => ({ page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });

/** Run a lean find + count in parallel. */
async function paginate(Model, filter, p, { select, populate, map } = {}) {
  let q = Model.find(filter).sort(p.sort).skip(p.skip).limit(p.limit);
  if (select) q = q.select(select);
  if (populate) for (const pop of [].concat(populate)) q = q.populate(pop);
  const [items, total] = await Promise.all([q.lean(), Model.countDocuments(filter)]);
  return { items: map ? items.map(map) : items, meta: buildMeta(p.page, p.limit, total) };
}

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
module.exports = { parsePage, buildMeta, paginate, escapeRegex };
