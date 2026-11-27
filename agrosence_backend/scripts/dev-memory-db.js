"use strict";
// npm run dev:memory - runs the API against a throwaway in-memory MongoDB. Never reads .env, never touches Atlas.
process.env.AGRO_SKIP_DOTENV = "1";
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-memory-secret-not-for-production-use-0123456789";
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || "8";
process.env.PORT = process.env.PORT || "5000";
// no external services in this mode unless the caller exports their own variables
delete process.env.MONGO_URI;

const { MongoMemoryServer } = require("mongodb-memory-server");

(async () => {
  const mongod = await MongoMemoryServer.create({ instance: { dbName: "agrosence_dev" } });
  const uri = mongod.getUri("agrosence_dev");
  const env = require("../src/config/env");
  const db = require("../src/config/db");
  const { start } = require("../server");
  const { seedSamples } = require("./seed");
  const User = require("../src/models/User");
  const Crop = require("../src/models/Crop");
  const { hashPassword } = require("../src/services/userService");

  await start({ mongoUri: uri, port: env.port, onShutdown: () => mongod.stop() });
  while (!db.isConnected()) await new Promise((r) => setTimeout(r, 100));
  await Promise.all([User.init(), Crop.init()]);

  const mk = async (name, mobile, email, password, role, state = "Gujarat") =>
    User.create({ name, mobile, email, password: await hashPassword(password), state, address: `${name}, ${state}`, language: "English", role });
  await mk("Demo Admin", "9000000001", "admin@agrosence.local", "Admin@12345", "admin");
  await mk("Demo Moderator", "9000000002", "moderator@agrosence.local", "Mod@12345", "moderator");
  const farmer = await mk("Demo Farmer", "9000000003", "farmer@agrosence.local", "Farmer@123", "user");
  await mk("Demo Buyer", "9000000004", "buyer@agrosence.local", "Buyer@1234", "user", "Maharashtra");
  const counts = await seedSamples();
  const ph = (t) => `https://placehold.co/600x400/fff8e1/ef6c00?text=${encodeURIComponent(t)}`;
  await Crop.insertMany(
    [
      ["Wheat", "Grains", 28, "kg", 500, "Yes"],
      ["Tomato", "Vegetables", 22, "kg", 120, "No"],
      ["Basmati Rice", "Grains", 85, "kg", 300, "Yes"],
      ["Mango (Kesar)", "Fruits", 120, "kg", 80, "Yes"],
    ].map(([n, cat, price, unit, qty, org]) => ({
      cropName: n,
      cropDescription: `Fresh ${n} straight from the farm.`,
      cropCategory: cat,
      cropSellingPrice: price,
      cropUnit: unit,
      cropQuantity: qty,
      grownOrganically: org,
      cropImages: [ph(n)],
      userId: farmer._id,
      state: farmer.state,
    }))
  );

  console.log("\n=== AgroSence DEV (in-memory DB, data is lost on exit) ===");
  console.log(`API: http://localhost:${env.port}/api   health: http://localhost:${env.port}/api/health`);
  console.log("Seeded:", counts);
  console.log("Logins (identifier = email or mobile):");
  console.log("  admin      admin@agrosence.local      Admin@12345   (admin panel)");
  console.log("  moderator  moderator@agrosence.local  Mod@12345");
  console.log("  farmer     farmer@agrosence.local     Farmer@123    (owns 4 sample crops)");
  console.log("  buyer      buyer@agrosence.local      Buyer@1234");
  console.log("OTP emails are printed to this console. Cloudinary/Gemini/Plant.id respond 503 unless you export their keys.\n");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
