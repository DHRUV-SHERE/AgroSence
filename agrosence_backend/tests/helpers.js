"use strict";
// Test environment: in-memory MongoDB only (never Atlas), no .env, no external services.
process.env.NODE_ENV = "test";
process.env.AGRO_SKIP_DOTENV = "1";
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123456";
process.env.BCRYPT_ROUNDS = "4";
process.env.MAX_LOGIN_ATTEMPTS = "5";
for (const k of ["MONGO_URI", "SMTP_USER", "SMTP_PASS", "RESEND_API_KEY", "GEMINI_API_KEY", "PLANT_ID_API_KEY", "CLOUDINARY_URL", "CLOUDINARY_CLOUD_NAME"]) delete process.env[k];

const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;
let app;

async function setup() {
  mongod = await MongoMemoryServer.create();
  const db = require("../src/config/db");
  await db.connectOnce(mongod.getUri("agro_test"));
  await mongoose.connection.syncIndexes?.().catch(() => {});
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  app = require("../src/app").createApp();
  // stub image storage so no Cloudinary call is ever made
  const storage = require("../src/services/storage");
  storage.uploadImages = async (files) => files.map((f, i) => `https://img.test/${Date.now()}-${i}.jpg`);
  return app;
}

async function teardown() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

let counter = 0;
function userBody(over = {}) {
  counter += 1;
  return {
    name: `Test User ${counter}`,
    mobile: String(9100000000 + counter),
    email: `user${counter}@test.dev`,
    password: "Passw0rd1",
    confirmPassword: "Passw0rd1",
    state: "Gujarat",
    address: "Some village",
    language: "English",
    ...over,
  };
}

async function signup(over = {}) {
  const body = userBody(over);
  const res = await request(app).post("/api/auth/signup").send(body);
  if (res.status !== 201) throw new Error(`signup failed ${res.status} ${JSON.stringify(res.body)}`);
  return { body, user: res.body.data.user, access: res.body.data.accessToken, refresh: res.body.data.refreshToken };
}

/** Creates a user then promotes directly in the DB (the only way to get the first admin). */
async function signupWithRole(role) {
  const u = await signup();
  await mongoose.model("Agro_user").updateOne({ _id: u.user.id }, { $set: { role } });
  return u;
}

const auth = (t) => ({ Authorization: `Bearer ${t}` });

/** Creates a crop through the API (multipart, fake png bytes). */
async function createCrop(token, over = {}) {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
  const f = { cropName: "Wheat", cropDescription: "Good wheat", cropCategory: "Grains", cropSellingPrice: "25", cropUnit: "kg", cropQuantity: "100", grownOrganically: "true", ...over };
  let r = request(app).post("/api/crops").set(auth(token));
  for (const [k, v] of Object.entries(f)) r = r.field(k, v);
  return r.attach("cropImages", png, { filename: "a.png", contentType: "image/png" });
}

module.exports = { setup, teardown, request: () => request(app), signup, signupWithRole, auth, createCrop, userBody, mongoose };
