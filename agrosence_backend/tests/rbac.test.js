"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const h = require("./helpers");

let admin, mod, user, admin2;
before(async () => {
  await h.setup();
  admin = await h.signupWithRole("admin");
  admin2 = await h.signupWithRole("admin");
  mod = await h.signupWithRole("moderator");
  user = await h.signup();
});
after(() => h.teardown());

const scheme = { name: "Test Scheme", description: "d", eligibility: "e", benefits: "b", applyLink: "https://example.gov.in/apply" };

test("anonymous and plain users cannot reach admin routes", async () => {
  await h.request().get("/api/admin/stats").expect(401);
  await h.request().get("/api/admin/users").set(h.auth(user.access)).expect(403);
  await h.request().get("/api/admin/stats").set(h.auth(user.access)).expect(403);
  await h.request().post("/api/admin/schemes").set(h.auth(user.access)).send(scheme).expect(403);
  await h.request().delete("/api/admin/contacts/" + "a".repeat(24)).set(h.auth(user.access)).expect(403);
  await h.request().get("/api/admin/audit-logs").set(h.auth(user.access)).expect(403);
});

test("the old unauthenticated legacy routes are gone", async () => {
  await h.request().get("/api/auth/users").expect(404);
  await h.request().delete("/api/auth/users/" + user.user.id).expect(404);
  await h.request().put("/api/auth/users/" + user.user.id).send({ password: "x" }).expect(404);
  await h.request().get("/api/orders").set(h.auth(user.access)).expect(404);
});

test("moderator: can read users/stats and manage content, cannot change users/roles/audit", async () => {
  const stats = await h.request().get("/api/admin/stats").set(h.auth(mod.access)).expect(200);
  for (const k of ["users", "crops", "orders", "contacts", "schemes", "resources", "ordersByStatus", "signupsByDay", "revenue"]) assert.ok(k in stats.body.data, k);
  assert.ok(stats.body.data.users >= 4);
  const list = await h.request().get("/api/admin/users?limit=2").set(h.auth(mod.access)).expect(200);
  assert.equal(list.body.data.length, 2);
  assert.equal(list.body.meta.limit, 2);
  assert.equal(list.body.data[0].password, undefined);
  await h.request().get("/api/admin/users/" + user.user.id).set(h.auth(mod.access)).expect(200);

  await h.request().put("/api/admin/users/" + user.user.id).set(h.auth(mod.access)).send({ name: "x" }).expect(403);
  await h.request().patch(`/api/admin/users/${user.user.id}/role`).set(h.auth(mod.access)).send({ role: "admin" }).expect(403);
  await h.request().patch(`/api/admin/users/${user.user.id}/status`).set(h.auth(mod.access)).send({ active: false }).expect(403);
  await h.request().delete("/api/admin/users/" + user.user.id).set(h.auth(mod.access)).expect(403);
  await h.request().get("/api/admin/audit-logs").set(h.auth(mod.access)).expect(403);

  const created = await h.request().post("/api/admin/schemes").set(h.auth(mod.access)).send(scheme).expect(201);
  const id = created.body.data.id;
  await h.request().put("/api/admin/schemes/" + id).set(h.auth(mod.access)).send({ name: "Renamed" }).expect(200);
  const pub = await h.request().get("/api/schemes/" + id).expect(200);
  assert.equal(pub.body.data.name, "Renamed");
  await h.request().delete("/api/admin/schemes/" + id).set(h.auth(mod.access)).expect(200);
  await h.request().get("/api/schemes/" + id).expect(404);
});

test("scheme validation (bad url) and resource create needs an image", async () => {
  const bad = await h.request().post("/api/admin/schemes").set(h.auth(admin.access)).send({ ...scheme, applyLink: "javascript:alert(1)" }).expect(400);
  assert.ok(bad.body.errors.some((e) => e.field === "applyLink"));
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
  const fields = { name: "Urea", description: "d", purpose: "p", advantages: "a", popularbrand: "b", howtouse: "u", link: "https://example.com" };
  let r = h.request().post("/api/admin/resources").set(h.auth(admin.access));
  for (const [k, v] of Object.entries(fields)) r = r.field(k, v);
  await r.expect(400); // no image
  r = h.request().post("/api/admin/resources").set(h.auth(admin.access));
  for (const [k, v] of Object.entries(fields)) r = r.field(k, v);
  const ok = await r.attach("image", png, { filename: "u.png", contentType: "image/png" }).expect(201);
  assert.match(ok.body.data.image, /^https:\/\//);
  // non-image content is rejected
  r = h.request().post("/api/admin/resources").set(h.auth(admin.access));
  for (const [k, v] of Object.entries(fields)) r = r.field(k, v);
  await r.attach("image", Buffer.from("<html>not an image</html>"), { filename: "u.png", contentType: "image/png" }).expect(400);
});

test("admin: role change works, is audited, cannot demote self; cannot demote last admin", async () => {
  const r = await h.request().patch(`/api/admin/users/${user.user.id}/role`).set(h.auth(admin.access)).send({ role: "moderator" }).expect(200);
  assert.equal(r.body.data.role, "moderator");
  await h.request().patch(`/api/admin/users/${user.user.id}/role`).set(h.auth(admin.access)).send({ role: "superuser" }).expect(400);
  await h.request().patch(`/api/admin/users/${admin.user.id}/role`).set(h.auth(admin.access)).send({ role: "user" }).expect(400); // self

  // the role change is effective immediately for that user's existing token
  await h.request().get("/api/admin/stats").set(h.auth(user.access)).expect(200);
  await h.request().patch(`/api/admin/users/${user.user.id}/role`).set(h.auth(admin.access)).send({ role: "user" }).expect(200);
  await h.request().get("/api/admin/stats").set(h.auth(user.access)).expect(403);

  const logs = await h.request().get("/api/admin/audit-logs?action=user.role_change").set(h.auth(admin.access)).expect(200);
  assert.ok(logs.body.data.length >= 2);
  assert.equal(logs.body.data[0].action, "user.role_change");

  // demote admin2 (admin stays) OK; now `admin` is the last admin -> admin2 (now user) can't, and demoting last is blocked
  await h.request().patch(`/api/admin/users/${admin2.user.id}/role`).set(h.auth(admin.access)).send({ role: "user" }).expect(200);
  const User = h.mongoose.model("Agro_user");
  await User.updateOne({ _id: mod.user.id }, { $set: { role: "admin" } });
  // two admins again (admin, mod). mod demotes admin -> allowed since mod stays admin
  await h.request().patch(`/api/admin/users/${admin.user.id}/role`).set(h.auth(mod.access)).send({ role: "user" }).expect(200);
  // now mod is the last admin; admin (now user) obviously can't, and mod cannot demote self
  await h.request().patch(`/api/admin/users/${mod.user.id}/role`).set(h.auth(admin.access)).send({ role: "user" }).expect(403);
  await h.request().patch(`/api/admin/users/${mod.user.id}/role`).set(h.auth(mod.access)).send({ role: "user" }).expect(400);
  await User.updateOne({ _id: admin.user.id }, { $set: { role: "admin" } }); // restore for later tests
});

test("admin suspend blocks login + existing token; restore works; delete cannot target self", async () => {
  const victim = await h.signup();
  await h.request().patch(`/api/admin/users/${victim.user.id}/status`).set(h.auth(admin.access)).send({ active: false }).expect(200);
  await h.request().get("/api/auth/me").set(h.auth(victim.access)).expect(403);
  await h.request().post("/api/auth/login").send({ identifier: victim.body.email, password: victim.body.password }).expect(403);
  await h.request().post("/api/auth/refresh").send({ refreshToken: victim.refresh }).expect(401);
  await h.request().patch(`/api/admin/users/${victim.user.id}/status`).set(h.auth(admin.access)).send({ active: true }).expect(200);
  await h.request().post("/api/auth/login").send({ identifier: victim.body.email, password: victim.body.password }).expect(200);

  await h.request().delete(`/api/admin/users/${admin.user.id}`).set(h.auth(admin.access)).expect(400);
  await h.request().delete(`/api/admin/users/${victim.user.id}`).set(h.auth(admin.access)).expect(200);
  await h.request().get(`/api/admin/users/${victim.user.id}`).set(h.auth(admin.access)).expect(404);
});

test("admin user update is whitelisted and conflicts are 409", async () => {
  const a = await h.signup();
  const b = await h.signup();
  const r = await h.request().put(`/api/admin/users/${a.user.id}`).set(h.auth(admin.access)).send({ name: "Renamed", role: "admin", password: "x" }).expect(200);
  assert.equal(r.body.data.name, "Renamed");
  assert.equal(r.body.data.role, "user");
  await h.request().put(`/api/admin/users/${a.user.id}`).set(h.auth(admin.access)).send({ email: b.body.email }).expect(409);
  await h.request().get("/api/admin/users/not-an-id").set(h.auth(admin.access)).expect(400);
});

test("moderator can read/delete contacts; admin lists orders and crops", async () => {
  await h.request().post("/api/contact").send({ name: "Asha", email: "a@test.dev", message: "hello there" }).expect(201);
  const list = await h.request().get("/api/admin/contacts").set(h.auth(mod.access)).expect(200);
  assert.ok(list.body.data.length >= 1);
  await h.request().delete("/api/admin/contacts/" + list.body.data[0].id).set(h.auth(mod.access)).expect(200);
  await h.request().get("/api/admin/orders").set(h.auth(admin.access)).expect(200);
  await h.request().get("/api/admin/crops").set(h.auth(admin.access)).expect(200);
});
