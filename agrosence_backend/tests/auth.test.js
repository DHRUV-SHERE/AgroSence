"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const h = require("./helpers");

before(() => h.setup());
after(() => h.teardown());

test("health does a DB roundtrip and upserts a single heartbeat doc", async () => {
  const r1 = await h.request().get("/api/health").expect(200);
  assert.equal(r1.body.status, "ok");
  assert.equal(r1.body.db, "connected");
  assert.equal(r1.body.data.status, "ok");
  await h.request().get("/api/health").expect(200);
  const hb = h.mongoose.connection.collection("heartbeats");
  let docs = await hb.find({}).toArray();
  assert.equal(docs.length, 1);
  assert.equal(docs[0].pings, 1); // second call within 4 minutes: DB is read but not written
  assert.ok(docs[0].lastPing instanceof Date);
  await hb.updateOne({ key: "main" }, { $set: { lastPing: new Date(Date.now() - 5 * 60 * 1000) } });
  await h.request().get("/api/health").expect(200); // cron-like call after >4 min writes again
  docs = await hb.find({}).toArray();
  assert.equal(docs.length, 1);
  assert.equal(docs[0].pings, 2);
});

test("root route and unknown route use the envelope", async () => {
  const r = await h.request().get("/").expect(200);
  assert.equal(r.body.success, true);
  const n = await h.request().get("/api/nope").expect(404);
  assert.equal(n.body.success, false);
});

test("signup returns user + tokens, never the password, role is always user", async () => {
  const body = h.userBody({ role: "admin" });
  const r = await h.request().post("/api/auth/signup").send(body).expect(201);
  const { user, accessToken, refreshToken } = r.body.data;
  assert.equal(user.role, "user");
  assert.ok(user.id && user.userId);
  assert.equal(user.password, undefined);
  assert.equal(user._id, undefined);
  assert.ok(accessToken && refreshToken);
  const me = await h.request().get("/api/auth/me").set(h.auth(accessToken)).expect(200);
  assert.equal(me.body.data.email, body.email);
});

test("signup validation errors and duplicates", async () => {
  const bad = await h.request().post("/api/auth/signup").send(h.userBody({ password: "short", confirmPassword: "short", mobile: "123" })).expect(400);
  assert.equal(bad.body.success, false);
  assert.ok(bad.body.errors.some((e) => e.field === "mobile"));
  assert.ok(bad.body.errors.some((e) => e.field === "password"));
  const mismatch = await h.request().post("/api/auth/signup").send(h.userBody({ confirmPassword: "Different1" })).expect(400);
  assert.ok(mismatch.body.errors.some((e) => e.field === "confirmPassword"));
  const u = await h.signup();
  const dup = await h.request().post("/api/auth/signup").send(h.userBody({ email: u.body.email })).expect(409);
  assert.equal(dup.body.success, false);
});

test("NoSQL injection in login identifier/password is rejected", async () => {
  await h.request().post("/api/auth/login").send({ identifier: { $gt: "" }, password: { $gt: "" } }).expect(400);
});

test("login by email and by mobile; wrong password is 401", async () => {
  const u = await h.signup();
  const a = await h.request().post("/api/auth/login").send({ identifier: u.body.email, password: u.body.password }).expect(200);
  assert.ok(a.body.data.accessToken);
  await h.request().post("/api/auth/login").send({ identifier: u.body.mobile, password: u.body.password }).expect(200);
  await h.request().post("/api/auth/login").send({ identifier: u.body.email, password: "Wrong1234" }).expect(401);
  await h.request().post("/api/auth/login").send({ identifier: "ghost@test.dev", password: "Wrong1234" }).expect(401);
});

test("account locks after 5 failed attempts, even for the right password", async () => {
  const u = await h.signup();
  for (let i = 0; i < 4; i++) await h.request().post("/api/auth/login").send({ identifier: u.body.email, password: "Bad12345" }).expect(401);
  await h.request().post("/api/auth/login").send({ identifier: u.body.email, password: "Bad12345" }).expect(429);
  const locked = await h.request().post("/api/auth/login").send({ identifier: u.body.email, password: u.body.password }).expect(429);
  assert.match(locked.body.message, /locked/i);
});

test("refresh rotates tokens; old refresh token is rejected; logout revokes", async () => {
  const u = await h.signup();
  const r1 = await h.request().post("/api/auth/refresh").send({ refreshToken: u.refresh }).expect(200);
  assert.ok(r1.body.data.accessToken);
  assert.notEqual(r1.body.data.refreshToken, u.refresh);
  await h.request().post("/api/auth/refresh").send({ refreshToken: u.refresh }).expect(401); // reuse
  const stored = await h.mongoose.connection.collection("refreshtokens").findOne({});
  assert.ok(stored.tokenHash && stored.tokenHash !== u.refresh); // hashed at rest
  await h.request().post("/api/auth/logout").set(h.auth(r1.body.data.accessToken)).send({ refreshToken: r1.body.data.refreshToken }).expect(200);
  await h.request().post("/api/auth/refresh").send({ refreshToken: r1.body.data.refreshToken }).expect(401);
});

test("protected routes need a valid token", async () => {
  await h.request().get("/api/auth/me").expect(401);
  await h.request().get("/api/auth/me").set(h.auth("garbage")).expect(401);
  await h.request().get("/api/crops").expect(401);
});

test("PUT /me whitelists fields: role/password cannot be changed", async () => {
  const u = await h.signup();
  const r = await h.request().put("/api/auth/me").set(h.auth(u.access)).send({ name: "New Name", role: "admin", password: "Hacked123", active: false }).expect(200);
  assert.equal(r.body.data.name, "New Name");
  assert.equal(r.body.data.role, "user");
  await h.request().post("/api/auth/login").send({ identifier: u.body.email, password: u.body.password }).expect(200);
});

test("change password requires the current password", async () => {
  const u = await h.signup();
  await h.request().put("/api/auth/me/password").set(h.auth(u.access)).send({ currentPassword: "nope12345", newPassword: "NewPass123" }).expect(400);
  await h.request().put("/api/auth/me/password").set(h.auth(u.access)).send({ currentPassword: u.body.password, newPassword: "NewPass123" }).expect(200);
  await h.request().post("/api/auth/login").send({ identifier: u.body.email, password: "NewPass123" }).expect(200);
});

test("OTP flow: generic response, hashed storage, attempts limit, success resets password", async () => {
  const u = await h.signup();
  const mail = require("../src/services/mailService");
  const sent = [];
  const orig = mail.sendOtpEmail;
  mail.sendOtpEmail = async (email, code) => sent.push({ email, code });
    const unknown = await h.request().post("/api/auth/send-otp").send({ email: "nobody@test.dev" }).expect(200);
  const known = await h.request().post("/api/auth/send-otp").send({ email: u.body.email }).expect(200);
  assert.equal(unknown.body.data.message, known.body.data.message); // no enumeration
  assert.equal(sent.length, 1);
  const rec = await h.mongoose.connection.collection("otps").findOne({ email: u.body.email });
  assert.ok(rec.codeHash && !rec.codeHash.includes(sent[0].code));
  const idx = await h.mongoose.connection.collection("otps").indexes();
  assert.ok(idx.some((i) => i.expireAfterSeconds === 0)); // TTL index

  const wrong = sent[0].code === "000000" ? "111111" : "000000";
  for (let i = 0; i < 5; i++) await h.request().post("/api/auth/reset-password").send({ email: u.body.email, otp: wrong, newPassword: "Another123" }).expect(400);
  // attempts exhausted: even the right code is refused
  await h.request().post("/api/auth/reset-password").send({ email: u.body.email, otp: sent[0].code, newPassword: "Another123" }).expect(400);

  // fresh OTP (bypass the 60s cooldown by aging the record)
  await h.mongoose.connection.collection("otps").updateOne({ email: u.body.email }, { $set: { createdAt: new Date(Date.now() - 120000) } });
  await h.request().post("/api/auth/send-otp").send({ email: u.body.email }).expect(200);
  assert.equal(sent.length, 2);
  await h.request().post("/api/auth/reset-password").send({ email: u.body.email, otp: sent[1].code, newPassword: "Another123" }).expect(200);
  await h.request().post("/api/auth/login").send({ identifier: u.body.email, password: "Another123" }).expect(200);
  await h.request().post("/api/auth/reset-password").send({ email: u.body.email, otp: sent[1].code, newPassword: "Third12345" }).expect(400); // single use
  mail.sendOtpEmail = orig;
});

test("contact form saves even when email is not configured; validation enforced", async () => {
  await h.request().post("/api/contact").send({ name: "A", email: "bad", message: "hi" }).expect(400);
  const r = await h.request().post("/api/contact").send({ name: "Asha", email: "asha@test.dev", message: "Hello team" }).expect(201);
  assert.equal(r.body.success, true);
  assert.equal(await h.mongoose.model("ContactForm").countDocuments(), 1);
});

test("public content: schemes/resources/faq are cacheable and paginated", async () => {
  const r = await h.request().get("/api/schemes").expect(200);
  assert.ok(Array.isArray(r.body.data));
  assert.ok(r.body.meta.total >= 0);
  assert.match(r.headers["cache-control"], /max-age/);
  await h.request().get("/api/resources").expect(200);
  const f = await h.request().get("/api/agriculture/faq?q=weather").expect(200);
  assert.ok(f.body.data.answer);
});

test("chatbot / crop-detect degrade gracefully when keys are missing", async () => {
  const u = await h.signup();
  const bot = await h.request().post("/api/chatbot").send({ message: "best fertilizer for wheat crops?" }).expect(503);
  assert.equal(bot.body.success, false);
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
  await h.request().post("/api/crop-detect").set(h.auth(u.access)).attach("image", png, { filename: "x.png", contentType: "image/png" }).expect(503);
  await h.request().post("/api/chatbot").send({}).expect(400);
});

test("bootstrap admin is idempotent and seed only fills empty collections", async () => {
  const { ensureAdmin } = require("../src/services/userService");
  const cfg = { email: "Boss@Test.dev", password: "Adm1nPassw0rd", name: "Boss", mobile: "9000000099" };
  assert.equal(await ensureAdmin({}), null); // no env -> nothing
  const a = await ensureAdmin(cfg);
  assert.equal(a.role, "admin");
  assert.equal(await ensureAdmin(cfg), null); // an admin exists now
  assert.equal(await h.mongoose.model("Agro_user").countDocuments({ role: "admin" }), 1);
  await h.request().post("/api/auth/login").send({ identifier: "boss@test.dev", password: cfg.password }).expect(200);

  const { seedSamples } = require("../scripts/seed");
  const first = await seedSamples();
  assert.ok(first.schemes > 0 && first.resources > 0);
  assert.deepEqual(await seedSamples(), { schemes: 0, resources: 0 });
});
