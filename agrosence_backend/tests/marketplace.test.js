"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const h = require("./helpers");

let seller, buyer, other, mod;
before(async () => {
  await h.setup();
  seller = await h.signup({ state: "Punjab" });
  buyer = await h.signup();
  other = await h.signup();
  mod = await h.signupWithRole("moderator");
});
after(() => h.teardown());

test("create crop: seller comes from the token, images uploaded, validation enforced", async () => {
  const res = await h.createCrop(seller.access, { userId: other.user.id });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  const c = res.body.data;
  assert.equal(c.userId, seller.user.id); // body userId ignored
  assert.equal(c.organic, true);
  assert.equal(c.state, "Punjab");
  assert.equal(c.cropImages.length, 1);
  assert.equal(c._id, undefined);

  const bad = await h.createCrop(seller.access, { cropSellingPrice: "-5", cropQuantity: "abc" });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.errors.length >= 2);

  await h.request().post("/api/crops").set(h.auth(seller.access)).field("cropName", "x").expect(400);
  await h.request().post("/api/crops").send({}).expect(401);
});

test("listing: filters, pagination meta, mine; sold crops hidden from marketplace", async () => {
  await h.createCrop(seller.access, { cropName: "Tomato", cropCategory: "Vegetables", cropSellingPrice: "10", grownOrganically: "false" });
  const all = await h.request().get("/api/crops?limit=1").set(h.auth(buyer.access)).expect(200);
  assert.equal(all.body.data.length, 1);
  assert.ok(all.body.meta.total >= 2 && all.body.meta.pages >= 2);
  assert.equal(all.body.data[0].seller.name, seller.user.name);
  const veg = await h.request().get("/api/crops?category=vegetables&organic=false&maxPrice=20&q=tom").set(h.auth(buyer.access)).expect(200);
  assert.equal(veg.body.data.length, 1);
  assert.equal(veg.body.data[0].cropName, "Tomato");
  const st = await h.request().get("/api/crops?state=punjab").set(h.auth(buyer.access)).expect(200);
  assert.ok(st.body.data.length >= 2);
  const mine = await h.request().get("/api/crops/mine").set(h.auth(seller.access)).expect(200);
  assert.ok(mine.body.meta.total >= 2);
  const none = await h.request().get("/api/crops/mine").set(h.auth(buyer.access)).expect(200);
  assert.equal(none.body.data.length, 0);
  await h.request().get("/api/crops?minPrice[$gt]=0&q[$ne]=1").set(h.auth(buyer.access)).expect(400);
});

test("crop ownership: only owner or admin/moderator can edit/delete", async () => {
  const crop = (await h.createCrop(seller.access)).body.data;
  await h.request().put("/api/crops/" + crop.id).set(h.auth(buyer.access)).send({ cropSellingPrice: 1 }).expect(403);
  await h.request().delete("/api/crops/" + crop.id).set(h.auth(buyer.access)).expect(403);
  const upd = await h.request().put("/api/crops/" + crop.id).set(h.auth(seller.access)).send({ cropSellingPrice: 30, userId: buyer.user.id, cropStatus: "Sold" }).expect(200);
  assert.equal(upd.body.data.cropSellingPrice, 30);
  assert.equal(upd.body.data.userId, seller.user.id);
  assert.equal(upd.body.data.cropStatus, "Sold");
  await h.request().delete("/api/crops/" + crop.id).set(h.auth(mod.access)).expect(200); // moderation
  await h.request().get("/api/crops/" + crop.id).set(h.auth(buyer.access)).expect(404);
  await h.request().get("/api/crops/xyz").set(h.auth(buyer.access)).expect(400);
  // old unauthenticated "mark sold" route no longer exists
  await h.request().put("/api/crops/sell/" + crop.id).set(h.auth(seller.access)).expect(404);
});

test("order flow: validation, own-crop block, stock, accept/reject/cancel permissions", async () => {
  const crop = (await h.createCrop(seller.access, { cropQuantity: "10", cropSellingPrice: "20" })).body.data;
  const post = (token, body) => h.request().post("/api/orders").set(h.auth(token)).send(body);

  await h.request().post("/api/orders").send({ cropId: crop.id, quantity: 1 }).expect(401);
  const own = await post(seller.access, { cropId: crop.id, quantity: 1 }).expect(400);
  assert.match(own.body.message, /own crop/i);
  await post(buyer.access, { cropId: crop.id, quantity: 11 }).expect(400); // over stock
  await post(buyer.access, { cropId: crop.id, quantity: 0 }).expect(400);
  await post(buyer.access, { cropId: crop.id }).expect(400);
  await post(buyer.access, { cropId: "b".repeat(24), quantity: 1 }).expect(404);

  // client-supplied seller/price is ignored
  const o1 = (await post(buyer.access, { cropId: crop.id, quantity: 4, sellerId: other.user.id, totalPrice: 1, buyerId: other.user.id }).expect(201)).body.data;
  assert.equal(o1.totalPrice, 80);
  assert.equal(o1.sellerId, seller.user.id);
  assert.equal(o1.buyerId, buyer.user.id);
  assert.equal(o1.status, "Pending");

  // seller got a notification; buyer did not
  const ns = await h.request().get("/api/notifications").set(h.auth(seller.access)).expect(200);
  assert.ok(ns.body.data.some((n) => n.orderId === o1.id && n.status === "unread"));
  assert.ok(ns.body.meta.unread >= 1);
  const nb = await h.request().get("/api/notifications").set(h.auth(buyer.access)).expect(200);
  assert.equal(nb.body.data.length, 0);

  // visibility: only parties see the order
  const mineSeller = await h.request().get("/api/orders/mine").set(h.auth(seller.access)).expect(200);
  assert.ok(mineSeller.body.data.some((o) => o.id === o1.id && o.role === "seller" && o.crop.cropName));
  const mineOther = await h.request().get("/api/orders/mine").set(h.auth(other.access)).expect(200);
  assert.equal(mineOther.body.data.length, 0);

  const status = (token, id, s) => h.request().put(`/api/orders/${id}/status`).set(h.auth(token)).send({ status: s });
  await status(buyer.access, o1.id, "Accepted").expect(403); // buyer cannot accept
  await status(other.access, o1.id, "Accepted").expect(403); // stranger cannot
  await status(seller.access, o1.id, "Cancelled").expect(403); // seller cannot cancel
  await status(seller.access, o1.id, "Bogus").expect(400);
  const acc = await status(seller.access, o1.id, "Accepted").expect(200);
  assert.equal(acc.body.data.status, "Accepted");
  await status(seller.access, o1.id, "Accepted").expect(409); // already processed
  await status(buyer.access, o1.id, "Cancelled").expect(409); // not pending any more

  let c = (await h.request().get("/api/crops/" + crop.id).set(h.auth(buyer.access)).expect(200)).body.data;
  assert.equal(c.cropQuantity, 6);
  assert.equal(c.cropStatus, "Available");
  const nbuyer = await h.request().get("/api/notifications").set(h.auth(buyer.access)).expect(200);
  assert.ok(nbuyer.body.data.some((n) => n.type === "order_accepted"));

  // stock re-checked on accept: two pending orders for 6 each, only one can be accepted
  const a = (await post(buyer.access, { cropId: crop.id, quantity: 6 }).expect(201)).body.data;
  const b = (await post(other.access, { cropId: crop.id, quantity: 6 }).expect(201)).body.data;
  await status(seller.access, a.id, "Accepted").expect(200);
  c = (await h.request().get("/api/crops/" + crop.id).set(h.auth(buyer.access))).body.data;
  assert.equal(c.cropQuantity, 0);
  assert.equal(c.cropStatus, "Sold");
  await status(seller.access, b.id, "Accepted").expect(409);
  await post(other.access, { cropId: crop.id, quantity: 1 }).expect(409); // sold out
  const listed = await h.request().get("/api/crops").set(h.auth(buyer.access)).expect(200);
  assert.ok(!listed.body.data.some((x) => x.id === crop.id));

  // reject + buyer cancel paths
  const crop2 = (await h.createCrop(seller.access)).body.data;
  const r1 = (await post(buyer.access, { cropId: crop2.id, quantity: 1 })).body.data;
  const rej = await status(seller.access, r1.id, "Rejected").expect(200);
  assert.equal(rej.body.data.status, "Rejected");
  const r2 = (await post(buyer.access, { cropId: crop2.id, quantity: 1 })).body.data;
  const can = await status(buyer.access, r2.id, "Cancelled").expect(200);
  assert.equal(can.body.data.status, "Cancelled");
  const filtered = await h.request().get("/api/orders/mine?role=buyer&status=Cancelled").set(h.auth(buyer.access)).expect(200);
  assert.equal(filtered.body.data.length, 1);
});

test("notifications: owner-only read/delete", async () => {
  const ns = await h.request().get("/api/notifications").set(h.auth(seller.access)).expect(200);
  const id = ns.body.data[0].id;
  await h.request().put(`/api/notifications/${id}/read`).set(h.auth(buyer.access)).expect(404);
  await h.request().delete(`/api/notifications/${id}`).set(h.auth(buyer.access)).expect(404);
  const r = await h.request().put(`/api/notifications/${id}/read`).set(h.auth(seller.access)).expect(200);
  assert.equal(r.body.data.status, "read");
  await h.request().delete(`/api/notifications/${id}`).set(h.auth(seller.access)).expect(200);
});

test("upload limits: >5MB, wrong type and >4 images are rejected", async () => {
  const mk = () => {
    let r = h.request().post("/api/crops").set(h.auth(seller.access));
    for (const [k, v] of Object.entries({ cropName: "X", cropDescription: "d", cropCategory: "Grains", cropSellingPrice: "1", cropUnit: "kg", cropQuantity: "1", grownOrganically: "true" })) r = r.field(k, v);
    return r;
  };
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
  const big = Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)]);
  await mk().attach("cropImages", big, { filename: "b.png", contentType: "image/png" }).expect(413);
  await mk().attach("cropImages", Buffer.from("hello"), { filename: "a.txt", contentType: "text/plain" }).expect(400);
  let r = mk();
  for (let i = 0; i < 5; i++) r = r.attach("cropImages", png, { filename: `${i}.png`, contentType: "image/png" });
  await r.expect(400);
});
