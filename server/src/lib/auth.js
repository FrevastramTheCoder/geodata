/**
 * Authentication helpers for Google-backed portal sessions.
 *
 * Sessions are signed and stored in an HttpOnly cookie. A bearer token is
 * still accepted for API clients, but the browser never needs to persist it.
 */

import crypto from "node:crypto";

import prisma from "./prisma.js";

const SESSION_COOKIE = "tgdh_session";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_SECRET || (
  process.env.NODE_ENV === "production" ? "" : "local-development-session-secret-change-me"
);

if (process.env.NODE_ENV === "production" && !SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be configured in production");
}

function signPayload(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function readPayload(token) {
  try {
    const [body, signature] = String(token || "").split(".");
    if (!body || !signature) return null;
    const expected = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(body)
      .digest("base64url");
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.userId || payload.role !== "user" || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function cookiesFromRequest(req) {
  return String(req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim().split("="))
    .filter(([name, value]) => name && value)
    .reduce((cookies, [name, ...value]) => {
      cookies[name] = decodeURIComponent(value.join("="));
      return cookies;
    }, {});
}

export function getSessionToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return cookiesFromRequest(req)[SESSION_COOKIE] || "";
}

export function createUserToken(user) {
  return signPayload({
    role: "user",
    userId: user.id,
    exp: Date.now() + TOKEN_TTL_MS,
  });
}

export function verifyUserToken(token) {
  return readPayload(token);
}

export function setSessionCookie(res, user) {
  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(createUserToken(user))}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(TOKEN_TTL_MS / 1000)}`,
  ];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

export function clearSessionCookie(res) {
  const attributes = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

function safeUser(user) {
  if (!user) return null;
  const { googleId: _googleId, ...publicUser } = user;
  return publicUser;
}

/** Require an active Google-authenticated portal user. */
export function requireUser(req, res, next) {
  const payload = verifyUserToken(getSessionToken(req));
  if (!payload) return res.status(401).json({ error: "Authentication required" });

  prisma.user
    .findUnique({ where: { id: payload.userId } })
    .then((user) => {
      if (!user || user.status !== "ACTIVE") {
        return res.status(user?.status === "SUSPENDED" ? 403 : 401).json({
          error: user?.status === "SUSPENDED" ? "Account suspended" : "Authentication required",
        });
      }
      req.user = safeUser(user);
      next();
    })
    .catch(next);
}

/** Attach an active user when a request has a valid session, without requiring one. */
export function optionalUser(req, _res, next) {
  const payload = verifyUserToken(getSessionToken(req));
  if (!payload) return next();
  prisma.user
    .findUnique({ where: { id: payload.userId } })
    .then((user) => {
      if (user?.status === "ACTIVE") req.user = safeUser(user);
      next();
    })
    .catch(() => next());
}

/** Require an authenticated administrator for every admin API operation. */
export function requireAdminRole(req, res, next) {
  if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
    return res.status(403).json({ error: "Administrator access required" });
  }
  next();
}

/** Only a super administrator may perform privileged administration actions. */
export function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Super administrator access required" });
  }
  next();
}

export function googleAuthEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID);
}

export function configuredRoleForEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const superAdmins = String(process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const admins = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (superAdmins.includes(normalized)) return "SUPER_ADMIN";
  if (admins.includes(normalized)) return "ADMIN";
  return "USER";
}

// Kept as an explicit failure instead of retaining a password backdoor.
export function checkPassword() {
  return false;
}
