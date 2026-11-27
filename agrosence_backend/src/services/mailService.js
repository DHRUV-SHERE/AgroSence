"use strict";
const nodemailer = require("nodemailer");
const axios = require("axios");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.mail.smtpHost,
      port: env.mail.smtpPort,
      secure: env.mail.smtpSecure,
      auth: { user: env.mail.smtpUser, pass: env.mail.smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporter;
}

const smtpConfigured = () => Boolean(env.mail.smtpUser && env.mail.smtpPass);
const isConfigured = () => Boolean(env.mail.resendKey || env.mail.brevoKey || smtpConfigured());

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * Single mail entry point. Provider order: Brevo HTTPS API, Resend HTTPS API (works on hosts that block SMTP, e.g. Render free),
 * then SMTP. In non-production without credentials the mail is logged to the console instead.
 */
async function sendMail({ to, subject, text, html, replyTo }) {
  const payload = { from: env.mail.from, to, subject, text, html, replyTo };
  if (env.mail.brevoKey) {
    // Brevo HTTPS API (free 300/day; a single verified sender address is enough, no domain needed).
    const m = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(env.mail.from);
    const sender = m ? { name: m[1].trim() || "AgroSence", email: m[2] } : { name: "AgroSence", email: env.mail.from };
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender,
        to: [].concat(to).map((email) => ({ email })),
        subject,
        textContent: text,
        htmlContent: html,
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      },
      { headers: { "api-key": env.mail.brevoKey, accept: "application/json" }, timeout: 15000 }
    );
    return true;
  }
  if (env.mail.resendKey) {
    await axios.post(
      "https://api.resend.com/emails",
      { from: payload.from, to: [].concat(to), subject, text, html, reply_to: replyTo },
      { headers: { Authorization: `Bearer ${env.mail.resendKey}` }, timeout: 15000 }
    );
    return true;
  }
  if (smtpConfigured()) {
    await getTransporter().sendMail(payload);
    return true;
  }
  if (!env.isProd) {
    if (!env.isTest) console.log(`[mail:dev] to=${to} subject="${subject}"\n${text || ""}`);
    return true;
  }
  throw ApiError.unavailable("Email service is not configured");
}

async function sendOtpEmail(email, otp) {
  const minutes = env.otpTtlMinutes;
  return sendMail({
    to: email,
    subject: "Your AgroSence password reset code",
    text: `Your AgroSence password reset code is ${otp}. It expires in ${minutes} minutes. If you did not request it, ignore this email.`,
    html: `<p>Your AgroSence password reset code is <b style="font-size:20px">${otp}</b>.</p><p>It expires in ${minutes} minutes. If you did not request it, you can ignore this email.</p>`,
  });
}

/** Notify the team (support / contact form). Returns false instead of throwing when `soft` is true. */
async function sendTeamMail({ subject, name, email, message, extra = "" }, { soft = false } = {}) {
  const to = env.mail.to || env.mail.smtpUser || (env.isProd ? undefined : "team@agrosence.local");
  try {
    if (!to) throw ApiError.unavailable("Team mailbox (MAIL_TO) is not configured");
    await sendMail({
      to,
      replyTo: email,
      subject,
      text: `From: ${name} (${email})\n${extra}\n${message}`,
      html: `<p><b>From:</b> ${escapeHtml(name)} (${escapeHtml(email)})</p>${extra ? `<p>${escapeHtml(extra)}</p>` : ""}<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
    return true;
  } catch (err) {
    // Never leak server configuration (missing MAIL_TO / provider) to anonymous callers: log it, return a generic error.
    console.error("[mail] team mail failed:", err.message);
    if (!soft) throw ApiError.unavailable("Could not send message right now, please try again later");
    return false;
  }
}

module.exports = { sendMail, sendOtpEmail, sendTeamMail, isConfigured };
