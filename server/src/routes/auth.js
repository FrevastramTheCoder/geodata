import { Router } from "express";
import { OAuth2Client } from "google-auth-library";

import prisma from "../lib/prisma.js";
import { recordActivity } from "../lib/activity.js";
import {
  clearSessionCookie,
  configuredRoleForEmail,
  googleAuthEnabled,
  optionalUser,
  requireUser,
  setSessionCookie,
} from "../lib/auth.js";

export const authRouter = Router();

const PUBLIC_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
};

/** GET /api/auth/config — Google OAuth availability for the login page. */
authRouter.get("/config", (_req, res) => {
  res.json({
    enabled: googleAuthEnabled(),
    googleClientId: googleAuthEnabled() ? process.env.GOOGLE_CLIENT_ID : null,
  });
});

/**
 * POST /api/auth/google
 * Verify the Google ID token server-side and create/update the portal user.
 */
authRouter.post("/google", async (req, res) => {
  if (!googleAuthEnabled()) {
    return res.status(503).json({ error: "Google OAuth is not configured on this server" });
  }

  const credential = typeof req.body?.credential === "string" ? req.body.credential : "";
  if (!credential || credential.length > 10000) {
    return res.status(400).json({ error: "A valid Google credential is required" });
  }

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified === false) {
      return res.status(401).json({ error: "Google account verification failed" });
    }

    const email = String(payload.email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { googleId: payload.sub } });
    if (existing?.status === "SUSPENDED") {
      return res.status(403).json({ error: "Your account is suspended. Contact an administrator." });
    }
    if (existing?.status === "DELETED") {
      return res.status(403).json({ error: "This account has been deleted." });
    }

    const now = new Date();
    const user = await prisma.user.upsert({
      where: { googleId: payload.sub },
      update: {
        name: String(payload.name || email.split("@")[0]).slice(0, 160),
        email,
        avatarUrl: payload.picture ? String(payload.picture).slice(0, 1000) : null,
        lastLoginAt: now,
      },
      create: {
        googleId: payload.sub,
        name: String(payload.name || email.split("@")[0]).slice(0, 160),
        email,
        avatarUrl: payload.picture ? String(payload.picture).slice(0, 1000) : null,
        role: configuredRoleForEmail(email),
        status: "ACTIVE",
        createdAt: now,
        lastLoginAt: now,
      },
      select: PUBLIC_USER_FIELDS,
    });

    setSessionCookie(res, user);
    await recordActivity({ userId: user.id, action: "LOGIN", resourceType: "AUTH" });
    res.json({ user });
  } catch (err) {
    console.error("Google authentication failed:", err.message);
    res.status(401).json({ error: "Google verification failed" });
  }
});

/** GET /api/auth/me — current logged-in user. */
authRouter.get("/me", requireUser, async (req, res) => {
  res.json(req.user);
});

/** POST /api/auth/logout — records the event and clears the HttpOnly session. */
authRouter.post("/logout", optionalUser, async (req, res) => {
  if (req.user) await recordActivity({ userId: req.user.id, action: "LOGOUT", resourceType: "AUTH" });
  clearSessionCookie(res);
  res.json({ ok: true });
});

/** DELETE /api/auth/account — anonymize the account while retaining operational records. */
authRouter.delete("/account", requireUser, async (req, res) => {
  const suffix = `${req.user.id}-${Date.now()}`;
  await prisma.$transaction([
    prisma.activityLog.create({
      data: { userId: req.user.id, action: "LOGOUT", resourceType: "ACCOUNT_DELETION" },
    }),
    prisma.submission.updateMany({ where: { userId: req.user.id }, data: { submitterName: null, submitterEmail: null } }),
    prisma.favorite.deleteMany({ where: { userId: req.user.id } }),
    prisma.recentlyViewed.deleteMany({ where: { userId: req.user.id } }),
    prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: "Deleted user",
        email: `deleted+${suffix}@redacted.invalid`,
        googleId: `deleted-${suffix}`,
        avatarUrl: null,
        status: "DELETED",
        lastLoginAt: null,
      },
    }),
  ]);
  clearSessionCookie(res);
  res.json({ ok: true });
});
