"use strict";
// One-off clean-up: nulls link fields that are not http(s) URLs (e.g. javascript:, data:) in existing documents.
// Dry run by default; pass --apply to write.   npm run sanitize-urls            (report)
//                                              npm run sanitize-urls -- --apply
const env = require("../src/config/env");
const mongoose = require("mongoose");

const SAFE = /^https?:\/\//i;
const TARGETS = [
  { collection: "schemes", field: "applyLink" },
  { collection: "resources", field: "link" },
  { collection: "agro_users", field: "avatar" },
];

async function sanitize(db, { apply = false, log = console.log } = {}) {
  const report = [];
  for (const { collection, field } of TARGETS) {
    const col = db.collection(collection);
    const bad = await col.find({ [field]: { $type: "string" } }).project({ [field]: 1 }).toArray();
    const unsafe = bad.filter((d) => !SAFE.test(String(d[field]).trim()));
    for (const d of unsafe) log(`${apply ? "nulling" : "would null"} ${collection}.${field} (${d._id}): ${String(d[field]).slice(0, 60)}`);
    if (apply && unsafe.length) await col.updateMany({ _id: { $in: unsafe.map((d) => d._id) } }, { $set: { [field]: null } });
    report.push({ collection, field, found: unsafe.length });
  }
  return report;
}

module.exports = { sanitize };

if (require.main === module) {
  (async () => {
    const apply = process.argv.includes("--apply");
    if (!env.mongoUri) {
      console.error("MONGO_URI is not set.");
      process.exit(1);
    }
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
    const report = await sanitize(mongoose.connection.db, { apply });
    console.log(report);
    console.log(apply ? "Done (changes written)." : "Dry run only. Re-run with --apply to write changes.");
    await mongoose.disconnect();
  })().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
