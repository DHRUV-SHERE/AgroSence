"use strict";
const mongoose = require("mongoose");
const env = require("./env");

mongoose.set("strictQuery", true);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let closing = false;

/** Connect once (throws on failure). */
async function connectOnce(uri = env.mongoUri) {
  await mongoose.connect(uri, {
    maxPoolSize: env.mongoMaxPool,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxIdleTimeMS: 60000,
  });
}

/** Connect with exponential backoff; never kills the process so /api/health can report the state. */
async function connectWithRetry(uri = env.mongoUri, onConnected) {
  let attempt = 0;
  while (!closing) {
    try {
      attempt += 1;
      await connectOnce(uri);
      console.log("[db] MongoDB connected");
      if (onConnected) await onConnected();
      return true;
    } catch (err) {
      const delay = Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));
      console.error(`[db] connection attempt ${attempt} failed: ${err.message}. Retrying in ${delay / 1000}s`);
      await sleep(delay);
    }
  }
  return false;
}

async function disconnect() {
  closing = true;
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

const isConnected = () => mongoose.connection.readyState === 1;

module.exports = { connectOnce, connectWithRetry, disconnect, isConnected };
