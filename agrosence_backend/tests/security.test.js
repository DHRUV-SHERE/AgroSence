"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const h = require("./helpers");

before(() => h.setup());
after(() => h.teardown());

const Users = () => h.mongoose.model("Agro_user");
const login = (identifier, password, ip) => {
  const r = h.request().post("/api/auth/login");
  if (ip) r.set("X-Forwarded-For", ip);
  return r.send({ identifier, password });
};
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);

// ---------------- M1 login lockout ----------------
test("M1: 15 parallel wrong logins are all counted atomically", async () => {
  const u = await h.signup();
  const rs = await Promise.all(Array.from({ length: 15 }, () => login(u.body.email, "Wrong1234", "9.9.9.9")));
  assert.ok(rs.every((r) => r.status === 401 || r.status === 429));
  const docs = await h.mongoose.connection.collection("loginattempts").find({ _id: new RegExp(u.user.id) }).toArray();
  const ipDoc = docs.find((d) => d._id.startsWith("ip:"));
  const acctDoc = docs.find((d) => d._id.startsWith("acct:"));
  assert.equal(ipDoc.count, 15);
  assert.equal(acctDoc.count, 15);
  assert.ok(ipDoc.lockUntil > new Date());
});

test("M1: lock is per (account, ip): attacker IP is locked, owner on another IP still logs in", async () => {
  const u = await h.signup();
  for (let i = 0; i < 5; i++) await login(u.body.email, "Bad12345", "6.6.6.6");
  const locked = await login(u.body.email, u.body.password, "6.6.6.6").expect(429);
  assert.match(locked.body.message, /locked/i);
  assert.doesNotMatch(locked.body.message, /minute/i); // generic: no countdown
  await login(u.body.email, u.body.password, "7.7.7.7").expect(200);
});

test("M1: per-account threshold across many IPs triggers a short cooldown that expires", async () => {
  const u = await h.signup();
  for (let i = 0; i < 20; i++) await login(u.body.email, "Bad12345", `10.0.0.${i + 1}`); // 1 failure per IP: no IP lock
  await login(u.body.email, u.body.password, "10.1.1.1").expect(429);
  await h.mongoose.connection.collection("loginattempts").updateOne({ _id: `acct:${u.user.id}` }, { $set: { lockUntil: new Date(Date.now() - 1000) } });
  await login(u.body.email, u.body.password, "10.1.1.1").expect(200);
});

test("M1: successful login clears the counters", async () => {
  const u = await h.signup();
  for (let i = 0; i < 3; i++) await login(u.body.email, "Bad12345", "5.5.5.5");
  await login(u.body.email, u.body.password, "5.5.5.5").expect(200);
  assert.equal(await h.mongoose.connection.collection("loginattempts").countDocuments({ _id: new RegExp(u.user.id) }), 0);
});

// ---------------- M2 PUT /me ----------------
test("M2: email/mobile change needs currentPassword; other fields do not; other sessions revoked on email change", async () => {
  const u = await h.signup();
  const other = await h.request().post("/api/auth/login").send({ identifier: u.body.email, password: u.body.password }).expect(200);
  const put = (body) => h.request().put("/api/auth/me").set(h.auth(u.access)).send(body);

  await put({ name: "New Name" }).expect(200);
  await put({ email: "evil@test.dev" }).expect(400); // missing currentPassword
  const bad = await put({ email: "evil@test.dev", currentPassword: "Wrong1234" }).expect(400);
  assert.match(bad.body.message, /incorrect/i);
  await put({ mobile: "9999900001" }).expect(400);
  assert.equal((await Users().findById(u.user.id).lean()).email, u.body.email);
  await put({ email: u.body.email }).expect(200); // unchanged value needs no password

  const okRes = await put({ email: "new-" + u.body.email, currentPassword: u.body.password, refreshToken: u.refresh }).expect(200);
  assert.equal(okRes.body.data.email, "new-" + u.body.email);
  await h.request().post("/api/auth/refresh").send({ refreshToken: other.body.data.refreshToken }).expect(401); // other session revoked
  await h.request().post("/api/auth/refresh").send({ refreshToken: u.refresh }).expect(200); // caller's stays valid
  const m = await put({ mobile: "9999900002", currentPassword: u.body.password }).expect(200);
  assert.equal(m.body.data.mobile, "9999900002");
  assert.equal(m.body.data.accessToken, undefined); // mobile change does not touch sessions
});

test("M2: email change without refreshToken returns fresh tokens", async () => {
  const u = await h.signup();
  const r = await h.request().put("/api/auth/me").set(h.auth(u.access)).send({ email: "fresh-" + u.body.email, currentPassword: u.body.password }).expect(200);
  assert.ok(r.body.data.accessToken && r.body.data.refreshToken);
  await h.request().post("/api/auth/refresh").send({ refreshToken: u.refresh }).expect(401);
  await h.request().post("/api/auth/refresh").send({ refreshToken: r.body.data.refreshToken }).expect(200);
});

// ---------------- M3 OTP timing ----------------
test("M3: send-otp does not await the mailer and swallows mail failures (same response on both paths)", async () => {
  const mail = require("../src/services/mailService");
  const orig = mail.sendOtpEmail;
  let called = 0;
  mail.sendOtpEmail = () => {
    called++;
    return new Promise(() => {}); // never resolves
  };
  try {
    const u = await h.signup();
    const t0 = Date.now();
    const known = await h.request().post("/api/auth/send-otp").send({ email: u.body.email }).expect(200);
    assert.ok(Date.now() - t0 < 3000);
    const unknown = await h.request().post("/api/auth/send-otp").send({ email: "nobody-x@test.dev" }).expect(200);
    assert.deepEqual(known.body, unknown.body);
    assert.equal(called, 1);
    mail.sendOtpEmail = () => Promise.reject(new Error("smtp down"));
    await h.mongoose.connection.collection("otps").deleteMany({});
    await h.request().post("/api/auth/send-otp").send({ email: u.body.email }).expect(200);
  } finally {
    mail.sendOtpEmail = orig;
  }
});

// ---------------- M4 headers ----------------
test("M4: backend sends helmet security headers", async () => {
  const r = await h.request().get("/api/health").expect(200);
  assert.ok(r.headers["content-security-policy"]);
  assert.match(r.headers["strict-transport-security"], /max-age=/);
  assert.equal(r.headers["x-content-type-options"], "nosniff");
  assert.equal(r.headers["x-powered-by"], undefined);
  assert.ok(r.headers["referrer-policy"]);
});

// ---------------- M5 sanitize-urls ----------------
test("M5: sanitize-urls dry-runs by default and nulls only non-http(s) links with apply", async () => {
  const { sanitize } = require("../scripts/sanitize-urls");
  const db = h.mongoose.connection.db;
  await db.collection("schemes").insertMany([
    { name: "a", applyLink: "javascript:alert(1)" },
    { name: "b", applyLink: "https://ok.example/x" },
    { name: "c", applyLink: "data:text/html,hi" },
  ]);
  await db.collection("resources").insertOne({ name: "r", link: "  JavaScript:alert(2)" });
  const dry = await sanitize(db, { log: () => {} });
  assert.equal(dry.find((r) => r.collection === "schemes").found, 2);
  assert.equal(await db.collection("schemes").countDocuments({ applyLink: /^javascript/ }), 1); // untouched
  await sanitize(db, { apply: true, log: () => {} });
  const left = await db.collection("schemes").find({}).toArray();
  assert.equal(left.find((s) => s.name === "a").applyLink, null);
  assert.equal(left.find((s) => s.name === "c").applyLink, null);
  assert.equal(left.find((s) => s.name === "b").applyLink, "https://ok.example/x");
  assert.equal((await db.collection("resources").findOne({ name: "r" })).link, null);
});

// ---------------- L1 health ----------------
test("L1: health has a generous per-IP limiter (enforced when rate limits are enabled)", async () => {
  process.env.TEST_RATE_LIMIT = "1";
  try {
    let ok = 0;
    let last;
    for (let i = 0; i < 125; i++) {
      last = (await h.request().get("/api/health").set("X-Forwarded-For", "44.44.44.44")).status;
      if (last === 200) ok++;
    }
    assert.equal(ok, 120);
    assert.equal(last, 429);
    await h.request().get("/api/health").set("X-Forwarded-For", "45.45.45.45").expect(200);
  } finally {
    delete process.env.TEST_RATE_LIMIT;
  }
});

// ---------------- L2 orders ----------------
test("L2: order quantity/price floors, single pending order per buyer+crop (also in parallel)", async () => {
  const seller = await h.signup();
  const buyer = await h.signup();
  const c = (await h.createCrop(seller.access, { cropSellingPrice: "1", cropQuantity: "50" })).body.data;
  const post = (body) => h.request().post("/api/orders").set(h.auth(buyer.access)).send(body);
  await post({ cropId: c.id, quantity: 0.004 }).expect(400);
  await post({ cropId: c.id, quantity: 0.5 }).expect(400); // total Rs 0.50 < Rs 1
  await post({ cropId: c.id, quantity: 0 }).expect(400);
  const results = await Promise.all(Array.from({ length: 10 }, () => post({ cropId: c.id, quantity: 2 })));
  assert.equal(results.filter((r) => r.status === 201).length, 1);
  assert.ok(results.filter((r) => r.status !== 201).every((r) => r.status === 409));
  const id = results.find((r) => r.status === 201).body.data.id;
  await h.request().put(`/api/orders/${id}/status`).set(h.auth(buyer.access)).send({ status: "Cancelled" }).expect(200);
  await post({ cropId: c.id, quantity: 2 }).expect(201); // allowed again once nothing is pending
});

test("L2: order-create rate limiter exists", async () => {
  const seller = await h.signup();
  const buyer = await h.signup();
  const c = (await h.createCrop(seller.access)).body.data;
  process.env.TEST_RATE_LIMIT = "1";
  try {
    let last;
    for (let i = 0; i < 32; i++) {
      last = (await h.request().post("/api/orders").set(h.auth(buyer.access)).set("X-Forwarded-For", "46.46.46.46").send({ cropId: c.id, quantity: 1 })).status;
    }
    assert.equal(last, 429);
  } finally {
    delete process.env.TEST_RATE_LIMIT;
  }
});

// ---------------- L3 crop detect / quotas / chatbot ----------------
test("L3: crop-detect never stores the image and enforces a daily quota of 20 per user", async () => {
  const ai = require("../src/services/aiService");
  const storage = require("../src/services/storage");
  const origAi = ai.identifyCrop;
  const origUp = storage.uploadImages;
  let uploads = 0;
  storage.uploadImages = async () => {
    uploads++;
    return ["x"];
  };
  ai.identifyCrop = async () => ({ scientificName: "Triticum", commonNames: ["Wheat"], description: "d" });
  process.env.TEST_QUOTA = "1";
  try {
    const u = await h.signup();
    const call = (tok) => h.request().post("/api/crop-detect").set(h.auth(tok)).attach("image", PNG, { filename: "a.png", contentType: "image/png" });
    const first = await call(u.access).expect(200);
    assert.equal(first.body.data.image, null);
    assert.equal(first.body.data.scientificName, "Triticum");
    assert.equal(uploads, 0);
    for (let i = 1; i < 20; i++) await call(u.access).expect(200);
    const over = await call(u.access).expect(429);
    assert.match(over.body.message, /daily limit/i);
    const u2 = await h.signup();
    await call(u2.access).expect(200);
  } finally {
    delete process.env.TEST_QUOTA;
    ai.identifyCrop = origAi;
    storage.uploadImages = origUp;
  }
});

test("L3: chatbot allows anonymous callers 10 per window, signed-in users more", async () => {
  const ai = require("../src/services/aiService");
  const origChat = ai.getChatAnswer;
  ai.getChatAnswer = async () => "ok";
  const u = await h.signup();
  process.env.TEST_RATE_LIMIT = "1";
  try {
    const say = (tok, ip) => {
      const r = h.request().post("/api/chatbot").set("X-Forwarded-For", ip);
      if (tok) r.set(h.auth(tok));
      return r.send({ message: "zzz" });
    };
    const anon = [];
    for (let i = 0; i < 11; i++) anon.push((await say(null, "50.50.50.50")).status);
    assert.equal(anon.filter((s) => s === 200).length, 10);
    assert.equal(anon[10], 429);
    for (let i = 0; i < 20; i++) assert.equal((await say(u.access, "50.50.50.50")).status, 200); // same IP, authenticated bucket
  } finally {
    ai.getChatAnswer = origChat;
    delete process.env.TEST_RATE_LIMIT;
  }
});

// ---------------- L4 production defaults / admin bootstrap ----------------
test("L4: RENDER=true counts as production and flips the CORS localhost default", () => {
  const run = (envVars) =>
    JSON.parse(
      spawnSync(process.execPath, ["-e", 'const e=require("./src/config/env");console.log(JSON.stringify({p:e.isProd,l:e.corsAllowLocalhost}))'], {
        cwd: path.join(__dirname, ".."),
        env: { PATH: process.env.PATH, AGRO_SKIP_DOTENV: "1", JWT_SECRET: "x".repeat(40), MONGO_URI: "mongodb://x", ...envVars },
        encoding: "utf8",
      }).stdout
    );
  assert.deepEqual(run({ RENDER: "true" }), { p: true, l: false });
  assert.deepEqual(run({ NODE_ENV: "production" }), { p: true, l: false });
  assert.deepEqual(run({ NODE_ENV: "production", CORS_ALLOW_LOCALHOST: "true" }), { p: true, l: true });
  assert.deepEqual(run({ NODE_ENV: "development" }), { p: false, l: true });
});

test("L4: ensureAdmin creates a fresh admin but never promotes an existing account", async () => {
  const { ensureAdmin } = require("../src/services/userService");
  const victim = await h.signup();
  await Users().updateMany({ role: "admin" }, { $set: { role: "user" } });
  const warn = console.warn;
  const warnings = [];
  console.warn = (m) => warnings.push(m);
  try {
    assert.equal(await ensureAdmin({ email: victim.body.email, password: "Admin12345", name: "A", mobile: "9000000001" }), null);
  } finally {
    console.warn = warn;
  }
  assert.equal((await Users().findById(victim.user.id).lean()).role, "user");
  assert.match(warnings.join(" "), /make-admin/);
  const fresh = await ensureAdmin({ email: "fresh-admin@test.dev", password: "Admin12345", name: "A", mobile: "9000000002" });
  assert.equal(fresh.role, "admin");
});

// ---------------- L6 ----------------
test("L6: support mail failure message is generic", async () => {
  const env = require("../src/config/env");
  env.isProd = true;
  const err = console.error;
  console.error = () => {};
  try {
    const r = await h.request().post("/api/support").send({ name: "Tester", email: "t@test.dev", message: "hello there" }).expect(503);
    assert.doesNotMatch(r.body.message, /MAIL_TO|mailbox|configured/i);
  } finally {
    env.isProd = false;
    console.error = err;
  }
});

test("L6: suspended sellers' crops are hidden from the marketplace and cannot be ordered", async () => {
  const seller = await h.signup();
  const buyer = await h.signup();
  const admin = await h.signupWithRole("admin");
  const c = (await h.createCrop(seller.access, { cropName: "HideMe" })).body.data;
  const list = async () => (await h.request().get("/api/crops?q=HideMe").set(h.auth(buyer.access)).expect(200)).body.data;
  assert.equal((await list()).length, 1);
  await Users().updateOne({ _id: seller.user.id }, { $set: { active: false } });
  assert.equal((await list()).length, 0);
  await h.request().get(`/api/crops/${c.id}`).set(h.auth(buyer.access)).expect(404);
  await h.request().get(`/api/crops/${c.id}`).set(h.auth(admin.access)).expect(200);
  await h.request().post("/api/orders").set(h.auth(buyer.access)).send({ cropId: c.id, quantity: 2 }).expect(409);
  await Users().updateOne({ _id: seller.user.id }, { $set: { active: true } });
  assert.equal((await list()).length, 1);
});

// ---------------- schemes: legacy state formats ----------------
test("schemes: state filter matches legacy slug/title-case values and returns canonical state", async () => {
  const Scheme = require("../src/models/Scheme");
  const base = { description: "d", eligibility: "e", benefits: "b", applyLink: "https://example.gov.in" };
  await Scheme.create([
    { ...base, name: "S1", state: "gujarat" },
    { ...base, name: "S2", state: "andhra-pradesh" },
    { ...base, name: "S3", state: "all-states" },
    { ...base, name: "S4", state: "Bihar" },
  ]);
  const g = await h.request().get("/api/schemes?state=Gujarat").expect(200);
  assert.deepEqual(g.body.data.map((x) => x.name).sort(), ["S1", "S3"]);
  assert.ok(g.body.data.every((x) => ["Gujarat", "All States"].includes(x.state)));
  const a = await h.request().get("/api/schemes?state=Andhra%20Pradesh").expect(200);
  assert.ok(a.body.data.some((x) => x.name === "S2" && x.state === "Andhra Pradesh"));
});
