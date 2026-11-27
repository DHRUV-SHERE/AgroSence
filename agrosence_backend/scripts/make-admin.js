"use strict";
// Usage: npm run make-admin -- someone@example.com
// Promotes an EXISTING account to admin (the only supported way; startup never promotes existing users).
const env = require("../src/config/env");
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function main() {
  const email = String(process.argv[2] || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exit(1);
  }
  if (!env.mongoUri) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  const res = await User.updateOne({ email }, { $set: { role: "admin", active: true } });
  console.log(res.matchedCount ? `${email} is now an admin.` : `No account found for ${email}.`);
  await mongoose.disconnect();
  process.exit(res.matchedCount ? 0 : 1);
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
