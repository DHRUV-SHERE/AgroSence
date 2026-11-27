"use strict";
const axios = require("axios");
const env = require("../config/env");

/** Optional in-process self ping so Render free tier does not sleep. Timer is unref'd (never blocks shutdown). */
function startSelfPing() {
  if (!env.selfPingUrl || env.isTest) return null;
  const url = `${env.selfPingUrl.replace(/\/$/, "")}/api/health`;
  const timer = setInterval(async () => {
    try {
      await axios.get(url, { timeout: 15000 });
    } catch (err) {
      console.warn(`[keepalive] ping failed: ${err.message}`);
    }
  }, env.selfPingMinutes * 60 * 1000);
  timer.unref();
  console.log(`[keepalive] self-ping every ${env.selfPingMinutes} min -> ${url}`);
  return timer;
}
module.exports = { startSelfPing };
