"use strict";
const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const make = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.isTest && !process.env.TEST_RATE_LIMIT,
    handler: (req, res) => res.status(429).json({ success: false, message }),
  });

const MIN = 60 * 1000;
module.exports = {
  global: make(15 * MIN, 600, "Too many requests, please slow down"),
  login: make(15 * MIN, 20, "Too many login attempts, please try again in a few minutes"),
  signup: make(60 * MIN, 20, "Too many sign-up attempts, please try again later"),
  otp: make(15 * MIN, 8, "Too many OTP requests, please try again later"),
  contact: make(60 * MIN, 8, "Too many messages sent, please try again later"),
  // anonymous callers (keyed by IP) get a much lower budget than signed-in users (keyed by user id)
  chatbotAnon: rateLimit({
    windowMs: 10 * MIN,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => Boolean(req.user) || (env.isTest && !process.env.TEST_RATE_LIMIT),
    handler: (req, res) => res.status(429).json({ success: false, message: "Chatbot rate limit reached, please sign in or wait a little" }),
  }),
  chatbotAuthed: rateLimit({
    windowMs: 10 * MIN,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `user:${req.user && req.user.id}`,
    skip: (req) => !req.user || (env.isTest && !process.env.TEST_RATE_LIMIT),
    handler: (req, res) => res.status(429).json({ success: false, message: "Chatbot rate limit reached, please wait a little" }),
  }),
  orders: make(15 * MIN, 30, "Too many orders placed, please slow down"),
  // /health is hit by the external keep-alive cron (~1 per 10 min); this only stops abuse of the DB read
  health: make(15 * MIN, 120, "Too many health checks"),
  upload: make(60 * MIN, 30, "Too many uploads, please try again later"),
  refresh: make(15 * MIN, 60, "Too many token refreshes"),
};
