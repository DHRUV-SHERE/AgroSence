"use strict";
const { z, str, password, objectId } = require("../middleware/validate");

const LANGUAGES = ["English", "Hindi", "Gujarati"];
const mobile = z.string().trim().regex(/^\d{10}$/, "Mobile must be a 10-digit number");
const email = z.string().trim().toLowerCase().email("Invalid email").max(120);
const language = z.enum(LANGUAGES, { errorMap: () => ({ message: "Language must be English, Hindi or Gujarati" }) });
const httpUrl = z.string().trim().url("Must be a valid URL").max(500).refine((u) => /^https?:\/\//i.test(u), "Must be http(s) URL");
const refreshToken = z.string().min(20).max(200);

const listQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().max(40).optional(),
  q: z.string().trim().max(100).optional(),
});

const auth = {
  signup: z
    .object({
      name: str(80, 2),
      mobile,
      email,
      password,
      confirmPassword: z.string(),
      state: str(60),
      address: str(300),
      language,
    })
    .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" }),
  login: z.object({ identifier: z.string().trim().min(3).max(120), password: z.string().min(1).max(128) }),
  refresh: z.object({ refreshToken }),
  logout: z.object({ refreshToken: refreshToken.optional() }),
  updateMe: z
    .object({
      name: str(80, 2),
      email,
      mobile,
      state: str(60),
      address: str(300),
      language,
      avatar: z.union([httpUrl, z.literal("")]),
    })
    .partial()
    .extend({
      // required when email or mobile actually changes (account-takeover hardening)
      currentPassword: z.string().min(1).max(128).optional(),
      // the caller's current refresh token: kept valid when other sessions are revoked after an email change
      refreshToken: refreshToken.optional(),
    }),
  changePassword: z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: password,
    refreshToken: refreshToken.optional(),
  }),
  sendOtp: z.object({ email }),
  resetPassword: z.object({ email, otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits"), newPassword: password }),
};

const bool = z.preprocess((v) => (typeof v === "string" ? ["true", "yes", "1"].includes(v.toLowerCase()) : v), z.boolean());
const crop = {
  create: z.object({
    cropName: str(100),
    cropDescription: str(2000),
    cropCategory: str(60),
    cropSellingPrice: z.coerce.number().positive().max(10000000),
    cropUnit: str(20),
    cropQuantity: z.coerce.number().positive().max(100000000),
    grownOrganically: z.preprocess(
      (v) => (typeof v === "string" ? ["true", "yes", "1"].includes(v.toLowerCase()) : v),
      z.boolean()
    ),
  }),
  list: listQuery.extend({
    category: z.string().trim().max(60).optional(),
    organic: bool.optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    state: z.string().trim().max(60).optional(),
    status: z.enum(["Available", "Sold"]).optional(),
  }),
};
crop.update = crop.create.partial().extend({ cropStatus: z.enum(["Available", "Sold"]).optional() });

const order = {
  create: z.object({ cropId: objectId, quantity: z.coerce.number().min(0.01).max(100000000) }),
  status: z.object({ status: z.enum(["Accepted", "Rejected", "Cancelled"]) }),
  list: listQuery.extend({
    role: z.enum(["buyer", "seller"]).optional(),
    status: z.enum(["Pending", "Accepted", "Rejected", "Cancelled"]).optional(),
  }),
};

const scheme = {
  create: z.object({
    name: str(150),
    description: str(3000),
    eligibility: str(2000),
    benefits: str(2000),
    state: str(60).optional(),
    applyLink: httpUrl,
  }),
  list: listQuery.extend({ state: z.string().trim().max(60).optional() }),
};
scheme.update = scheme.create.partial();

const resource = {
  create: z.object({
    name: str(150),
    description: str(3000),
    purpose: str(1000),
    advantages: str(2000),
    popularbrand: str(300),
    howtouse: str(3000),
    link: httpUrl,
  }),
};
resource.update = resource.create.partial();

const contact = z.object({
  name: str(100, 2),
  email,
  mobile: z.union([mobile, z.literal("")]).optional(),
  address: z.string().trim().max(300).optional(),
  message: str(3000, 5),
});
const support = z.object({ name: str(100, 2), email, message: str(3000, 5) });
const chatbot = z.object({ message: str(500) });

const admin = {
  userList: listQuery.extend({ role: z.enum(["user", "moderator", "admin"]).optional(), active: bool.optional() }),
  userUpdate: z.object({ name: str(80, 2), email, mobile, state: str(60), address: str(300), language }).partial(),
  role: z.object({ role: z.enum(["user", "moderator", "admin"]) }),
  status: z.object({ active: z.boolean() }),
  ordersList: listQuery.extend({ status: z.enum(["Pending", "Accepted", "Rejected", "Cancelled"]).optional() }),
  cropsList: crop.list,
  auditList: listQuery.extend({ action: z.string().max(60).optional() }),
};

module.exports = { auth, crop, order, scheme, resource, contact, support, chatbot, admin, listQuery };
