import { Router } from "express";

import prisma from "../lib/prisma.js";

export const contactRouter = Router();

/** POST /api/contact */
contactRouter.post("/", async (req, res) => {
  const fullName = String(req.body?.fullName || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const subject = String(req.body?.subject || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!fullName || !subject || !message || fullName.length > 160 || subject.length > 200 || message.length > 5000) {
    return res.status(400).json({ error: "Full name, subject and message are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: "A valid email is required" });
  }
  try {
    const contact = await prisma.contactMessage.create({ data: { fullName, email, subject, message } });
    res.status(201).json({ id: contact.id, message: "Your message has been received." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
